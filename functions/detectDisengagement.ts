import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await req.json();
    const targetEmail = user_email || user.email;

    // Fetch user's enrollments and progress
    const enrollments = await base44.asServiceRole.entities.Enrollment.filter({ 
      student_email: targetEmail 
    });

    const disengagementAnalysis = [];

    const calculateDisengagement = (enrollment, daysSinceActivity, completionRate) => {
      const scoringRules = [
        { condition: daysSinceActivity > 14, points: 40, trigger: 'inactivity' },
        { condition: daysSinceActivity > 7, points: 25, trigger: 'declining_engagement' },
        { condition: daysSinceActivity > 3, points: 10 },
        { condition: completionRate < 20 && daysSinceActivity > 7, points: 30, trigger: 'incomplete_lessons' },
        { condition: completionRate < 50 && daysSinceActivity > 14, points: 20, trigger: 'incomplete_lessons' },
        { condition: enrollment.missed_deadlines > 0, points: 20, trigger: 'missed_deadlines' }
      ];

      let score = 0;
      const triggers = [];

      scoringRules.forEach(rule => {
        if (rule.condition) {
          score += rule.points;
          if (rule.trigger) triggers.push(rule.trigger);
        }
      });

      // Quiz scoring
      if (enrollment.quiz_scores?.length > 0) {
        const avgScore = enrollment.quiz_scores.reduce((a, b) => a + b, 0) / enrollment.quiz_scores.length;
        if (avgScore < 60) {
          score += 30;
          triggers.push('low_quiz_scores');
        } else if (avgScore < 75) score += 15;
      }

      return { score, triggers: [...new Set(triggers)] };
    };

    for (const enrollment of enrollments) {
      const lastActivity = enrollment.last_activity_date 
        ? new Date(enrollment.last_activity_date) 
        : new Date(enrollment.created_date);
      const daysSinceActivity = Math.floor((Date.now() - lastActivity) / 86400000);
      const completionRate = enrollment.progress_percentage || 0;

      const { score, triggers } = calculateDisengagement(enrollment, daysSinceActivity, completionRate);

      if (score >= 30) {
        const course = await base44.asServiceRole.entities.Course.get(enrollment.course_id);
        disengagementAnalysis.push({
          course_id: enrollment.course_id,
          course_title: course?.title || 'Course',
          disengagement_score: score,
          days_since_activity: daysSinceActivity,
          completion_rate: completionRate,
          trigger_reasons: triggers,
          primary_trigger: triggers[0] || 'inactivity'
        });
      }
    }

    // Sort by disengagement score (highest first)
    disengagementAnalysis.sort((a, b) => b.disengagement_score - a.disengagement_score);

    return Response.json({
      user_email: targetEmail,
      at_risk_courses: disengagementAnalysis,
      overall_risk: disengagementAnalysis.length > 0 
        ? Math.min(100, Math.max(...disengagementAnalysis.map(a => a.disengagement_score)))
        : 0,
      needs_intervention: disengagementAnalysis.some(a => a.disengagement_score >= 60)
    });

  } catch (error) {
    console.error('Disengagement detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
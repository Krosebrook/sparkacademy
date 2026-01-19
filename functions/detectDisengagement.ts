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

    for (const enrollment of enrollments) {
      // Calculate days since last activity
      const lastActivity = enrollment.last_activity_date 
        ? new Date(enrollment.last_activity_date) 
        : new Date(enrollment.created_date);
      const daysSinceActivity = Math.floor(
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get course details
      const course = await base44.asServiceRole.entities.Course.get(enrollment.course_id);
      
      // Calculate completion rate
      const completionRate = enrollment.progress_percentage || 0;
      
      // Calculate disengagement score
      let disengagementScore = 0;
      let triggerReasons = [];

      // Inactivity scoring (0-40 points)
      if (daysSinceActivity > 14) {
        disengagementScore += 40;
        triggerReasons.push('inactivity');
      } else if (daysSinceActivity > 7) {
        disengagementScore += 25;
        triggerReasons.push('declining_engagement');
      } else if (daysSinceActivity > 3) {
        disengagementScore += 10;
      }

      // Low progress scoring (0-30 points)
      if (completionRate < 20 && daysSinceActivity > 7) {
        disengagementScore += 30;
        triggerReasons.push('incomplete_lessons');
      } else if (completionRate < 50 && daysSinceActivity > 14) {
        disengagementScore += 20;
        triggerReasons.push('incomplete_lessons');
      }

      // Quiz performance (0-30 points)
      if (enrollment.quiz_scores && enrollment.quiz_scores.length > 0) {
        const avgScore = enrollment.quiz_scores.reduce((a, b) => a + b, 0) / enrollment.quiz_scores.length;
        if (avgScore < 60) {
          disengagementScore += 30;
          triggerReasons.push('low_quiz_scores');
        } else if (avgScore < 75) {
          disengagementScore += 15;
        }
      }

      // Missed deadlines (if applicable)
      if (enrollment.missed_deadlines && enrollment.missed_deadlines > 0) {
        disengagementScore += 20;
        triggerReasons.push('missed_deadlines');
      }

      // Only add if disengagement is significant
      if (disengagementScore >= 30) {
        disengagementAnalysis.push({
          course_id: enrollment.course_id,
          course_title: course?.title || 'Course',
          disengagement_score: disengagementScore,
          days_since_activity: daysSinceActivity,
          completion_rate: completionRate,
          trigger_reasons: triggerReasons,
          primary_trigger: triggerReasons[0] || 'inactivity'
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
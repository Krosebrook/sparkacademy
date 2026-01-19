import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();

    const [enrollments, course] = await Promise.all([
      base44.asServiceRole.entities.Enrollment.filter({ course_id }),
      base44.asServiceRole.entities.Course.get(course_id)
    ]);

    // Calculate metrics
    const totalStudents = enrollments.length;
    const avgCompletion = enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / totalStudents || 0;
    const completedCount = enrollments.filter(e => e.completion_percentage === 100).length;
    const completionRate = Math.round((completedCount / totalStudents) * 100) || 0;

    // Identify at-risk students (no activity in 7+ days, < 30% progress)
    const now = new Date();
    const atRiskStudents = enrollments
      .filter(e => {
        const daysSinceActivity = e.last_activity_date 
          ? Math.floor((now - new Date(e.last_activity_date)) / (1000 * 60 * 60 * 24))
          : 999;
        return daysSinceActivity >= 7 || (e.completion_percentage || 0) < 30;
      })
      .map(e => ({
        name: e.student_email,
        days_since_last_activity: e.last_activity_date 
          ? Math.floor((now - new Date(e.last_activity_date)) / (1000 * 60 * 60 * 24))
          : 999,
        risk_level: (e.completion_percentage || 0) < 20 ? 'High' : 'Medium',
        reason: `${e.completion_percentage || 0}% complete, inactive for ${e.last_activity_date ? Math.floor((now - new Date(e.last_activity_date)) / (1000 * 60 * 60 * 24)) : 'many'} days`
      }))
      .slice(0, 10);

    // Mock engagement timeline (last 8 weeks)
    const engagementTimeline = Array.from({ length: 8 }, (_, i) => ({
      week: `Week ${i + 1}`,
      engagement: Math.round(60 + Math.random() * 30)
    }));

    // Mock topic performance
    const topicPerformance = (course?.lessons || []).slice(0, 6).map(lesson => ({
      topic: lesson.title,
      completion_rate: Math.round(50 + Math.random() * 40),
      confusion_score: Math.round(20 + Math.random() * 30)
    }));

    return Response.json({
      total_students: totalStudents,
      avg_engagement: Math.round(avgCompletion),
      completion_rate: completionRate,
      at_risk_count: atRiskStudents.length,
      at_risk_students: atRiskStudents,
      engagement_timeline: engagementTimeline,
      topic_performance: topicPerformance
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();

    // Fetch engagement data for the course
    const engagements = await base44.asServiceRole.entities.AIContentEngagement.filter({ course_id });
    const revisions = await base44.asServiceRole.entities.AIContentRevision.filter({ course_id });

    // Calculate analytics
    const contentTypeEngagement = {};
    const strugglingStudents = [];
    const contentPerformance = {};

    engagements.forEach(eng => {
      if (!contentTypeEngagement[eng.content_type]) {
        contentTypeEngagement[eng.content_type] = {
          total_students: 0,
          avg_completion: 0,
          avg_time_spent: 0,
          avg_score: 0,
          struggle_count: 0
        };
      }

      const ct = contentTypeEngagement[eng.content_type];
      ct.total_students++;
      ct.avg_completion += eng.engagement_metrics?.completion_percentage || 0;
      ct.avg_time_spent += eng.engagement_metrics?.time_spent_minutes || 0;
      
      if (eng.performance_metrics?.quiz_score) {
        ct.avg_score += eng.performance_metrics.quiz_score;
      }

      if (eng.struggle_indicators?.length > 0) {
        ct.struggle_count++;
        strugglingStudents.push({
          student_email: eng.student_email,
          content_type: eng.content_type,
          struggles: eng.struggle_indicators
        });
      }
    });

    // Calculate averages
    Object.keys(contentTypeEngagement).forEach(type => {
      const ct = contentTypeEngagement[type];
      const count = ct.total_students;
      ct.avg_completion = count > 0 ? ct.avg_completion / count : 0;
      ct.avg_time_spent = count > 0 ? ct.avg_time_spent / count : 0;
      ct.avg_score = count > 0 ? ct.avg_score / count : 0;
      ct.struggle_rate = count > 0 ? (ct.struggle_count / count) * 100 : 0;
    });

    // Analyze revisions effectiveness
    revisions.forEach(rev => {
      if (!contentPerformance[rev.content_type]) {
        contentPerformance[rev.content_type] = {
          revisions_count: 0,
          avg_effectiveness: 0,
          student_feedback_avg: 0
        };
      }
      
      const cp = contentPerformance[rev.content_type];
      cp.revisions_count++;
      cp.avg_effectiveness += rev.effectiveness_score || 0;
      cp.student_feedback_avg += rev.student_feedback_count || 0;
    });

    return Response.json({
      overview: {
        total_students: engagements.length,
        content_types_used: Object.keys(contentTypeEngagement).length,
        total_revisions: revisions.length,
        avg_engagement_rate: Object.values(contentTypeEngagement).reduce((sum, ct) => sum + ct.avg_completion, 0) / Object.keys(contentTypeEngagement).length
      },
      content_type_breakdown: contentTypeEngagement,
      struggling_students: strugglingStudents.slice(0, 20),
      content_performance: contentPerformance,
      recommendations: generateRecommendations(contentTypeEngagement, strugglingStudents)
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateRecommendations(engagement, struggles) {
  const recommendations = [];

  Object.entries(engagement).forEach(([type, metrics]) => {
    if (metrics.avg_completion < 50) {
      recommendations.push({
        priority: 'high',
        content_type: type,
        issue: 'Low completion rate',
        suggestion: `Review ${type} content - consider breaking it into smaller sections or adding more interactive elements`
      });
    }

    if (metrics.struggle_rate > 30) {
      recommendations.push({
        priority: 'high',
        content_type: type,
        issue: 'High struggle rate',
        suggestion: `${type} may be too difficult - consider adding more examples, hints, or prerequisite materials`
      });
    }

    if (metrics.avg_score < 60 && metrics.avg_score > 0) {
      recommendations.push({
        priority: 'medium',
        content_type: type,
        issue: 'Low assessment scores',
        suggestion: `Refine ${type} difficulty or provide additional study materials`
      });
    }
  });

  return recommendations;
}
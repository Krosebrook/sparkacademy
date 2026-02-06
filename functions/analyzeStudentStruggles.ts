import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();

    // Get all engagement metrics for this course
    const allMetrics = await base44.asServiceRole.entities.CourseEngagementMetrics.filter({ course_id: courseId });

    // Aggregate struggle data
    const strugglesByLesson = {};
    const lowQuizScores = [];
    const lowEngagement = [];

    allMetrics.forEach(metric => {
      // Analyze struggles
      metric.struggle_indicators?.forEach(struggle => {
        if (!strugglesByLesson[struggle.lesson_id]) {
          strugglesByLesson[struggle.lesson_id] = [];
        }
        strugglesByLesson[struggle.lesson_id].push(struggle);
      });

      // Low quiz scores
      const avgQuizScore = metric.quiz_performance?.length > 0
        ? metric.quiz_performance.reduce((sum, q) => sum + q.score, 0) / metric.quiz_performance.length
        : 0;
      
      if (avgQuizScore < 70 && metric.quiz_performance?.length > 0) {
        lowQuizScores.push({
          student: metric.student_email,
          avgScore: avgQuizScore,
          quizCount: metric.quiz_performance.length
        });
      }

      // Low engagement
      const daysSinceActivity = metric.last_activity_date 
        ? Math.floor((Date.now() - new Date(metric.last_activity_date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysSinceActivity > 7) {
        lowEngagement.push({
          student: metric.student_email,
          daysSinceActivity,
          progress: metric.progress_percentage
        });
      }
    });

    // Generate AI insights
    const prompt = `Analyze these student struggle patterns and provide actionable insights:

Struggles by Lesson: ${JSON.stringify(strugglesByLesson)}
Students with Low Quiz Scores: ${lowQuizScores.length}
Low Engagement Students: ${lowEngagement.length}
Total Students: ${allMetrics.length}

Provide:
1. Top 3 lessons where students struggle most
2. Common struggle patterns
3. Specific recommendations to improve course content
4. Intervention strategies for struggling students`;

    const insights = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          problem_lessons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                lesson_id: { type: 'string' },
                struggle_count: { type: 'number' },
                common_issues: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' }
          },
          intervention_strategies: {
            type: 'array',
            items: { type: 'string' }
          },
          summary: { type: 'string' }
        }
      }
    });

    return Response.json({
      struggleAnalysis: {
        problemLessons: insights.problem_lessons,
        lowQuizScores,
        lowEngagement,
        totalStudents: allMetrics.length
      },
      aiInsights: {
        recommendations: insights.recommendations,
        interventions: insights.intervention_strategies,
        summary: insights.summary
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
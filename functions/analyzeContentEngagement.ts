/**
 * Analyze Content Engagement & Performance
 * AI-powered analysis of course content to identify:
 * - Engagement drop-off points
 * - High-interest topics
 * - Common confusion areas
 * - Content improvement opportunities
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role !== 'admin' && !user?.role === 'creator') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { course_id } = await req.json();

    if (!course_id) {
      return Response.json({ error: 'course_id required' }, { status: 400 });
    }

    // Fetch course and engagement data
    const course = await base44.entities.Course.filter({ id: course_id });
    const enrollments = await base44.entities.Enrollment.filter({ course_id });
    const discussions = await base44.entities.CourseDiscussion.filter({ course_id });
    const feedback = await base44.entities.CourseFeedback.filter({ course_id });

    // Calculate lesson-level metrics
    const lessons = course[0]?.lessons || [];
    const lessonMetrics = lessons.map((lesson, idx) => {
      const lessonEnrollments = enrollments.filter(e => {
        const lastLessonViewed = e.last_lesson_viewed || 0;
        return lastLessonViewed >= idx;
      });

      const completedLesson = enrollments.filter(e => {
        const lessonsCompleted = e.lessons_completed || [];
        return lessonsCompleted.includes(idx);
      });

      const discussionsForLesson = discussions.filter(d => 
        d.lesson_order === idx
      );

      return {
        lesson_order: idx,
        lesson_title: lesson.title,
        views: lessonEnrollments.length,
        completion_rate: enrollments.length > 0 
          ? (completedLesson.length / enrollments.length) * 100 
          : 0,
        drop_off_rate: lessonEnrollments.length > 0
          ? ((lessonEnrollments.length - completedLesson.length) / lessonEnrollments.length) * 100
          : 0,
        discussion_count: discussionsForLesson.length,
        avg_time_spent_minutes: lesson.estimated_duration || 0,
        engagement_score: 0 // Will be calculated below
      };
    });

    // Calculate engagement scores
    lessonMetrics.forEach(metric => {
      const completionScore = metric.completion_rate * 0.4;
      const discussionScore = Math.min((metric.discussion_count / enrollments.length) * 100, 40);
      const dropOffScore = (100 - metric.drop_off_rate) * 0.2;
      metric.engagement_score = completionScore + discussionScore + dropOffScore;
    });

    // Identify key patterns
    const lowEngagementLessons = lessonMetrics.filter(m => m.engagement_score < 40);
    const highEngagementLessons = lessonMetrics.filter(m => m.engagement_score > 80);
    const highDropOffLessons = lessonMetrics.filter(m => m.drop_off_rate > 30);

    // Analyze feedback for confusion topics
    const confusionTopics = feedback
      .filter(f => f.rating <= 3)
      .map(f => f.feedback_text)
      .slice(0, 5);

    // Generate AI insights
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this course's engagement data and provide actionable recommendations.

Course: ${course[0]?.title}
Total Enrollments: ${enrollments.length}
Completed: ${enrollments.filter(e => e.completion_percentage === 100).length}

Lesson Metrics:
${lessonMetrics.map(m => 
  `- ${m.lesson_title}: ${m.completion_rate.toFixed(1)}% completion, ${m.drop_off_rate.toFixed(1)}% drop-off, ${m.engagement_score.toFixed(1)} engagement score`
).join('\n')}

Low Engagement Lessons: ${lowEngagementLessons.map(l => l.lesson_title).join(', ') || 'None'}
High Engagement Lessons: ${highEngagementLessons.map(l => l.lesson_title).join(', ') || 'None'}
Common Confusion Topics: ${confusionTopics.join(', ') || 'None identified'}

Provide:
1. Top 3 content improvements needed
2. Recommendations for each low-engagement lesson
3. Best practices from high-engagement lessons to replicate
4. Specific action items with priority`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_health_score: { type: "number" },
          summary: { type: "string" },
          improvements_needed: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lesson: { type: "string" },
                issue: { type: "string" },
                priority: { type: "string" },
                recommendation: { type: "string" },
                expected_impact: { type: "string" }
              }
            }
          },
          best_practices: {
            type: "array",
            items: { type: "string" }
          },
          action_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                estimated_time: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      lesson_metrics: lessonMetrics,
      analysis,
      engagement_summary: {
        total_enrollments: enrollments.length,
        completion_rate: enrollments.length > 0
          ? (enrollments.filter(e => e.completion_percentage === 100).length / enrollments.length) * 100
          : 0,
        avg_engagement_score: lessonMetrics.reduce((sum, m) => sum + m.engagement_score, 0) / lessonMetrics.length,
        low_engagement_count: lowEngagementLessons.length,
        high_engagement_count: highEngagementLessons.length
      }
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
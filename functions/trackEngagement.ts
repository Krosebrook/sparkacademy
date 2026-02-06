import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, engagementType, data } = await req.json();

    // Find or create engagement metrics
    const existing = await base44.entities.CourseEngagementMetrics.filter({
      course_id: courseId,
      student_email: user.email
    });

    let metrics = existing[0] || {
      course_id: courseId,
      student_email: user.email,
      video_watch_time: { total_minutes: 0, videos_completed: [] },
      quiz_performance: [],
      forum_participation: { posts_created: 0, replies_made: 0, questions_asked: 0 },
      struggle_indicators: [],
      ai_tutor_interactions: [],
      progress_percentage: 0
    };

    // Update based on engagement type
    switch (engagementType) {
      case 'video_watch':
        metrics.video_watch_time.total_minutes += data.minutes || 0;
        metrics.video_watch_time.last_watched = new Date().toISOString();
        if (data.videoId && !metrics.video_watch_time.videos_completed.includes(data.videoId)) {
          metrics.video_watch_time.videos_completed.push(data.videoId);
        }
        break;

      case 'quiz_complete':
        metrics.quiz_performance.push({
          quiz_id: data.quizId,
          score: data.score,
          attempts: data.attempts || 1,
          time_spent_minutes: data.timeSpent || 0,
          completed_date: new Date().toISOString()
        });
        
        // Detect struggles
        if (data.score < 60) {
          metrics.struggle_indicators.push({
            lesson_id: data.lessonId,
            issue_type: 'low_quiz_score',
            severity: data.score < 40 ? 'high' : 'medium',
            detected_date: new Date().toISOString(),
            details: `Quiz score: ${data.score}%`
          });
        }
        break;

      case 'forum_activity':
        if (data.activityType === 'post') metrics.forum_participation.posts_created++;
        if (data.activityType === 'reply') metrics.forum_participation.replies_made++;
        if (data.activityType === 'question') metrics.forum_participation.questions_asked++;
        metrics.forum_participation.last_activity = new Date().toISOString();
        break;

      case 'ai_tutor':
        metrics.ai_tutor_interactions.push({
          timestamp: new Date().toISOString(),
          question: data.question,
          lesson_context: data.lessonContext,
          helpful: data.helpful
        });
        break;

      case 'progress_update':
        metrics.progress_percentage = data.progressPercentage;
        break;
    }

    metrics.last_activity_date = new Date().toISOString();

    // Save or update
    if (existing[0]) {
      await base44.entities.CourseEngagementMetrics.update(existing[0].id, metrics);
    } else {
      await base44.entities.CourseEngagementMetrics.create(metrics);
    }

    return Response.json({ success: true, metrics });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
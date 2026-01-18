/**
 * Detect Power-User Signals
 * Analyzes learning behavior to identify power-user readiness
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch retention and power user states
    const [retentionStates, powerUserStates, enrollments] = await Promise.all([
      base44.entities.RetentionState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.PowerUserState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.Enrollment?.filter({ student_email: user.email }).catch(() => [])
    ]);

    if (!retentionStates?.length) {
      return Response.json({ error: 'Retention state not found' }, { status: 404 });
    }

    const retention = retentionStates[0];
    let powerUser = powerUserStates?.[0];

    // Calculate learning signals
    const coursesCompleted = enrollments.filter(e => e.status === 'completed').length;
    const activeEnrollments = enrollments.filter(e => e.status === 'in_progress').length;
    const studySessionsCount = enrollments.reduce((sum, e) => sum + (e.lessons_completed || 0), 0);
    const communityInteractions = retention.compounding_actions?.community_posts_count || 0;
    const contentCreated = 0; // Would track from course creation
    const consecutiveWeeks = retention.engagement_metrics?.consecutive_weeks_active || 0;

    const signals = {
      courses_completed_count: coursesCompleted,
      active_enrollments_count: activeEnrollments,
      study_sessions_count: studySessionsCount,
      community_interactions_count: communityInteractions,
      content_created_count: contentCreated,
      consecutive_weeks_active: consecutiveWeeks
    };

    // Compute individual signal scores (0-100)
    const learningScore = Math.min(100, (coursesCompleted * 20) + (activeEnrollments * 10));
    const masteryScore = Math.min(100, studySessionsCount * 5);
    const communityScore = Math.min(100, communityInteractions * 15);
    const consistencyScore = Math.min(100, consecutiveWeeks * 25);

    // Composite power-user score (weighted average)
    const overallScore = Math.round(
      (learningScore * 0.35) + 
      (masteryScore * 0.35) + 
      (communityScore * 0.20) + 
      (consistencyScore * 0.10)
    );

    // Determine power-user status
    let powerUserStatus = 'emerging';
    if (overallScore >= 70) powerUserStatus = 'power_user';
    else if (overallScore >= 50) powerUserStatus = 'recognized';

    // Create or update power-user state
    if (!powerUser) {
      powerUser = await base44.entities.PowerUserState?.create({
        user_email: user.email,
        power_user_status: powerUserStatus,
        power_user_signals: {
          ...signals,
          signal_scores: {
            learning_momentum_score: learningScore,
            mastery_engagement_score: masteryScore,
            community_engagement_score: communityScore,
            overall_power_user_score: overallScore
          },
          last_signal_update_date: new Date().toISOString()
        },
        created_date: new Date().toISOString()
      }).catch(() => null);
    } else {
      powerUser = await base44.entities.PowerUserState?.update(powerUser.id, {
        power_user_status: powerUserStatus,
        power_user_signals: {
          ...signals,
          signal_scores: {
            learning_momentum_score: learningScore,
            mastery_engagement_score: masteryScore,
            community_engagement_score: communityScore,
            overall_power_user_score: overallScore
          },
          last_signal_update_date: new Date().toISOString()
        },
        last_updated_date: new Date().toISOString()
      }).catch(() => powerUser);
    }

    return Response.json({
      success: true,
      power_user_status: powerUserStatus,
      signals: {
        learning_score: learningScore,
        mastery_score: masteryScore,
        community_score: communityScore,
        overall_score: overallScore
      },
      thresholds: {
        tier_1_ready: learningScore >= 40,
        tier_2_ready: masteryScore >= 40,
        tier_3_ready: communityScore >= 40,
        premium_ready: overallScore >= 70
      }
    });
  } catch (error) {
    console.error('Power-user signal detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
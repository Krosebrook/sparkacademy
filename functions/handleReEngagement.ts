/**
 * Handle Re-Engagement
 * Intelligently re-engages inactive users with value-first messages
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch retention state
    const retentionStates = await base44.entities.RetentionState?.filter({
      user_email: user.email
    }).catch(() => []);

    if (!retentionStates?.length) {
      return Response.json({ error: 'Retention state not found' }, { status: 404 });
    }

    const retention = retentionStates[0];
    const inactivityDays = retention.engagement_metrics?.days_since_last_action || 0;
    const lastReengagementDate = retention.reengagement_state?.last_reengagement_attempt_date;
    const now = new Date();

    // Check if re-engagement is suppressed
    if (retention.reengagement_state?.suppressed_until_date) {
      const suppressedUntil = new Date(retention.reengagement_state.suppressed_until_date);
      if (now < suppressedUntil) {
        return Response.json({
          success: false,
          reason: 'Re-engagement suppressed',
          suppressed_until: retention.reengagement_state.suppressed_until_date
        });
      }
    }

    // Determine re-engagement message based on inactivity duration
    const reengagementMessages = {
      day_3: {
        headline: 'New opportunities matched to your preferences',
        message: '3 deals moved this week — they match your criteria and might interest you',
        cta_text: 'See What\'s New',
        cta_url: '/deals?weekly_digest=true'
      },
      day_7: {
        headline: 'Your portfolio is waiting for you',
        message: 'We\'ve refined our recommendations based on your activity. Here\'s your top opportunity this week.',
        cta_text: 'Explore Now',
        cta_url: '/deals?top_match=true'
      },
      day_14: {
        headline: 'We\'ve learned your preferences',
        message: 'After analyzing your saves and views, our AI got much better at matching deals to your goals. Come see the difference.',
        cta_text: 'See Smarter Matches',
        cta_url: '/deals?ai_refined=true'
      },
      day_21: {
        headline: 'Your community is discussing something relevant',
        message: 'New discussion from experts in your network about deals similar to ones you\'ve saved.',
        cta_text: 'Join Discussion',
        cta_url: '/community?trending=true'
      }
    };

    let selectedMessage = null;
    let messageKey = null;

    if (inactivityDays >= 21) {
      messageKey = 'day_21';
      selectedMessage = reengagementMessages.day_21;
    } else if (inactivityDays >= 14) {
      messageKey = 'day_14';
      selectedMessage = reengagementMessages.day_14;
    } else if (inactivityDays >= 7) {
      messageKey = 'day_7';
      selectedMessage = reengagementMessages.day_7;
    } else if (inactivityDays >= 3) {
      messageKey = 'day_3';
      selectedMessage = reengagementMessages.day_3;
    } else {
      return Response.json({
        success: false,
        reason: 'Not enough inactivity to trigger re-engagement'
      });
    }

    // Check if we've already sent this message recently
    const daysSinceLastAttempt = lastReengagementDate 
      ? Math.floor((now - new Date(lastReengagementDate)) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastAttempt < 7) {
      return Response.json({
        success: false,
        reason: 'Re-engagement too frequent',
        days_until_next_eligible: 7 - daysSinceLastAttempt
      });
    }

    // Record re-engagement attempt
    const updatedState = {
      'reengagement_state.last_reengagement_attempt_date': new Date().toISOString(),
      'reengagement_state.reengagement_attempts_count': (retention.reengagement_state?.reengagement_attempts_count || 0) + 1,
      'engagement_metrics.days_since_last_action': inactivityDays
    };

    await base44.entities.RetentionState?.update(retention.id, updatedState).catch(() => {});

    return Response.json({
      success: true,
      reengagement_message: {
        ...selectedMessage,
        inactivity_days: inactivityDays,
        message_type: messageKey
      },
      should_send: true
    });
  } catch (error) {
    console.error('Re-engagement handling error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
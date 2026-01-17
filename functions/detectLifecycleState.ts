/**
 * Detect Lifecycle State
 * Determines user's current lifecycle stage based on signals
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch related states
    const [retentionStates, activationStates, powerUserStates, lifecycleStates] = await Promise.all([
      base44.entities.RetentionState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.ActivationState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.PowerUserState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.LifecycleState?.filter({ user_email: user.email }).catch(() => [])
    ]);

    const retention = retentionStates?.[0];
    const activation = activationStates?.[0];
    const powerUser = powerUserStates?.[0];
    let lifecycle = lifecycleStates?.[0];

    if (!retention) {
      return Response.json({ error: 'Retention state not found' }, { status: 404 });
    }

    // Extract engagement metrics
    const engagement = retention.engagement_metrics || {};
    const sessions7d = engagement.weekly_visits || 0;
    const actions7d = engagement.weekly_actions || 0;
    const daysSinceLastAction = engagement.days_since_last_action || 999;
    const consecutiveWeeksActive = engagement.consecutive_weeks_active || 0;
    const activationPath = activation?.activation_path;
    const coreAchieved = activation?.milestones?.core_milestone_achieved;

    // Calculate engagement trend (14-day vs 7-day)
    const sessionsChange = ((sessions7d - (engagement.sessions_14days || 0)) / Math.max(1, engagement.sessions_14days || 1)) * 100;
    const trendDirection = sessionsChange > 10 ? 'increasing' : sessionsChange < -10 ? 'declining' : 'stable';

    // State logic
    let newState = 'new';
    let triggerReason = 'initial';

    // NEW: Just signed up, <1 week
    if (!coreAchieved && daysSinceLastAction < 7) {
      newState = 'new';
      triggerReason = 'onboarding_in_progress';
    }
    // ACTIVATED: Core milestone achieved
    else if (coreAchieved && consecutiveWeeksActive < 2) {
      newState = 'activated';
      triggerReason = 'core_milestone_hit';
    }
    // POWER_USER: Unlocked capabilities + high engagement
    else if (powerUser?.unlocked_capabilities && Object.values(powerUser.unlocked_capabilities).some(v => v) && sessions7d >= 4) {
      newState = 'power_user';
      triggerReason = 'capability_unlock_and_sustained_engagement';
    }
    // ENGAGED: 2+ weeks active, 2+ sessions/week, stable/increasing
    else if (consecutiveWeeksActive >= 2 && sessions7d >= 2 && (trendDirection === 'stable' || trendDirection === 'increasing')) {
      newState = 'engaged';
      triggerReason = 'sustained_engagement';
    }
    // AT-RISK: Engagement dropped 40%+ over 14 days
    else if (sessionsChange < -40 && consecutiveWeeksActive >= 2) {
      newState = 'at_risk';
      triggerReason = 'engagement_decline';
    }
    // DORMANT: No activity for 21+ days
    else if (daysSinceLastAction >= 21) {
      newState = 'dormant';
      triggerReason = 'extended_inactivity';
    }
    // RETURNING: Was dormant/at-risk, now showing activity
    else if (lifecycle?.current_state === 'dormant' && daysSinceLastAction < 7) {
      newState = 'returning';
      triggerReason = 'reactivation_signal';
    }

    // Build engagement trends object
    const engagementTrends = {
      sessions_7days: sessions7d,
      sessions_14days: engagement.sessions_14days || 0,
      actions_7days: actions7d,
      actions_14days: engagement.total_actions_30_days || 0,
      engagement_trend_7days: trendDirection,
      engagement_trend_percent: sessionsChange,
      days_since_last_action: daysSinceLastAction,
      last_session_date: engagement.last_activity_date
    };

    // Update or create lifecycle state
    if (!lifecycle) {
      lifecycle = await base44.entities.LifecycleState?.create({
        user_email: user.email,
        current_state: newState,
        state_history: [{
          state: newState,
          entered_date: new Date().toISOString(),
          trigger_reason: triggerReason
        }],
        engagement_trends: engagementTrends,
        activation_signals: {
          activation_path: activationPath,
          core_milestone_achieved: coreAchieved,
          days_to_activation: activation?.milestone_dates?.fully_activated_date ? 
            Math.floor((new Date(activation.milestone_dates.fully_activated_date) - new Date(activation.created_date)) / (1000 * 60 * 60 * 24)) : null
        },
        habit_loop_status: {
          active_loops: (retention.habit_loops || {}).discovery_loop?.active ? ['discovery'] : [] 
        },
        personalization_maturity: retention.personalization_stage || 'baseline',
        created_date: new Date().toISOString(),
        last_state_check_date: new Date().toISOString()
      }).catch(() => null);
    } else {
      // Update existing
      const stateChanged = lifecycle.current_state !== newState;
      const updatedHistory = lifecycle.state_history || [];

      if (stateChanged) {
        // Mark exit of previous state
        if (updatedHistory.length > 0) {
          updatedHistory[updatedHistory.length - 1].exit_date = new Date().toISOString();
          updatedHistory[updatedHistory.length - 1].days_in_state = Math.floor(
            (new Date() - new Date(updatedHistory[updatedHistory.length - 1].entered_date)) / (1000 * 60 * 60 * 24)
          );
        }
        // Add new state
        updatedHistory.push({
          state: newState,
          entered_date: new Date().toISOString(),
          trigger_reason: triggerReason
        });
      }

      lifecycle = await base44.entities.LifecycleState?.update(lifecycle.id, {
        current_state: newState,
        state_history: updatedHistory,
        engagement_trends: engagementTrends,
        activation_signals: {
          activation_path: activationPath,
          core_milestone_achieved: coreAchieved
        },
        personalization_maturity: retention.personalization_stage || 'baseline',
        last_state_check_date: new Date().toISOString(),
        last_updated_date: new Date().toISOString()
      }).catch(() => lifecycle);
    }

    return Response.json({
      success: true,
      current_state: newState,
      trigger_reason: triggerReason,
      engagement_trends: engagementTrends,
      state_changed: lifecycle?.current_state !== newState
    });
  } catch (error) {
    console.error('Lifecycle state detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
/**
 * Identify User Segments
 * Determines which dynamic segments a user belongs to
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all relevant states
    const [lifecycleStates, powerUserStates, retentionStates] = await Promise.all([
      base44.entities.LifecycleState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.PowerUserState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.RetentionState?.filter({ user_email: user.email }).catch(() => [])
    ]);

    const lifecycle = lifecycleStates?.[0];
    const powerUser = powerUserStates?.[0];
    const retention = retentionStates?.[0];

    if (!lifecycle) {
      return Response.json({ error: 'Lifecycle state required' }, { status: 404 });
    }

    const segments = [];
    const segmentMetadata = {};

    // Extract key signals
    const currentState = lifecycle.current_state;
    const churnRisk = lifecycle.churn_risk?.risk_level || 'low';
    const powerUserStatus = powerUser?.power_user_status || 'emerging';
    const overallScore = powerUser?.power_user_signals?.signal_scores?.overall_power_user_score || 0;
    const subscriptionTier = powerUser?.subscription_status?.subscription_tier || 'free';
    const subscriptionStatus = user.subscription?.status;
    const unlockedTiers = powerUser?.unlocked_capabilities ? Object.values(powerUser.unlocked_capabilities).filter(Boolean).length : 0;
    const consecutiveWeeks = retention?.engagement_metrics?.consecutive_weeks_active || 0;

    // SEGMENT 1: Emerging Power Learners
    // Criteria: 40-69 power-user score, engaged/activated state, free tier, 1+ capability unlocked
    if (
      overallScore >= 40 && overallScore < 70 &&
      (currentState === 'engaged' || currentState === 'activated') &&
      subscriptionTier === 'free' &&
      unlockedTiers >= 1
    ) {
      segments.push('emerging_power_learners');
      segmentMetadata.emerging_power_learners = {
        score: overallScore,
        unlocked_tiers: unlockedTiers,
        weeks_active: consecutiveWeeks,
        conversion_readiness: 'high'
      };
    }

    // SEGMENT 2: Active Pro Subscribers
    // Criteria: Paying subscription (active/trialing), engaged/power_user state, low churn risk
    if (
      (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') &&
      (currentState === 'engaged' || currentState === 'power_user') &&
      (churnRisk === 'low' || churnRisk === 'moderate')
    ) {
      segments.push('active_pro_subscribers');
      segmentMetadata.active_pro_subscribers = {
        subscription_tier: subscriptionTier,
        subscription_status: subscriptionStatus,
        state: currentState,
        retention_priority: 'premium_value_reinforcement'
      };
    }

    // SEGMENT 3: At-Risk Engaged Users
    // Criteria: Engaged or power_user state, but high/critical churn risk
    if (
      (currentState === 'engaged' || currentState === 'power_user') &&
      (churnRisk === 'high' || churnRisk === 'critical')
    ) {
      segments.push('at_risk_engaged_users');
      segmentMetadata.at_risk_engaged_users = {
        state: currentState,
        churn_risk: churnRisk,
        primary_risk_factor: lifecycle.churn_risk?.primary_risk_factor,
        intervention_urgency: 'high'
      };
    }

    // SEGMENT 4: High-Intent Free Learners
    // Criteria: Power user status, free tier, 70+ score, multiple capabilities unlocked
    if (
      powerUserStatus === 'power_user' &&
      subscriptionTier === 'free' &&
      overallScore >= 70 &&
      unlockedTiers >= 2
    ) {
      segments.push('high_intent_free_learners');
      segmentMetadata.high_intent_free_learners = {
        score: overallScore,
        unlocked_tiers: unlockedTiers,
        conversion_readiness: 'critical',
        monetization_priority: 'immediate'
      };
    }

    // SEGMENT 5: Dormant Premium Users
    // Criteria: Paying subscription, dormant state
    if (
      (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') &&
      currentState === 'dormant'
    ) {
      segments.push('dormant_premium_users');
      segmentMetadata.dormant_premium_users = {
        subscription_tier: subscriptionTier,
        churn_risk: 'critical',
        win_back_priority: 'urgent',
        value_at_risk: 'high'
      };
    }

    // SEGMENT 6: Returning Champions
    // Criteria: Returning state, was power_user previously, high historical engagement
    if (
      currentState === 'returning' &&
      lifecycle.state_history?.some(s => s.state === 'power_user')
    ) {
      segments.push('returning_champions');
      segmentMetadata.returning_champions = {
        previous_state: 'power_user',
        reactivation_momentum: 'high',
        retention_priority: 'critical'
      };
    }

    // SEGMENT 7: New High-Potential
    // Criteria: New/activated state, fast activation (≤3 days), high early engagement
    const daysToActivation = lifecycle.activation_signals?.days_to_activation || 999;
    if (
      (currentState === 'new' || currentState === 'activated') &&
      daysToActivation <= 3 &&
      consecutiveWeeks >= 1
    ) {
      segments.push('new_high_potential');
      segmentMetadata.new_high_potential = {
        days_to_activation: daysToActivation,
        activation_velocity: 'fast',
        conversion_potential: 'high'
      };
    }

    // SEGMENT 8: Casual Learners
    // Criteria: Engaged state, low power-user score (<30), no capabilities unlocked, free tier
    if (
      currentState === 'engaged' &&
      overallScore < 30 &&
      unlockedTiers === 0 &&
      subscriptionTier === 'free'
    ) {
      segments.push('casual_learners');
      segmentMetadata.casual_learners = {
        score: overallScore,
        engagement_depth: 'shallow',
        activation_strategy: 'capability_unlock_nudge'
      };
    }

    // SEGMENT 9: Subscription Churn Risk
    // Criteria: Active subscription, high churn risk, engaged/power_user
    if (
      subscriptionStatus === 'active' &&
      (churnRisk === 'high' || churnRisk === 'critical') &&
      (currentState === 'engaged' || currentState === 'power_user')
    ) {
      segments.push('subscription_churn_risk');
      segmentMetadata.subscription_churn_risk = {
        subscription_tier: subscriptionTier,
        churn_risk: churnRisk,
        revenue_at_risk: powerUser?.subscription_status?.mrr || 0,
        intervention_priority: 'urgent'
      };
    }

    // SEGMENT 10: Trial Converters
    // Criteria: Trialing subscription, engaged/power_user, low churn risk
    if (
      subscriptionStatus === 'trialing' &&
      (currentState === 'engaged' || currentState === 'power_user') &&
      churnRisk === 'low'
    ) {
      segments.push('trial_converters');
      segmentMetadata.trial_converters = {
        trial_status: 'active',
        conversion_likelihood: 'high',
        value_demonstration_priority: 'high'
      };
    }

    return Response.json({
      success: true,
      user_email: user.email,
      segments: segments,
      segment_count: segments.length,
      segment_metadata: segmentMetadata,
      primary_segment: segments[0] || null,
      lifecycle_state: currentState,
      power_user_status: powerUserStatus,
      churn_risk: churnRisk,
      subscription_status: subscriptionStatus
    });
  } catch (error) {
    console.error('Segment identification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
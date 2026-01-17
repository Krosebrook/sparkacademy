/**
 * Detect Power-User Signals
 * Analyzes behavior to identify power-user readiness
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
    const [retentionStates, powerUserStates] = await Promise.all([
      base44.entities.RetentionState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.PowerUserState?.filter({ user_email: user.email }).catch(() => [])
    ]);

    if (!retentionStates?.length) {
      return Response.json({ error: 'Retention state not found' }, { status: 404 });
    }

    const retention = retentionStates[0];
    let powerUser = powerUserStates?.[0];

    // Calculate signal scores
    const compoundingActions = retention.compounding_actions || {};
    const signals = {
      saved_deals_count: compoundingActions.saved_deals_count || 0,
      compared_deals_count: 0, // Would track from deal comparison API
      portfolio_interactions_count: retention.engagement_metrics?.weekly_actions || 0,
      portfolio_adjustments_count: compoundingActions.portfolio_adjustments_count || 0,
      community_interactions_count: compoundingActions.community_follows_count || 0,
      consecutive_weeks_active: retention.engagement_metrics?.consecutive_weeks_active || 0
    };

    // Compute individual signal scores (0-100)
    const discoveryScore = Math.min(100, (signals.saved_deals_count * 15) + (signals.compared_deals_count * 10));
    const portfolioScore = Math.min(100, (signals.portfolio_interactions_count * 10) + (signals.portfolio_adjustments_count * 20));
    const communityScore = Math.min(100, (signals.community_interactions_count * 20));
    const consistencyScore = Math.min(100, signals.consecutive_weeks_active * 15);

    // Composite power-user score (weighted average)
    const overallScore = (discoveryScore * 0.35) + (portfolioScore * 0.35) + (communityScore * 0.20) + (consistencyScore * 0.10);

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
            discovery_momentum_score: discoveryScore,
            portfolio_engagement_score: portfolioScore,
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
            discovery_momentum_score: discoveryScore,
            portfolio_engagement_score: portfolioScore,
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
        discovery_score: discoveryScore,
        portfolio_score: portfolioScore,
        community_score: communityScore,
        overall_score: overallScore
      },
      thresholds: {
        tier_1_ready: discoveryScore >= 40,
        tier_2_ready: portfolioScore >= 40,
        tier_3_ready: communityScore >= 40,
        premium_ready: overallScore >= 70
      }
    });
  } catch (error) {
    console.error('Power-user signal detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
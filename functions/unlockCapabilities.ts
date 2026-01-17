/**
 * Unlock Capabilities
 * Determines and unlocks capability tiers based on power-user signals
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch power-user state
    const powerUserStates = await base44.entities.PowerUserState?.filter({
      user_email: user.email
    }).catch(() => []);

    if (!powerUserStates?.length) {
      return Response.json({ error: 'Power-user state not found' }, { status: 404 });
    }

    const powerUser = powerUserStates[0];
    const signals = powerUser.power_user_signals?.signal_scores || {};
    const currentCapabilities = powerUser.unlocked_capabilities || {};
    const newUnlocks = [];

    // TIER 1: Advanced Discovery (Deal Comparisons)
    // Threshold: Saved 5+ deals OR compared 3+ deals
    const tier1Eligible = (powerUser.power_user_signals?.saved_deals_count >= 5 || 
                          powerUser.power_user_signals?.compared_deals_count >= 3) &&
                         !currentCapabilities.tier_1_advanced_discovery;

    if (tier1Eligible) {
      newUnlocks.push({
        tier: 'tier_1_advanced_discovery',
        trigger: 'discovery_momentum'
      });
    }

    // TIER 2: Portfolio Intelligence (Scenario Modeling)
    // Threshold: Portfolio goals viewed 2+ times OR adjusted goals AND portfolio interactions 5+
    const tier2Eligible = (powerUser.power_user_signals?.portfolio_adjustments_count >= 1 &&
                          powerUser.power_user_signals?.portfolio_interactions_count >= 5) &&
                         !currentCapabilities.tier_2_portfolio_intelligence;

    if (tier2Eligible) {
      newUnlocks.push({
        tier: 'tier_2_portfolio_intelligence',
        trigger: 'portfolio_engagement'
      });
    }

    // TIER 3: Network & Signal Amplification (Community)
    // Threshold: 3+ community interactions (follow, bookmark, react)
    const tier3Eligible = powerUser.power_user_signals?.community_interactions_count >= 3 &&
                         !currentCapabilities.tier_3_network_amplification;

    if (tier3Eligible) {
      newUnlocks.push({
        tier: 'tier_3_network_amplification',
        trigger: 'community_engagement'
      });
    }

    // Build updated capabilities
    const updatedCapabilities = {
      tier_1_advanced_discovery: currentCapabilities.tier_1_advanced_discovery || tier1Eligible,
      tier_2_portfolio_intelligence: currentCapabilities.tier_2_portfolio_intelligence || tier2Eligible,
      tier_3_network_amplification: currentCapabilities.tier_3_network_amplification || tier3Eligible
    };

    // Build unlock history entry
    const unlockHistory = powerUser.unlock_history || [];
    newUnlocks.forEach(unlock => {
      unlockHistory.push({
        capability_tier: unlock.tier,
        unlocked_date: new Date().toISOString(),
        trigger_reason: unlock.trigger,
        user_notified_date: null
      });
    });

    // Determine monetization eligibility
    const monetizationEligibility = {
      eligible_for_tier_1_upgrade: tier1Eligible && !powerUser.subscription_status?.subscription_tier?.includes('pro'),
      eligible_for_tier_2_upgrade: tier2Eligible && !powerUser.subscription_status?.subscription_tier?.includes('pro'),
      eligible_for_tier_3_upgrade: tier3Eligible && !powerUser.subscription_status?.subscription_tier?.includes('elite'),
      eligible_for_premium_conversion: (tier1Eligible || tier2Eligible || tier3Eligible) && powerUser.power_user_status === 'power_user'
    };

    // Update power-user state
    const updated = await base44.entities.PowerUserState?.update(powerUser.id, {
      unlocked_capabilities: updatedCapabilities,
      unlock_history: unlockHistory,
      monetization_eligibility: monetizationEligibility,
      last_updated_date: new Date().toISOString()
    }).catch(() => powerUser);

    return Response.json({
      success: true,
      new_unlocks: newUnlocks,
      monetization_eligible: monetizationEligibility,
      updated_capabilities: updatedCapabilities
    });
  } catch (error) {
    console.error('Capability unlock error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
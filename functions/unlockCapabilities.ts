/**
 * Unlock Capabilities
 * Determines and unlocks capability tiers based on learning signals
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
    const signals = powerUser.power_user_signals || {};
    const currentCapabilities = powerUser.unlocked_capabilities || {};
    const newUnlocks = [];

    // TIER 1: Advanced Learning Tools (AI Tutor, Personalized Paths)
    // Threshold: Completed 2+ courses OR 3+ active enrollments
    const tier1Eligible = (signals.courses_completed_count >= 2 || 
                          signals.active_enrollments_count >= 3) &&
                         !currentCapabilities.tier_1_advanced_learning;

    if (tier1Eligible) {
      newUnlocks.push({
        tier: 'tier_1_advanced_learning',
        trigger: 'learning_momentum'
      });
    }

    // TIER 2: Mastery Tools (Custom Quizzes, Skill Gap Analysis)
    // Threshold: 10+ study sessions AND 1+ course completed
    const tier2Eligible = (signals.study_sessions_count >= 10 &&
                          signals.courses_completed_count >= 1) &&
                         !currentCapabilities.tier_2_mastery_tools;

    if (tier2Eligible) {
      newUnlocks.push({
        tier: 'tier_2_mastery_tools',
        trigger: 'mastery_engagement'
      });
    }

    // TIER 3: Creator Features (Course Creation, Monetization)
    // Threshold: 5+ community interactions OR 1+ content created
    const tier3Eligible = (signals.community_interactions_count >= 5 ||
                          signals.content_created_count >= 1) &&
                         !currentCapabilities.tier_3_creator_features;

    if (tier3Eligible) {
      newUnlocks.push({
        tier: 'tier_3_creator_features',
        trigger: 'creator_engagement'
      });
    }

    // Build updated capabilities
    const updatedCapabilities = {
      tier_1_advanced_learning: currentCapabilities.tier_1_advanced_learning || tier1Eligible,
      tier_2_mastery_tools: currentCapabilities.tier_2_mastery_tools || tier2Eligible,
      tier_3_creator_features: currentCapabilities.tier_3_creator_features || tier3Eligible
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
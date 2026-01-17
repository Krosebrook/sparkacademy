/**
 * Trigger Monetization Moment
 * Identifies and triggers contextual upgrade opportunities
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { context, capability } = await req.json();
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
    const dismissedOffers = powerUser.dismissed_offers || [];
    const existingMoments = powerUser.monetization_moments || [];

    // Check if user has dismissed this offer type permanently
    if (dismissedOffers.some(o => o.capability === capability && o.reason !== 'later')) {
      return Response.json({
        success: false,
        reason: 'User has dismissed this offer'
      });
    }

    // Check if already shown in this session
    if (existingMoments.some(m => m.capability === capability && m.status === 'shown')) {
      return Response.json({
        success: false,
        reason: 'Offer already shown in this session'
      });
    }

    // Determine monetization moment based on context
    const monetizationMoments = {
      deal_comparison: {
        moment_type: 'capability_paywall',
        headline: 'Save unlimited deal comparisons',
        message: 'You\'ve created 3 comparisons. Upgrade to save and organize all your analyses.',
        cta_text: 'See Pricing',
        tier: 'pro'
      },
      scenario_modeling: {
        moment_type: 'capability_paywall',
        headline: 'Unlock scenario modeling',
        message: 'Create unlimited what-if scenarios to test your strategy. Premium members get full forecasting.',
        cta_text: 'Upgrade Now',
        tier: 'pro'
      },
      expert_access: {
        moment_type: 'tier_unlock_offer',
        headline: 'Access exclusive expert insights',
        message: 'Your engagement unlocked access to premium expert discussions and signals.',
        cta_text: 'Explore Experts',
        tier: 'pro'
      },
      premium_communities: {
        moment_type: 'capability_paywall',
        headline: 'Join private expert communities',
        message: 'Get early deal access and real-time market insights from vetted investors.',
        cta_text: 'Learn More',
        tier: 'elite'
      }
    };

    const moment = monetizationMoments[capability];
    if (!moment) {
      return Response.json({
        success: false,
        reason: 'Unknown capability'
      });
    }

    // Create monetization moment record
    const momentId = `moment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMoment = {
      moment_id: momentId,
      moment_type: moment.moment_type,
      capability: capability,
      triggered_date: new Date().toISOString(),
      triggered_context: context,
      shown_date: null,
      dismissed_date: null,
      conversion_date: null,
      status: 'triggered'
    };

    // Add to moments array
    const updatedMoments = [...existingMoments, newMoment];

    await base44.entities.PowerUserState?.update(powerUser.id, {
      monetization_moments: updatedMoments
    }).catch(() => {});

    return Response.json({
      success: true,
      monetization_moment: {
        ...moment,
        moment_id: momentId,
        status: 'triggered'
      }
    });
  } catch (error) {
    console.error('Monetization moment trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
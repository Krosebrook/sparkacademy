/**
 * Generate Activation Nudges
 * Creates context-aware nudges based on behavior patterns and activation path
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch activation state
    const activationStates = await base44.entities.ActivationState?.filter({
      user_email: user.email
    }).catch(() => []);

    if (!activationStates?.length) {
      return Response.json({ error: 'Activation state not found' }, { status: 404 });
    }

    const activation = activationStates[0];
    const dismissedNudges = activation.dismissed_nudges || [];
    const activeNudges = activation.active_nudges || [];
    const activity = activation.activity_signals || {};

    const nudges = [];

    // Nudge 1: Inactivity Detection
    if (activity.inactivity_days > 2 && !dismissedNudges.includes('nudge_inactivity_prompt')) {
      nudges.push({
        nudge_id: 'nudge_inactivity_prompt',
        type: 'inactivity',
        headline: 'Welcome back! Let\'s find your first opportunity',
        message: `We've found ${activity.inactivity_days} deals matching your criteria. Ready to explore?`,
        cta_text: 'View Deals',
        cta_url: '/deals?recommended=true',
        trigger_condition: `inactivity_${activity.inactivity_days}_days`,
        priority: 'high',
        surface: 'banner',
        cooldown_hours: 24
      });
    }

    // Nudge 2: Path-Specific First Action
    if (!activation.milestones?.core_milestone_achieved) {
      if (activation.activation_path === 'deal_first' && !activation.milestones?.first_deal_saved) {
        nudges.push({
          nudge_id: 'nudge_save_first_deal',
          type: 'milestone_encouragement',
          headline: 'Save your first deal',
          message: 'Saving deals helps us learn your preferences and improves future recommendations.',
          cta_text: 'Browse Deals',
          cta_url: '/deals',
          trigger_condition: 'viewed_3_deals_without_saving',
          priority: 'medium',
          surface: 'side_panel',
          cooldown_hours: 12
        });
      }

      if (activation.activation_path === 'portfolio_first' && !activation.milestones?.first_portfolio_goal_set) {
        nudges.push({
          nudge_id: 'nudge_set_portfolio_goals',
          type: 'feature_discovery',
          headline: 'Let\'s define your investment targets',
          message: 'Setting clear goals unlocks AI-powered portfolio insights and smarter deal matching.',
          cta_text: 'Complete Setup',
          cta_url: '/settings/portfolio-goals',
          trigger_condition: 'viewed_analytics_without_goals',
          priority: 'high',
          surface: 'modal',
          cooldown_hours: 24
        });
      }

      if (activation.activation_path === 'community_first' && !activation.milestones?.first_community_follow) {
        nudges.push({
          nudge_id: 'nudge_join_community',
          type: 'community_prompt',
          headline: 'Join investors like you',
          message: 'Learn from experienced community members and stay updated on market trends.',
          cta_text: 'Explore Communities',
          cta_url: '/community?recommended=true',
          trigger_condition: 'first_session_community_path',
          priority: 'medium',
          surface: 'side_panel',
          cooldown_hours: 12
        });
      }
    }

    // Nudge 3: Deferred Setup Prompts
    if (activation.deferred_setup?.pending_portfolio_goals && activity.features_explored?.includes('analytics')) {
      if (!dismissedNudges.includes('nudge_deferred_portfolio_setup')) {
        nudges.push({
          nudge_id: 'nudge_deferred_portfolio_setup',
          type: 'deferred_completion',
          headline: 'Unlock portfolio analytics',
          message: 'Complete your portfolio setup to see personalized performance insights.',
          cta_text: 'Set Up Now',
          cta_url: '/settings/portfolio-goals',
          trigger_condition: 'viewed_analytics_with_pending_setup',
          priority: 'medium',
          surface: 'toast',
          cooldown_hours: 48
        });
      }
    }

    // Nudge 4: Repeated Behavior Pattern
    if (activity.session_count > 3 && !activation.milestones?.first_deal_saved && 
        activity.features_explored?.includes('deal_browser')) {
      if (!dismissedNudges.includes('nudge_deal_saving_reminder')) {
        nudges.push({
          nudge_id: 'nudge_deal_saving_reminder',
          type: 'behavior_insight',
          headline: 'You\'re browsing deals—let\'s save your favorites',
          message: 'Saving deals trains our AI to match you with better opportunities.',
          cta_text: 'Save a Deal',
          cta_url: '/deals',
          trigger_condition: 'browsed_deals_without_saving',
          priority: 'low',
          surface: 'sidebar',
          cooldown_hours: 48
        });
      }
    }

    // Filter out already shown nudges
    const newNudges = nudges.filter(n => 
      !activeNudges.some(a => a.nudge_id === n.nudge_id)
    );

    return Response.json({
      success: true,
      nudges: newNudges,
      count: newNudges.length
    });
  } catch (error) {
    console.error('Nudge generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
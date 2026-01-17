/**
 * Detect Habit Triggers
 * Identifies which habit loops should be triggered based on user actions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action_type, action_data } = await req.json();
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
    const triggeredLoops = [];

    // DISCOVERY LOOP triggers
    // When user saves deal, views deals, or dismisses a deal
    if (action_type === 'deal_saved' && retention.habit_loops?.discovery_loop?.active) {
      triggeredLoops.push({
        loop_type: 'discovery',
        trigger: 'deal_saved',
        context: { deal_id: action_data?.deal_id },
        action: 'show_related_deals'
      });
    }

    if (action_type === 'viewed_3_deals' && retention.habit_loops?.discovery_loop?.active) {
      triggeredLoops.push({
        loop_type: 'discovery',
        trigger: 'browsing_momentum',
        context: { deals_viewed: action_data?.count },
        action: 'suggest_save_action'
      });
    }

    if (action_type === 'deal_dismissed' && retention.habit_loops?.discovery_loop?.active) {
      triggeredLoops.push({
        loop_type: 'discovery',
        trigger: 'deal_feedback',
        context: { deal_id: action_data?.deal_id },
        action: 'refine_recommendations'
      });
    }

    // INSIGHT LOOP triggers
    // When user views analytics, portfolio, or after inactivity period
    if (action_type === 'viewed_analytics' && retention.habit_loops?.insight_loop?.active) {
      triggeredLoops.push({
        loop_type: 'insight',
        trigger: 'analytics_view',
        context: { section: action_data?.section },
        action: 'surface_relevant_insights'
      });
    }

    if (action_type === 'viewed_portfolio' && retention.habit_loops?.insight_loop?.active) {
      triggeredLoops.push({
        loop_type: 'insight',
        trigger: 'portfolio_view',
        context: { status: action_data?.status },
        action: 'suggest_adjustments'
      });
    }

    if (action_type === 'inactivity_5_days' && retention.habit_loops?.insight_loop?.active) {
      triggeredLoops.push({
        loop_type: 'insight',
        trigger: 'periodic_check_in',
        context: { days_inactive: 5 },
        action: 'send_periodic_insights'
      });
    }

    // SOCIAL LOOP triggers
    // When user joins community, views discussions, or follows someone
    if (action_type === 'community_joined' && retention.habit_loops?.social_loop?.active) {
      triggeredLoops.push({
        loop_type: 'social',
        trigger: 'community_joined',
        context: { community_id: action_data?.community_id },
        action: 'recommend_discussions'
      });
    }

    if (action_type === 'viewed_discussions' && retention.habit_loops?.social_loop?.active) {
      triggeredLoops.push({
        loop_type: 'social',
        trigger: 'browsing_discussions',
        context: { count: action_data?.count },
        action: 'recommend_people'
      });
    }

    if (action_type === 'followed_person' && retention.habit_loops?.social_loop?.active) {
      triggeredLoops.push({
        loop_type: 'social',
        trigger: 'followed_person',
        context: { person_id: action_data?.person_id },
        action: 'suggest_related_content'
      });
    }

    // Update habit loop trigger counts
    if (triggeredLoops.length > 0) {
      const updatedLoops = { ...retention.habit_loops };
      
      triggeredLoops.forEach(loop => {
        if (loop.loop_type === 'discovery' && updatedLoops.discovery_loop) {
          updatedLoops.discovery_loop.trigger_count = (updatedLoops.discovery_loop.trigger_count || 0) + 1;
          updatedLoops.discovery_loop.last_triggered_date = new Date().toISOString();
        }
        if (loop.loop_type === 'insight' && updatedLoops.insight_loop) {
          updatedLoops.insight_loop.trigger_count = (updatedLoops.insight_loop.trigger_count || 0) + 1;
          updatedLoops.insight_loop.last_triggered_date = new Date().toISOString();
        }
        if (loop.loop_type === 'social' && updatedLoops.social_loop) {
          updatedLoops.social_loop.trigger_count = (updatedLoops.social_loop.trigger_count || 0) + 1;
          updatedLoops.social_loop.last_triggered_date = new Date().toISOString();
        }
      });

      await base44.entities.RetentionState?.update(retention.id, {
        habit_loops: updatedLoops
      }).catch(() => {});
    }

    return Response.json({
      success: true,
      triggered_loops: triggeredLoops,
      count: triggeredLoops.length
    });
  } catch (error) {
    console.error('Habit trigger detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
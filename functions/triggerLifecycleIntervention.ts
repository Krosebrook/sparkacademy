/**
 * Trigger Lifecycle Intervention
 * Selects and triggers appropriate intervention based on lifecycle state
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lifecycleStates = await base44.entities.LifecycleState?.filter({
      user_email: user.email
    }).catch(() => []);

    if (!lifecycleStates?.length) {
      return Response.json({ error: 'Lifecycle state not found' }, { status: 404 });
    }

    const lifecycle = lifecycleStates[0];
    const currentState = lifecycle.current_state;
    const churnRisk = lifecycle.churn_risk || {};
    const dismissedInterventions = lifecycle.intervention_state?.dismissed_interventions || [];

    // Define interventions per lifecycle state
    const interventionPlaybook = {
      new: [
        {
          type: 'onboarding_guidance',
          priority: 'high',
          headline: 'Let\'s get you started',
          message: 'Here\'s how to find your first deal.',
          action: 'view_deals'
        }
      ],
      activated: [
        {
          type: 'habit_reinforcement',
          priority: 'medium',
          headline: 'You\'re making progress',
          message: 'You\'ve discovered your first deal. Keep going.',
          action: 'continue_exploring'
        }
      ],
      engaged: [
        {
          type: 'feature_discovery',
          priority: 'medium',
          headline: 'Advanced tools available',
          message: 'You\'re ready for deeper analysis. Try comparisons.',
          action: 'show_comparisons'
        }
      ],
      power_user: [
        {
          type: 'value_reinforcement',
          priority: 'low',
          headline: 'Your impact this month',
          message: 'You\'ve analyzed 8 deals and created 3 scenarios.',
          action: 'view_metrics'
        }
      ],
      at_risk: [
        {
          type: 'value_reminder',
          priority: 'high',
          headline: 'See what\'s changed',
          message: 'New deals arrived that match your strategy.',
          action: 'view_new_deals'
        },
        {
          type: 'relevance_reset',
          priority: 'high',
          headline: 'Refresh your interests',
          message: 'Your saved deals and preferences are waiting.',
          action: 'review_preferences'
        },
        {
          type: 'cognitive_load_reduction',
          priority: 'medium',
          headline: 'Start simple',
          message: 'Focus on one deal at a time.',
          action: 'simplified_view'
        }
      ],
      dormant: [
        {
          type: 'high_signal_summary',
          priority: 'high',
          headline: 'What\'s new in 60 seconds',
          message: 'Top 3 changes since you were last here.',
          action: 'view_summary'
        },
        {
          type: 'reactivation_path',
          priority: 'high',
          headline: 'Welcome back',
          message: 'No pressure—pick up where you left off.',
          action: 'resume_activity'
        }
      ],
      returning: [
        {
          type: 'context_restoration',
          priority: 'high',
          headline: 'Welcome back',
          message: 'You were tracking these opportunities.',
          action: 'view_saved_deals'
        }
      ]
    };

    // Get eligible interventions for current state
    const eligibleInterventions = interventionPlaybook[currentState] || [];

    // Filter out dismissed interventions
    const availableInterventions = eligibleInterventions.filter(
      intervention => !dismissedInterventions.some(d => d.intervention_type === intervention.type)
    );

    if (availableInterventions.length === 0) {
      return Response.json({
        success: false,
        reason: 'No available interventions for this state'
      });
    }

    // Prioritize based on churn risk
    let selectedIntervention = availableInterventions[0];
    if (churnRisk.risk_level === 'critical' || churnRisk.risk_level === 'high') {
      selectedIntervention = availableInterventions.find(i => i.priority === 'high') || availableInterventions[0];
    }

    // Create intervention record
    const interventionId = `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const activeIntervention = {
      intervention_id: interventionId,
      intervention_type: selectedIntervention.type,
      triggered_date: new Date().toISOString(),
      status: 'triggered'
    };

    // Update lifecycle state
    const interventionState = lifecycle.intervention_state || {};
    const existingMoments = interventionState.active_intervention || [];

    await base44.entities.LifecycleState?.update(lifecycle.id, {
      intervention_state: {
        ...interventionState,
        eligible_interventions: availableInterventions.map(i => i.type),
        active_intervention: activeIntervention
      },
      last_updated_date: new Date().toISOString()
    }).catch(() => {});

    return Response.json({
      success: true,
      intervention: {
        ...selectedIntervention,
        intervention_id: interventionId,
        state: currentState,
        churn_risk: churnRisk.risk_level
      }
    });
  } catch (error) {
    console.error('Intervention trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
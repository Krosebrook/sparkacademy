/**
 * Initialize Habit Loops
 * Sets up retention habit loops based on user's activation path
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

    // Determine which habit loops to activate based on user's activation path
    const habitLoops = {
      discovery_loop: false,
      insight_loop: false,
      social_loop: false
    };

    // Deal-first users: prioritize discovery loop
    if (activation.activation_path === 'deal_first') {
      habitLoops.discovery_loop = true;
      habitLoops.insight_loop = true; // Secondary
    }

    // Portfolio-first users: prioritize insight loop
    if (activation.activation_path === 'portfolio_first') {
      habitLoops.insight_loop = true;
      habitLoops.discovery_loop = true; // Secondary (deals feed portfolio)
    }

    // Community-first users: prioritize social loop
    if (activation.activation_path === 'community_first') {
      habitLoops.social_loop = true;
      habitLoops.discovery_loop = true; // Secondary
    }

    // Create or update retention state
    const existing = await base44.entities.RetentionState?.filter({
      user_email: user.email
    }).catch(() => []);

    let retentionState;
    if (existing?.length > 0) {
      retentionState = await base44.entities.RetentionState?.update(existing[0].id, {
        habit_loops: {
          discovery_loop: {
            active: habitLoops.discovery_loop,
            trigger_count: 0,
            completions: 0
          },
          insight_loop: {
            active: habitLoops.insight_loop,
            trigger_count: 0,
            completions: 0
          },
          social_loop: {
            active: habitLoops.social_loop,
            trigger_count: 0,
            completions: 0
          }
        },
        retention_status: 'activation'
      }).catch(() => existing[0]);
    } else {
      retentionState = await base44.entities.RetentionState?.create({
        user_email: user.email,
        retention_status: 'activation',
        habit_loops: {
          discovery_loop: {
            active: habitLoops.discovery_loop,
            trigger_count: 0,
            completions: 0
          },
          insight_loop: {
            active: habitLoops.insight_loop,
            trigger_count: 0,
            completions: 0
          },
          social_loop: {
            active: habitLoops.social_loop,
            trigger_count: 0,
            completions: 0
          }
        },
        personalization_stage: 'stage_1_baseline',
        created_date: new Date().toISOString()
      }).catch(() => null);
    }

    return Response.json({
      success: true,
      habit_loops_initialized: habitLoops,
      activation_path: activation.activation_path
    });
  } catch (error) {
    console.error('Habit loop initialization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
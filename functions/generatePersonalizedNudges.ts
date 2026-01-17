/**
 * Generate Personalized Nudges
 * AI-powered nudge generation based on user behavior and preferences
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile and engagement data
    const profile = await base44.entities.UserProfile?.filter({
      user_email: user.email
    }).catch(() => []);

    if (!profile?.length) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userProfile = profile[0];
    const skippedSteps = userProfile.onboarding_progress?.skipped_steps || [];
    const engagementMetrics = userProfile.engagement_metrics || {};

    // Generate nudges using AI
    const nudges = await base44.integrations.Core.InvokeLLM({
      prompt: buildNudgePrompt(userProfile, skippedSteps, engagementMetrics),
      response_json_schema: {
        type: "object",
        properties: {
          nudges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                nudge_type: { type: "string" },
                headline: { type: "string" },
                message: { type: "string" },
                cta_text: { type: "string" },
                cta_url: { type: "string" },
                trigger_reason: { type: "string" },
                priority: { type: "string" },
                display_channel: { type: "string" },
                personalization_data: { type: "object" }
              }
            }
          }
        }
      }
    });

    // Create nudge records
    const createdNudges = [];
    for (const nudge of nudges.nudges || []) {
      try {
        const nudgeId = `nudge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await base44.entities.OnboardingNudge?.create({
          nudge_id: nudgeId,
          user_email: user.email,
          nudge_type: nudge.nudge_type,
          headline: nudge.headline,
          message: nudge.message,
          cta_text: nudge.cta_text,
          cta_url: nudge.cta_url,
          trigger_reason: nudge.trigger_reason,
          priority: nudge.priority,
          display_channel: nudge.display_channel,
          status: 'pending',
          personalization_data: nudge.personalization_data
        }).catch(() => {});

        createdNudges.push(nudgeId);
      } catch (e) {
        console.log('Error creating nudge:', e.message);
      }
    }

    return Response.json({
      success: true,
      nudges_created: createdNudges.length,
      nudges: nudges.nudges || []
    });
  } catch (error) {
    console.error('Nudge generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildNudgePrompt(userProfile, skippedSteps, engagementMetrics) {
  return `Generate personalized nudges for an investor based on their profile and behavior.

USER PROFILE:
- Onboarding Mode: ${userProfile.onboarding_mode}
- Status: ${userProfile.onboarding_status}
- Risk Tolerance: ${userProfile.deal_sourcing_criteria?.risk_tolerance || 'not set'}
- Primary Interest: ${getPrimaryInterest(userProfile)}

SKIPPED STEPS: ${skippedSteps.length > 0 ? skippedSteps.join(', ') : 'None'}

ENGAGEMENT:
- Days active: ${engagementMetrics.days_since_signup || 0}
- Features explored: ${engagementMetrics.features_explored?.length || 0}
- Portfolio started: ${engagementMetrics.portfolio_started ? 'Yes' : 'No'}
- Community joined: ${engagementMetrics.community_joined ? 'Yes' : 'No'}
- Profile completion: ${engagementMetrics.profile_completion_percent || 0}%

NUDGE REQUIREMENTS:
1. Generate 2-4 contextual nudges tailored to this user
2. Prioritize high-impact actions:
   - If portfolio_started=false: Encourage portfolio setup
   - If skipped_steps exists: Suggest completing those steps
   - If low engagement: Recommend key features
3. For each nudge:
   - Type: setup_completion, feature_discovery, community_prompt, preference_based, or activity_based
   - Headline: Short, exciting (max 50 chars)
   - Message: Benefit-focused, personalized (max 150 chars)
   - CTA: Clear action (Setup, Explore, Join, Learn, etc.)
   - Channel: banner (default), sidebar, or modal
   - Priority: high (days 1-3), medium (days 4-7), low (day 8+)

Make nudges feel helpful, not pushy. Use personalized data where possible.`;
}

function getPrimaryInterest(userProfile) {
  const interests = [];
  if (userProfile.deal_sourcing_criteria) interests.push('Deal Sourcing');
  if (userProfile.portfolio_goals) interests.push('Portfolio Management');
  if (userProfile.community_preferences) interests.push('Community');
  return interests.join(', ') || 'All features';
}
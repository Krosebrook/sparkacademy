/**
 * Determine Activation Path
 * Analyzes user onboarding data and initial activity to assign optimal activation path
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const profiles = await base44.entities.UserProfile?.filter({
      user_email: user.email
    }).catch(() => []);

    if (!profiles?.length) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }

    const profile = profiles[0];

    // Calculate path score based on onboarding preferences
    let dealScore = 0;
    let portfolioScore = 0;
    let communityScore = 0;

    // Deal-First signals (Deal Sourcing emphasis)
    if (profile.deal_sourcing_criteria?.target_industries?.length > 0) dealScore += 25;
    if (profile.deal_sourcing_criteria?.risk_tolerance === 'aggressive') dealScore += 15;
    if (profile.investor_profile?.years_experience > 5) dealScore += 10;
    if (!profile.portfolio_goals?.time_horizon) dealScore += 10; // Skipped portfolio

    // Portfolio-First signals (Long-term goals emphasis)
    if (profile.portfolio_goals?.time_horizon === 'long_term') portfolioScore += 25;
    if (profile.portfolio_goals?.target_return_annual_percent > 15) portfolioScore += 15;
    if (profile.portfolio_goals?.diversification_preference === 'high') portfolioScore += 10;
    if (!profile.deal_sourcing_criteria?.target_industries?.length) portfolioScore += 10; // Skipped deal sourcing

    // Community-First signals (Learning & networking emphasis)
    if (profile.community_preferences?.engagement_priority === 'knowledge_sharing') communityScore += 25;
    if (profile.community_preferences?.peer_group_interests?.length > 0) communityScore += 15;
    if (profile.investor_profile?.years_experience < 3) communityScore += 15; // Novice = needs learning
    if (profile.community_preferences?.engagement_priority === 'networking') communityScore += 10;

    // Determine primary path
    const scores = {
      deal_first: dealScore,
      portfolio_first: portfolioScore,
      community_first: communityScore
    };

    const activationPath = Object.entries(scores).reduce((max, [key, val]) => 
      val > scores[max] ? key : max
    );

    const rationale = generateRationale(activationPath, profile, scores);

    // Create or update activation state
    const existing = await base44.entities.ActivationState?.filter({
      user_email: user.email
    }).catch(() => []);

    let activationState;
    if (existing?.length > 0) {
      activationState = await base44.entities.ActivationState?.update(existing[0].id, {
        activation_path: activationPath,
        path_rationale: rationale,
        last_updated_date: new Date().toISOString()
      }).catch(() => existing[0]);
    } else {
      activationState = await base44.entities.ActivationState?.create({
        user_email: user.email,
        activation_path: activationPath,
        activation_status: 'not_started',
        path_rationale: rationale,
        created_date: new Date().toISOString()
      }).catch(() => null);
    }

    return Response.json({
      success: true,
      activation_path: activationPath,
      path_rationale: rationale,
      scores: scores
    });
  } catch (error) {
    console.error('Activation path error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateRationale(path, profile, scores) {
  const pathDescriptions = {
    deal_first: `Deal-focused investor with ${profile.investor_profile?.years_experience || 0}+ years experience. Strong deal sourcing criteria: ${profile.deal_sourcing_criteria?.target_industries?.slice(0, 2).join(', ')}. You'll benefit from finding your first deal match.`,
    portfolio_first: `Portfolio-optimization focused with ${profile.portfolio_goals?.time_horizon || 'moderate'} time horizon. Target annual return: ${profile.portfolio_goals?.target_return_annual_percent || 'flexible'}%. Setting clear goals will unlock smarter insights.`,
    community_first: `Learning-oriented investor${profile.investor_profile?.years_experience < 3 ? ' beginning your journey' : ''}. Network growth priority: ${profile.community_preferences?.engagement_priority || 'balanced'}. Connect with peers who share your interests.`
  };

  return pathDescriptions[path] || 'Personalized activation path determined from your preferences.';
}
/**
 * Trigger Contextual Tutorials
 * Automatically suggest tutorials when users access features for first time
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { feature_accessed, page_url } = await req.json();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const profile = await base44.entities.UserProfile?.filter({
      user_email: user.email
    }).catch(() => []);

    if (!profile?.length) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const userProfile = profile[0];
    const featuresExplored = userProfile.engagement_metrics?.features_explored || [];
    const completedTutorials = userProfile.tutorial_progress?.completed_tutorials || [];

    // Determine which tutorial to show based on feature accessed
    let tutorialToShow = null;

    const tutorialMapping = {
      'deals': {
        guide_id: 'tutorial_review_deal',
        trigger_condition: 'first_visit_to_deals'
      },
      'portfolio': {
        guide_id: 'tutorial_portfolio_tracking',
        trigger_condition: 'first_visit_to_portfolio'
      },
      'community': {
        guide_id: 'tutorial_community_join',
        trigger_condition: 'first_visit_to_community'
      },
      'analytics': {
        guide_id: 'tutorial_view_analytics',
        trigger_condition: 'first_visit_to_analytics'
      }
    };

    const mapping = tutorialMapping[feature_accessed];
    if (mapping && !completedTutorials.includes(mapping.guide_id)) {
      tutorialToShow = mapping.guide_id;
    }

    // Fetch tutorial details
    let guide = null;
    if (tutorialToShow) {
      const guides = await base44.entities.InteractiveGuide?.filter({
        guide_id: tutorialToShow
      }).catch(() => []);

      guide = guides?.[0] || null;
    }

    // Update engagement metrics
    if (!featuresExplored.includes(feature_accessed)) {
      await base44.entities.UserProfile?.update(userProfile.id, {
        engagement_metrics: {
          ...userProfile.engagement_metrics,
          features_explored: [...featuresExplored, feature_accessed]
        }
      }).catch(() => {});
    }

    return Response.json({
      success: true,
      tutorial_to_show: tutorialToShow,
      guide: guide
    });
  } catch (error) {
    console.error('Tutorial trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
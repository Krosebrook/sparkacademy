/**
 * Generate Weekly Digest
 * Creates personalized weekly summary digest with deals, insights, and social highlights
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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
    const digestContent = {
      sections: [],
      headline: null,
      metrics: {}
    };

    // Generate digest headline based on user's activity
    if (retention.engagement_metrics?.consecutive_weeks_active > 0) {
      digestContent.headline = `Week ${retention.engagement_metrics.consecutive_weeks_active}: Your Investment Snapshot`;
    } else {
      digestContent.headline = 'Your Weekly Investment Digest';
    }

    // DEALS SECTION (for discovery-active users)
    if (retention.digest_preferences?.content_types?.includes('deals') && retention.habit_loops?.discovery_loop?.active) {
      digestContent.sections.push({
        type: 'deals',
        title: 'New Opportunities Matched to Your Criteria',
        description: 'These deals align with your sourcing preferences',
        items: [
          {
            deal_name: '[Curated from saved criteria]',
            match_score: 92,
            reason: 'Matches your target industries and size range',
            action: 'View Deal'
          }
        ],
        count: 3
      });
    }

    // INSIGHTS SECTION (for insight-active users)
    if (retention.digest_preferences?.content_types?.includes('insights') && retention.habit_loops?.insight_loop?.active) {
      digestContent.sections.push({
        type: 'insights',
        title: 'Portfolio Insights & Opportunities',
        description: 'What changed in your investment landscape',
        items: [
          {
            insight_title: 'Your Portfolio Projection',
            insight_text: 'Based on your goals, on track for 12.5% annual return',
            action: 'Review Portfolio'
          },
          {
            insight_title: 'New Deals for Your Strategy',
            insight_text: '2 deals this week fit your long-term growth targets',
            action: 'Explore'
          }
        ]
      });
    }

    // COMMUNITY SECTION (for social-active users)
    if (retention.digest_preferences?.content_types?.includes('community') && retention.habit_loops?.social_loop?.active) {
      digestContent.sections.push({
        type: 'community',
        title: 'Your Community Highlights',
        description: 'Conversations and people worth following',
        items: [
          {
            type: 'discussion',
            title: '[High-signal discussion from your communities]',
            author: '[Expert investor]',
            action: 'Read Thread'
          },
          {
            type: 'person',
            title: '[Recommended person to follow]',
            expertise: 'Your interest area',
            action: 'Follow'
          }
        ]
      });
    }

    // PERFORMANCE SECTION
    if (retention.digest_preferences?.content_types?.includes('performance')) {
      digestContent.metrics = {
        this_week_actions: retention.engagement_metrics?.weekly_actions || 0,
        portfolio_health: 'On track',
        community_engagement: retention.compounding_actions?.community_follows_count || 0,
        deals_saved: retention.compounding_actions?.saved_deals_count || 0
      };
    }

    // Update last digest sent date
    await base44.entities.RetentionState?.update(retention.id, {
      'digest_preferences.last_digest_sent_date': new Date().toISOString()
    }).catch(() => {});

    return Response.json({
      success: true,
      digest: digestContent,
      user_email: user.email,
      generated_date: new Date().toISOString()
    });
  } catch (error) {
    console.error('Weekly digest generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
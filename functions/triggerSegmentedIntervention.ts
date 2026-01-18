/**
 * Trigger Segmented Intervention
 * Selects and triggers segment-specific interventions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { segments } = await req.json();

    if (!segments || segments.length === 0) {
      return Response.json({ error: 'No segments provided' }, { status: 400 });
    }

    // Segment-specific intervention playbooks
    const segmentInterventions = {
      emerging_power_learners: {
        type: 'upgrade_nudge',
        priority: 'high',
        headline: 'You\'re learning like a pro',
        message: 'Based on your progress, you\'re ready for unlimited AI tools and advanced features.',
        cta_text: 'See Pro Features',
        cta_url: '/billing?upgrade=pro',
        timing: 'immediate',
        channel: 'in_app_banner'
      },
      
      active_pro_subscribers: {
        type: 'value_reinforcement',
        priority: 'medium',
        headline: 'Your learning is accelerating',
        message: 'You\'ve completed 3 courses this month using Pro features.',
        cta_text: 'View Your Progress',
        cta_url: '/analytics',
        timing: 'weekly_digest',
        channel: 'email'
      },
      
      at_risk_engaged_users: {
        type: 'reengagement',
        priority: 'urgent',
        headline: 'Your learning path is waiting',
        message: '3 new courses match your interests. Continue your progress?',
        cta_text: 'Resume Learning',
        cta_url: '/dashboard',
        timing: 'immediate',
        channel: 'push_notification'
      },
      
      high_intent_free_learners: {
        type: 'conversion_offer',
        priority: 'critical',
        headline: 'Unlock unlimited learning',
        message: 'You\'re using advanced features heavily. Get unlimited AI tutoring and courses.',
        cta_text: 'Upgrade to Pro',
        cta_url: '/billing?upgrade=pro&offer=power_user',
        timing: 'immediate',
        channel: 'modal'
      },
      
      dormant_premium_users: {
        type: 'win_back_premium',
        priority: 'urgent',
        headline: 'Your Pro features are waiting',
        message: 'You have unlimited deal analysis, scenarios, and expert access. Come explore.',
        cta_text: 'Resume',
        cta_url: '/dashboard',
        timing: 'immediate',
        channel: 'email'
      },
      
      returning_champions: {
        type: 'welcome_back_vip',
        priority: 'high',
        headline: 'Welcome back, power user',
        message: 'Your saved deals, scenarios, and insights are ready to go.',
        cta_text: 'Pick Up Where You Left Off',
        cta_url: '/dashboard',
        timing: 'immediate',
        channel: 'in_app_modal'
      },
      
      new_high_potential: {
        type: 'fast_track_activation',
        priority: 'high',
        headline: 'You\'re moving fast',
        message: 'Unlock deal comparisons to analyze opportunities side-by-side.',
        cta_text: 'Try Comparisons',
        cta_url: '/deals/compare',
        timing: 'day_3',
        channel: 'in_app_banner'
      },
      
      casual_learners: {
        type: 'capability_unlock_nudge',
        priority: 'medium',
        headline: 'Accelerate your learning',
        message: 'You\'ve completed 2 lessons. Try AI tutor for personalized help.',
        cta_text: 'Try AI Tutor',
        cta_url: '/ai-tutor',
        timing: 'after_2_lessons',
        channel: 'tooltip'
      },
      
      subscription_churn_risk: {
        type: 'retention_offer',
        priority: 'urgent',
        headline: 'How can we help?',
        message: 'We\'d love to understand what\'s changed. Quick feedback?',
        cta_text: 'Share Feedback',
        cta_url: '/feedback',
        timing: 'immediate',
        channel: 'email'
      },
      
      trial_converters: {
        type: 'trial_conversion',
        priority: 'high',
        headline: 'Your trial is working',
        message: 'Continue unlimited access for just $19/month.',
        cta_text: 'Subscribe Now',
        cta_url: '/billing?convert=trial',
        timing: 'trial_day_10',
        channel: 'in_app_banner'
      }
    };

    // Get intervention for primary segment (first in list)
    const primarySegment = segments[0];
    const intervention = segmentInterventions[primarySegment];

    if (!intervention) {
      return Response.json({
        success: false,
        reason: 'No intervention defined for segment'
      });
    }

    // Create intervention record
    const interventionId = `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return Response.json({
      success: true,
      intervention: {
        intervention_id: interventionId,
        segment: primarySegment,
        ...intervention,
        triggered_date: new Date().toISOString(),
        status: 'triggered'
      }
    });
  } catch (error) {
    console.error('Segmented intervention error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
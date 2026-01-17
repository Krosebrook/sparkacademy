/**
 * Habit Loop Manager
 * Orchestrates the three habit loops in the app experience
 * Should wrap main dashboard/app pages
 */

import React, { useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function HabitLoopManager({ children, onHabitTriggered }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: retention } = useQuery({
    queryKey: ['retention', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const states = await base44.entities.RetentionState?.filter({
        user_email: user.email
      }).catch(() => []);
      return states?.[0];
    },
    enabled: !!user?.email
  });

  // Track deal saves
  const handleDealSaved = useCallback(async (dealId) => {
    if (!retention) return;
    
    const result = await base44.functions.invoke('detectHabitTriggers', {
      action_type: 'deal_saved',
      action_data: { deal_id: dealId }
    }).catch(() => null);

    if (result?.data?.triggered_loops?.length > 0 && onHabitTriggered) {
      onHabitTriggered(result.data.triggered_loops);
    }

    // Update compounding actions
    await base44.entities.RetentionState?.update(retention.id, {
      'compounding_actions.saved_deals_count': (retention.compounding_actions?.saved_deals_count || 0) + 1,
      'engagement_metrics.last_activity_date': new Date().toISOString(),
      'engagement_metrics.total_actions_30_days': (retention.engagement_metrics?.total_actions_30_days || 0) + 1
    }).catch(() => {});
  }, [retention, onHabitTriggered]);

  // Track analytics views
  const handleAnalyticsViewed = useCallback(async (section) => {
    if (!retention) return;

    const result = await base44.functions.invoke('detectHabitTriggers', {
      action_type: 'viewed_analytics',
      action_data: { section }
    }).catch(() => null);

    if (result?.data?.triggered_loops?.length > 0 && onHabitTriggered) {
      onHabitTriggered(result.data.triggered_loops);
    }

    await base44.entities.RetentionState?.update(retention.id, {
      'engagement_metrics.last_activity_date': new Date().toISOString(),
      'engagement_metrics.total_actions_30_days': (retention.engagement_metrics?.total_actions_30_days || 0) + 1
    }).catch(() => {});
  }, [retention, onHabitTriggered]);

  // Track community actions
  const handleCommunityAction = useCallback(async (actionType, data) => {
    if (!retention) return;

    const result = await base44.functions.invoke('detectHabitTriggers', {
      action_type: actionType,
      action_data: data
    }).catch(() => null);

    if (result?.data?.triggered_loops?.length > 0 && onHabitTriggered) {
      onHabitTriggered(result.data.triggered_loops);
    }

    // Update community metrics
    if (actionType === 'community_joined') {
      await base44.entities.RetentionState?.update(retention.id, {
        'compounding_actions.community_follows_count': (retention.compounding_actions?.community_follows_count || 0) + 1
      }).catch(() => {});
    }

    await base44.entities.RetentionState?.update(retention.id, {
      'engagement_metrics.last_activity_date': new Date().toISOString()
    }).catch(() => {});
  }, [retention, onHabitTriggered]);

  // Expose action handlers via window for child components
  useEffect(() => {
    if (window) {
      window.__habitLoops = {
        dealSaved: handleDealSaved,
        analyticsViewed: handleAnalyticsViewed,
        communityAction: handleCommunityAction
      };
    }
  }, [handleDealSaved, handleAnalyticsViewed, handleCommunityAction]);

  return children;
}

// Hook for child components to trigger habit loops
export function useHabitLoops() {
  return {
    onDealSaved: (dealId) => window.__habitLoops?.dealSaved(dealId),
    onAnalyticsViewed: (section) => window.__habitLoops?.analyticsViewed(section),
    onCommunityAction: (actionType, data) => window.__habitLoops?.communityAction(actionType, data)
  };
}
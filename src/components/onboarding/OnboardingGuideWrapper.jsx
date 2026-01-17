/**
 * Onboarding Guide Wrapper
 * Orchestrates tutorials, nudges, and guidance for new users
 * Includes in all main app pages
 */

import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import InteractiveTutorial from './InteractiveTutorial';
import NudgeManager from './NudgeManager';
import GuidanceBanner from './GuidanceBanner';

export default function OnboardingGuideWrapper({ currentFeature, children }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile?.filter({
        user_email: user.email
      }).catch(() => []);
      return profiles?.[0];
    },
    enabled: !!user?.email
  });

  const { data: contextualTutorial, isLoading } = useQuery({
    queryKey: ['contextualTutorial', currentFeature],
    queryFn: async () => {
      if (!currentFeature || !user?.email) return null;
      const response = await base44.functions.invoke('triggerContextualTutorials', {
        feature_accessed: currentFeature,
        page_url: window.location.pathname
      }).catch(() => null);
      return response?.data?.guide || null;
    },
    enabled: !!currentFeature && !!user?.email
  });

  const [showTutorial, setShowTutorial] = useState(false);

  // Auto-show contextual tutorial
  useEffect(() => {
    if (contextualTutorial && !isLoading && profile?.feature_flags?.show_contextual_tutorials) {
      setShowTutorial(true);
    }
  }, [contextualTutorial, isLoading, profile]);

  if (!profile) {
    return children;
  }

  // Show guidance banners for Quick Start users
  const showGuidanceBanners = profile.onboarding_mode === 'quick_start' && 
                               profile.feature_flags?.show_guidance_banners;
  const skippedSteps = profile.onboarding_progress?.skipped_steps || [];

  return (
    <div className="space-y-4">
      {/* Guidance Banners for Quick Start users */}
      {showGuidanceBanners && skippedSteps.includes('portfolio_goals') && (
        <GuidanceBanner
          message="Complete your portfolio goals for better recommendations"
          action={{ label: 'Complete Setup', url: '/profile/complete-setup' }}
          severity="warning"
        />
      )}

      {showGuidanceBanners && skippedSteps.includes('community_preferences') && (
        <GuidanceBanner
          message="Join communities to network with other investors"
          action={{ label: 'View Communities', url: '/community' }}
          severity="info"
        />
      )}

      {/* Main content */}
      <div>
        {children}
      </div>

      {/* Contextual Tutorial */}
      {showTutorial && contextualTutorial && (
        <InteractiveTutorial
          guideId={contextualTutorial.guide_id}
          guide={contextualTutorial}
          onComplete={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
        />
      )}

      {/* Nudge Manager */}
      {profile.feature_flags?.send_nudges && <NudgeManager />}
    </div>
  );
}
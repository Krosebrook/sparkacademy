/**
 * Onboarding Flow Page
 * Main entry point for new users
 * Handles path selection and orchestrates full experience
 */

import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default function OnboardingFlow() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingProfile } = useQuery({
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

  // Redirect if already onboarded
  useEffect(() => {
    if (existingProfile) {
      const status = existingProfile.onboarding_status;
      if (status === 'quick_completed' || status === 'fully_completed') {
        // Generate nudges for returning users
        base44.functions.invoke('generatePersonalizedNudges', {}).catch(() => {});
        window.location.href = '/dashboard';
      }
    }
  }, [existingProfile]);

  return <OnboardingWizard />;
}
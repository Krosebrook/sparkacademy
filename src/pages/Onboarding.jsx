/**
 * Onboarding Page
 * Entry point for the AI-powered onboarding wizard
 */

import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default function Onboarding() {
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

  // If user already has completed onboarding, redirect to dashboard
  useEffect(() => {
    if (existingProfile?.onboarding_status === 'completed') {
      window.location.href = '/dashboard';
    }
  }, [existingProfile]);

  return <OnboardingWizard />;
}
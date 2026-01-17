/**
 * AI-Powered Onboarding Wizard
 * Multi-step, interactive onboarding with conditional branching
 * Captures deal sourcing criteria, portfolio goals, and community preferences
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

// Step components
import WelcomeStep from './steps/WelcomeStep';
import DealSourcingStep from './steps/DealSourcingStep';
import InvestorProfileStep from './steps/InvestorProfileStep';
import PortfolioGoalsStep from './steps/PortfolioGoalsStep';
import CommunityPreferencesStep from './steps/CommunityPreferencesStep';
import ReviewSummaryStep from './steps/ReviewSummaryStep';

const STEPS = [
  { id: 'welcome', label: 'Welcome', component: WelcomeStep, skippable: false },
  { id: 'investor_profile', label: 'Investor Profile', component: InvestorProfileStep, skippable: false },
  { id: 'deal_sourcing', label: 'Deal Sourcing', component: DealSourcingStep, skippable: false },
  { id: 'portfolio_goals', label: 'Portfolio Goals', component: PortfolioGoalsStep, skippable: false },
  { id: 'community', label: 'Community', component: CommunityPreferencesStep, skippable: true },
  { id: 'review', label: 'Review', component: ReviewSummaryStep, skippable: false }
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    investor_type: null,
    years_experience: null,
    managed_portfolio_value: null,
    target_industries: [],
    investment_size_min: null,
    investment_size_max: null,
    preferred_deal_structures: [],
    geographic_preferences: [],
    risk_tolerance: 'moderate',
    time_horizon: null,
    target_return_annual_percent: null,
    diversification_preference: 'moderate',
    sector_priorities: [],
    asset_class_focus: [],
    peer_group_interests: [],
    engagement_priority: 'balanced',
    notification_frequency: 'weekly',
    privacy_level: 'friends_only',
    willing_to_share_deals: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const CurrentStepComponent = STEPS[currentStep].component;
  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    // Validate current step
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSkip = () => {
    if (step.skippable) {
      setErrors({});
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 1) { // Investor Profile
      if (!formData.investor_type) newErrors.investor_type = 'Please select your investor type';
      if (!formData.years_experience && formData.years_experience !== 0) newErrors.years_experience = 'Please specify your experience';
      if (!formData.managed_portfolio_value) newErrors.managed_portfolio_value = 'Please select portfolio size';
    }

    if (stepIndex === 2) { // Deal Sourcing
      if (formData.target_industries.length === 0) newErrors.target_industries = 'Select at least one industry';
      if (!formData.investment_size_min) newErrors.investment_size_min = 'Minimum investment size required';
      if (!formData.investment_size_max) newErrors.investment_size_max = 'Maximum investment size required';
      if (formData.investment_size_min > formData.investment_size_max) {
        newErrors.investment_range = 'Min must be less than max';
      }
      if (formData.preferred_deal_structures.length === 0) newErrors.preferred_deal_structures = 'Select at least one deal structure';
      if (formData.geographic_preferences.length === 0) newErrors.geographic_preferences = 'Select at least one region';
    }

    if (stepIndex === 3) { // Portfolio Goals
      if (!formData.time_horizon) newErrors.time_horizon = 'Please select your time horizon';
      if (!formData.target_return_annual_percent) newErrors.target_return_annual_percent = 'Target return required';
      if (formData.asset_class_focus.length === 0) newErrors.asset_class_focus = 'Select at least one asset class';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const profileData = {
        user_email: user.email,
        onboarding_status: 'completed',
        deal_sourcing_criteria: {
          target_industries: formData.target_industries,
          investment_size_min: formData.investment_size_min,
          investment_size_max: formData.investment_size_max,
          preferred_deal_structures: formData.preferred_deal_structures,
          geographic_preferences: formData.geographic_preferences,
          risk_tolerance: formData.risk_tolerance
        },
        portfolio_goals: {
          time_horizon: formData.time_horizon,
          target_return_annual_percent: formData.target_return_annual_percent,
          diversification_preference: formData.diversification_preference,
          sector_priorities: formData.sector_priorities,
          asset_class_focus: formData.asset_class_focus
        },
        community_preferences: {
          peer_group_interests: formData.peer_group_interests,
          engagement_priority: formData.engagement_priority,
          notification_frequency: formData.notification_frequency,
          privacy_level: formData.privacy_level,
          willing_to_share_deals: formData.willing_to_share_deals
        },
        investor_profile: {
          investor_type: formData.investor_type,
          years_experience: formData.years_experience,
          managed_portfolio_value: formData.managed_portfolio_value
        },
        onboarding_completed_date: new Date().toISOString(),
        preferences_last_updated: new Date().toISOString()
      };

      await base44.entities.UserProfile.create(profileData);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setErrors({ submit: 'Failed to complete onboarding. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Setting Up Your Profile</h1>
            <span className="text-sm text-gray-400">{currentStep + 1} of {STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  idx < currentStep
                    ? 'bg-green-500 text-white'
                    : idx === currentStep
                    ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className="text-xs text-gray-400 mt-2 text-center max-w-[60px]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Content Card */}
        <Card className="border-purple-500/30 bg-gradient-to-br from-slate-800/80 to-purple-900/40 backdrop-blur-sm">
          <CardContent className="p-8">
            <CurrentStepComponent
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              step={currentStep}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step.skippable && currentStep !== STEPS.length - 1 && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="flex-1 text-gray-400 hover:text-gray-300"
            >
              Skip
            </Button>
          )}

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
            >
              {isSubmitting ? 'Completing...' : 'Complete Setup'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {errors.submit && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {errors.submit}
          </div>
        )}
      </div>
    </div>
  );
}
/**
 * Quick Start Mode
 * Fast-entry onboarding for users who want immediate access
 * Asks only 3-5 essential questions, unlocks main app immediately
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ChevronRight } from 'lucide-react';

export default function QuickStartMode({ onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    investor_type: null,
    primary_interest: null,
    investment_range: null,
    risk_level: null,
    notifications: 'weekly'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      question: "What type of investor are you?",
      field: "investor_type",
      options: ["Angel", "VC/Fund", "Institutional", "Individual", "Family Office"],
      icon: "👤"
    },
    {
      question: "What's your main interest?",
      field: "primary_interest",
      options: ["Finding Deals", "Managing Portfolio", "Community & Learning", "All of Above"],
      icon: "🎯"
    },
    {
      question: "Typical investment size?",
      field: "investment_range",
      options: ["<$100K", "$100K-$1M", "$1M-$10M", "$10M+"],
      icon: "💰"
    },
    {
      question: "How comfortable with risk?",
      field: "risk_level",
      options: ["Conservative", "Moderate", "Aggressive"],
      icon: "⚡"
    }
  ];

  const handleSelect = (value) => {
    setFormData({
      ...formData,
      [steps[step].field]: value
    });
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.UserProfile?.create({
        user_email: user.email,
        onboarding_mode: 'quick_start',
        onboarding_status: 'quick_completed',
        investor_profile: {
          investor_type: formData.investor_type
        },
        feature_flags: {
          show_guidance_banners: true,
          show_contextual_tutorials: true,
          send_nudges: true
        },
        onboarding_completed_date: new Date().toISOString(),
        engagement_metrics: {
          first_login: new Date().toISOString(),
          total_logins: 1
        }
      }).catch(() => {});

      if (onComplete) {
        onComplete(formData);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Quick start error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Quick Start</h1>
          <p className="text-gray-400">Get started in 60 seconds</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-700/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {step + 1} of {steps.length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="border-purple-500/30 bg-gradient-to-br from-slate-800/80 to-purple-900/40 backdrop-blur-sm mb-6">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{currentStep.icon}</div>
              <h2 className="text-2xl font-bold text-white">{currentStep.question}</h2>
            </div>

            <div className="space-y-2">
              {currentStep.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left font-medium ${
                    formData[currentStep.field] === option
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!formData[currentStep.field] || isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {step === steps.length - 1 ? 'Enter App' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Skip Link */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              setFormData({ ...formData, [currentStep.field]: currentStep.options[0] });
              setTimeout(() => handleNext(), 100);
            }}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Skip this step
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
          <p className="text-blue-100 text-xs text-center">
            You can complete your full profile anytime. We'll guide you along the way.
          </p>
        </div>
      </div>
    </div>
  );
}
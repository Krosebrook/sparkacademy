/**
 * Interactive Tutorial Component
 * Visual element highlighting + step-by-step guidance
 * Contextually triggers for features
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const TutorialOverlay = ({ highlight, tooltip, position = 'right' }) => {
  if (!highlight) return null;

  const element = document.querySelector(highlight);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const positions = {
    right: { left: `${rect.right + 20}px`, top: `${rect.top}px` },
    left: { right: `${window.innerWidth - rect.left + 20}px`, top: `${rect.top}px` },
    bottom: { left: `${rect.left}px`, top: `${rect.bottom + 20}px` },
    top: { left: `${rect.left}px`, bottom: `${window.innerHeight - rect.top + 20}px` }
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-30" />
      
      {/* Highlight Ring */}
      <div
        className="fixed border-2 border-purple-500 rounded-lg pointer-events-none z-40 shadow-lg"
        style={{
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.2)'
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed bg-gray-900 border border-purple-500/50 rounded-lg p-4 z-50 max-w-xs shadow-xl"
        style={positions[position]}
      >
        {tooltip}
      </div>
    </>
  );
};

export default function InteractiveTutorial({ guideId, guide, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const step = guide.steps[currentStep];
  const progress = ((currentStep + 1) / guide.steps.length) * 100;

  const handleNext = () => {
    if (currentStep < guide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const user = await base44.auth.me();
      const profile = await base44.entities.UserProfile?.filter({
        user_email: user.email
      }).catch(() => []);

      if (profile?.length > 0) {
        const tutorialProgress = profile[0].tutorial_progress || {
          completed_tutorials: [],
          contextual_tutorials_seen: []
        };

        await base44.entities.UserProfile?.update(profile[0].id, {
          tutorial_progress: {
            ...tutorialProgress,
            completed_tutorials: [...(tutorialProgress.completed_tutorials || []), guideId]
          }
        }).catch(() => {});
      }

      if (onComplete) onComplete(guideId);
    } catch (error) {
      console.error('Tutorial completion error:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    try {
      const user = await base44.auth.me();
      const profile = await base44.entities.UserProfile?.filter({
        user_email: user.email
      }).catch(() => []);

      if (profile?.length > 0) {
        const tutorialProgress = profile[0].tutorial_progress || {
          tutorials_skipped: []
        };

        await base44.entities.UserProfile?.update(profile[0].id, {
          tutorial_progress: {
            ...tutorialProgress,
            tutorials_skipped: [...(tutorialProgress.tutorials_skipped || []), guideId]
          }
        }).catch(() => {});
      }

      if (onSkip) onSkip(guideId);
    } catch (error) {
      console.error('Tutorial skip error:', error);
    }
  };

  return (
    <>
      {/* Highlight & Tooltip */}
      <TutorialOverlay
        highlight={step.highlight_element}
        tooltip={
          <div className="text-white">
            <p className="text-sm font-semibold mb-2">{step.title}</p>
            <p className="text-xs text-gray-300 mb-4">{step.description}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={isCompleting}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {currentStep === guide.steps.length - 1 ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Complete
                  </>
                ) : (
                  <>
                    {step.action_text || 'Next'}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        }
        position={step.tooltip_position}
      />

      {/* Tutorial Header Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-purple-800 border-b border-purple-700/50 p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">{guide.title}</h3>
            <p className="text-xs text-gray-300">
              Step {currentStep + 1} of {guide.steps.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 bg-gray-700/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {guide.skippable && (
              <button
                onClick={handleSkip}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
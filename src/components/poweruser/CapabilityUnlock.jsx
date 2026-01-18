/**
 * Capability Unlock
 * Displays notification when user unlocks new capability tier
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Target, Users, ArrowRight } from 'lucide-react';

export default function CapabilityUnlock({ tier, onDismiss, onExplore }) {
  const [dismissing, setDismissing] = useState(false);

  const tierConfig = {
    tier_1_advanced_learning: {
      icon: Zap,
      title: 'Advanced Learning Tools Unlocked',
      color: 'from-blue-600 to-cyan-600',
      description: 'Based on your progress, you\'ve unlocked AI-powered learning features.',
      features: [
        'Access AI tutor for personalized help',
        'Get custom learning path recommendations',
        'View detailed progress analytics'
      ],
      cta: 'Try AI Tutor'
    },
    tier_2_mastery_tools: {
      icon: Target,
      title: 'Mastery Tools Unlocked',
      color: 'from-purple-600 to-pink-600',
      description: 'Your dedication has unlocked advanced tracking and assessment tools.',
      features: [
        'Create custom practice quizzes',
        'Track skill gap progression',
        'Get mastery-level certifications'
      ],
      cta: 'Explore Tools'
    },
    tier_3_creator_features: {
      icon: Users,
      title: 'Creator Features Unlocked',
      color: 'from-green-600 to-emerald-600',
      description: 'Your engagement unlocked course creation and monetization tools.',
      features: [
        'Create and publish your own courses',
        'Use AI to generate course content',
        'Monetize your expertise'
      ],
      cta: 'Start Creating'
    }
  };

  const config = tierConfig[tier];
  if (!config) return null;

  const Icon = config.icon;

  const handleDismiss = async () => {
    setDismissing(true);
    onDismiss?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 max-w-sm"
    >
      <Card className={`bg-gradient-to-r ${config.color} border-0 overflow-hidden shadow-2xl`}>
        <div className="bg-black/20 backdrop-blur-sm p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg leading-tight">{config.title}</h3>
              <p className="text-white/80 text-sm mt-1">{config.description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {config.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-white/90">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onExplore?.()}
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100 font-semibold"
            >
              {config.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={handleDismiss}
              disabled={dismissing}
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Later
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
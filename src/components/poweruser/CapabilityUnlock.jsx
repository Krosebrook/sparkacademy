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
    tier_1_advanced_discovery: {
      icon: Zap,
      title: 'Advanced Deal Analysis Unlocked',
      color: 'from-blue-600 to-cyan-600',
      description: 'Based on how actively you save and compare deals, you\'ve unlocked deeper analysis tools.',
      features: [
        'Compare deals side-by-side with full details',
        'Save and organize deal collections',
        'See exactly why each deal matches your strategy'
      ],
      cta: 'Try Deal Comparison'
    },
    tier_2_portfolio_intelligence: {
      icon: Target,
      title: 'Portfolio Intelligence Unlocked',
      color: 'from-purple-600 to-pink-600',
      description: 'Your portfolio activity has unlocked advanced forecasting tools.',
      features: [
        'Run scenario modeling to test strategies',
        'See what-if projections automatically',
        'Map deals directly to your goals'
      ],
      cta: 'Explore Scenarios'
    },
    tier_3_network_amplification: {
      icon: Users,
      title: 'Premium Network Access Unlocked',
      color: 'from-green-600 to-emerald-600',
      description: 'Your community engagement unlocked access to higher-signal conversations.',
      features: [
        'Follow verified investment experts',
        'Access highlight-boosted insights',
        'Join premium community discussions'
      ],
      cta: 'Connect with Experts'
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
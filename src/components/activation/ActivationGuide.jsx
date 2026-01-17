/**
 * Activation Guide
 * Displays lightweight, non-blocking guidance based on activation path
 */

import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Zap, Target, Users } from 'lucide-react';

export default function ActivationGuide({ feature, onMilestoneAchieved }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: activation } = useQuery({
    queryKey: ['activation', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const states = await base44.entities.ActivationState?.filter({
        user_email: user.email
      }).catch(() => []);
      return states?.[0];
    },
    enabled: !!user?.email
  });

  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    // Track feature exploration
    if (feature && activation && !activation.activity_signals?.features_explored?.includes(feature)) {
      base44.entities.ActivationState?.update(activation.id, {
        activity_signals: {
          ...activation.activity_signals,
          features_explored: [...(activation.activity_signals?.features_explored || []), feature],
          last_activity_date: new Date().toISOString()
        }
      }).catch(() => {});
    }
  }, [feature, activation]);

  if (!activation || !showGuide || activation.activation_status === 'fully_activated') {
    return null;
  }

  const pathConfig = {
    deal_first: {
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      title: 'Find Your First Deal',
      description: 'We\'ve matched deals based on your sourcing criteria. Save one to improve recommendations.',
      tips: ['Deals are ranked by match score', 'Save to see why they fit', 'Build your watchlist']
    },
    portfolio_first: {
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      title: 'Set Your Goals',
      description: 'Define targets to unlock AI-powered portfolio insights and smarter deal matching.',
      tips: ['Time horizon guides strategy', 'Return targets improve matching', 'Diversification reduces risk']
    },
    community_first: {
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      title: 'Connect with Your Peers',
      description: 'Learn from experienced investors and stay updated on market opportunities.',
      tips: ['Follow experts in your niche', 'Join discussion groups', 'Share insights safely']
    }
  };

  const config = pathConfig[activation.activation_path];
  const Icon = config.icon;

  return (
    <Card className="card-glow border border-purple-500/20 mb-6 overflow-hidden">
      <div className={`bg-gradient-to-r ${config.color} p-0.5`}>
        <div className="bg-slate-900 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-r ${config.color} rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{config.title}</h3>
                <p className="text-sm text-gray-400">{activation.path_rationale}</p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-gray-300 text-sm mb-4">{config.description}</p>

          <div className="space-y-2 mb-4">
            {config.tips.map((tip, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${config.color}`} />
                {tip}
              </div>
            ))}
          </div>

          {activation.activation_path === 'deal_first' && (
            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              Explore Deals
            </Button>
          )}
          {activation.activation_path === 'portfolio_first' && (
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Complete Setup
            </Button>
          )}
          {activation.activation_path === 'community_first' && (
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              Join Communities
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
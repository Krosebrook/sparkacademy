/**
 * Nudge Manager
 * Displays personalized, context-aware nudges
 * Dismissible, context-aware, non-intrusive
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NudgeManager() {
  const [visibleNudges, setVisibleNudges] = useState([]);

  const { data: pendingNudges } = useQuery({
    queryKey: ['pendingNudges'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const nudges = await base44.entities.OnboardingNudge?.filter({
          user_email: user.email,
          status: 'pending'
        }).catch(() => []);
        return nudges || [];
      } catch (e) {
        return [];
      }
    },
    refetchInterval: 30000 // Check every 30 seconds
  });

  // Show nudges one at a time, top to bottom
  useEffect(() => {
    if (pendingNudges?.length > 0) {
      setVisibleNudges([pendingNudges[0]]);
    }
  }, [pendingNudges]);

  const handleDismiss = async (nudge) => {
    try {
      await base44.entities.OnboardingNudge?.update(nudge.id, {
        status: 'dismissed',
        dismissed_date: new Date().toISOString()
      }).catch(() => {});

      setVisibleNudges(prev => prev.filter(n => n.id !== nudge.id));

      // Show next nudge
      const remaining = pendingNudges?.filter(n => n.id !== nudge.id) || [];
      if (remaining.length > 0) {
        setVisibleNudges([remaining[0]]);
      }
    } catch (error) {
      console.error('Nudge dismiss error:', error);
    }
  };

  const handleAction = async (nudge) => {
    try {
      await base44.entities.OnboardingNudge?.update(nudge.id, {
        status: 'acted_on',
        acted_on_date: new Date().toISOString()
      }).catch(() => {});

      setVisibleNudges(prev => prev.filter(n => n.id !== nudge.id));

      if (nudge.cta_url) {
        window.location.href = nudge.cta_url;
      }
    } catch (error) {
      console.error('Nudge action error:', error);
    }
  };

  if (visibleNudges.length === 0) return null;

  const nudge = visibleNudges[0];

  const displayChannelComponents = {
    banner: (
      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-gradient-to-r from-blue-900/90 to-purple-900/90 border border-purple-500/50 rounded-lg shadow-2xl p-4 z-40 backdrop-blur-sm">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-semibold text-white text-sm mb-1">{nudge.headline}</p>
            <p className="text-gray-300 text-xs mb-3">{nudge.message}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(nudge)}
                className="text-xs bg-blue-600 hover:bg-blue-700 flex-1"
              >
                {nudge.cta_text}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              <button
                onClick={() => handleDismiss(nudge)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    sidebar: (
      <div className="fixed right-6 top-24 w-80 bg-gradient-to-b from-slate-800 to-slate-900 border border-purple-500/30 rounded-lg shadow-xl p-4 z-40">
        <div className="flex items-start gap-3 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">{nudge.headline}</p>
          </div>
          <button
            onClick={() => handleDismiss(nudge)}
            className="text-gray-400 hover:text-gray-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-gray-300 text-xs mb-3">{nudge.message}</p>
        <Button
          size="sm"
          onClick={() => handleAction(nudge)}
          className="w-full text-xs bg-purple-600 hover:bg-purple-700"
        >
          {nudge.cta_text}
        </Button>
      </div>
    ),
    modal: (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-800 to-purple-900 border border-purple-500/50 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">{nudge.headline}</h3>
          </div>
          <p className="text-gray-300 text-sm mb-6">{nudge.message}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDismiss(nudge)}
              className="flex-1"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={() => handleAction(nudge)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {nudge.cta_text}
            </Button>
          </div>
        </div>
      </div>
    )
  };

  return displayChannelComponents[nudge.display_channel] || displayChannelComponents.banner;
}
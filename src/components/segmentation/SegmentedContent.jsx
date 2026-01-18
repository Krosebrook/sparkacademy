/**
 * Segmented Content
 * Displays segment-specific messaging and interventions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Zap, AlertCircle, Crown, ArrowRight } from 'lucide-react';

export default function SegmentedContent() {
  const [segments, setSegments] = useState([]);
  const [intervention, setIntervention] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const { data } = await base44.functions.invoke('identifyUserSegments', {});
      setSegments(data.segments || []);
      
      // Trigger intervention if segments exist
      if (data.segments?.length > 0) {
        const { data: interventionData } = await base44.functions.invoke('triggerSegmentedIntervention', {
          segments: data.segments
        });
        if (interventionData.success) {
          setIntervention(interventionData.intervention);
        }
      }
    } catch (error) {
      console.error('Failed to load segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const segmentConfig = {
    emerging_power_learners: {
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-800',
      label: 'Fast Learner'
    },
    active_pro_subscribers: {
      icon: Crown,
      color: 'bg-purple-100 text-purple-800',
      label: 'Active Pro'
    },
    at_risk_engaged_users: {
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800',
      label: 'Needs Attention'
    },
    high_intent_free_learners: {
      icon: Zap,
      color: 'bg-amber-100 text-amber-800',
      label: 'High Intent Learner'
    },
    dormant_premium_users: {
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-800',
      label: 'Premium Re-engage'
    },
    returning_champions: {
      icon: Crown,
      color: 'bg-green-100 text-green-800',
      label: 'Welcome Back'
    },
    new_high_potential: {
      icon: TrendingUp,
      color: 'bg-cyan-100 text-cyan-800',
      label: 'Fast Starter'
    },
    casual_learners: {
      icon: Zap,
      color: 'bg-gray-100 text-gray-800',
      label: 'Casual Learner'
    },
    subscription_churn_risk: {
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800',
      label: 'Retention Priority'
    },
    trial_converters: {
      icon: Crown,
      color: 'bg-indigo-100 text-indigo-800',
      label: 'Trial Active'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!intervention) return null;

  const config = segmentConfig[intervention.segment] || segmentConfig.passive_browsers;
  const Icon = config.icon;

  return (
    <Card className="card-glow border-purple-500/30 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Personalized for You</CardTitle>
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="p-3 bg-white/10 rounded-lg flex-shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-2">{intervention.headline}</h3>
            <p className="text-gray-300 text-sm mb-4">{intervention.message}</p>

            <Button
              onClick={() => window.location.href = intervention.cta_url}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {intervention.cta_text}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Debug: Show all segments */}
        {segments.length > 1 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-2">Your segments:</p>
            <div className="flex flex-wrap gap-2">
              {segments.map((seg, idx) => {
                const segConfig = segmentConfig[seg];
                return segConfig ? (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {segConfig.label}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
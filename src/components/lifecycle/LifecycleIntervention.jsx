/**
 * Lifecycle Intervention
 * Displays state-appropriate intervention message
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Heart, Zap, TrendingUp, Home, Users } from 'lucide-react';

export default function LifecycleIntervention({ intervention, state, churnRisk, onAction, onDismiss }) {
  const [dismissing, setDismissing] = useState(false);

  if (!intervention) return null;

  // Define intervention styling by type
  const interventionConfig = {
    onboarding_guidance: {
      icon: Zap,
      color: 'from-blue-600 to-cyan-600',
      bgGradient: 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20'
    },
    habit_reinforcement: {
      icon: TrendingUp,
      color: 'from-green-600 to-emerald-600',
      bgGradient: 'bg-gradient-to-r from-green-600/20 to-emerald-600/20'
    },
    feature_discovery: {
      icon: Zap,
      color: 'from-purple-600 to-pink-600',
      bgGradient: 'bg-gradient-to-r from-purple-600/20 to-pink-600/20'
    },
    value_reminder: {
      icon: Heart,
      color: 'from-orange-600 to-red-600',
      bgGradient: 'bg-gradient-to-r from-orange-600/20 to-red-600/20'
    },
    relevance_reset: {
      icon: Zap,
      color: 'from-blue-600 to-purple-600',
      bgGradient: 'bg-gradient-to-r from-blue-600/20 to-purple-600/20'
    },
    cognitive_load_reduction: {
      icon: Home,
      color: 'from-gray-600 to-slate-600',
      bgGradient: 'bg-gradient-to-r from-gray-600/20 to-slate-600/20'
    },
    high_signal_summary: {
      icon: AlertCircle,
      color: 'from-indigo-600 to-blue-600',
      bgGradient: 'bg-gradient-to-r from-indigo-600/20 to-blue-600/20'
    },
    reactivation_path: {
      icon: Heart,
      color: 'from-pink-600 to-rose-600',
      bgGradient: 'bg-gradient-to-r from-pink-600/20 to-rose-600/20'
    },
    context_restoration: {
      icon: Users,
      color: 'from-teal-600 to-cyan-600',
      bgGradient: 'bg-gradient-to-r from-teal-600/20 to-cyan-600/20'
    }
  };

  const config = interventionConfig[intervention.intervention_type] || interventionConfig.onboarding_guidance;
  const Icon = config.icon;

  // Determine urgency styling based on churn risk
  const isUrgent = churnRisk === 'critical' || churnRisk === 'high';

  const handleDismiss = async () => {
    setDismissing(true);
    onDismiss?.(intervention.intervention_id, intervention.intervention_type);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${config.bgGradient} border border-opacity-30 rounded-lg p-5 mb-6`}
      >
        <div className="flex gap-4">
          {/* Icon */}
          <div className={`p-2 rounded-lg flex-shrink-0 ${isUrgent ? 'bg-red-500/20' : 'bg-white/10'}`}>
            <Icon className={`w-5 h-5 ${isUrgent ? 'text-red-400' : 'text-white'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-white text-sm leading-tight">
                {intervention.headline}
              </h3>
              {isUrgent && (
                <span className="text-xs font-bold text-red-400 whitespace-nowrap">Needs attention</span>
              )}
            </div>

            <p className="text-white/70 text-sm mb-4">
              {intervention.message}
            </p>

            {/* Tailored messaging based on state */}
            {state === 'at_risk' && (
              <p className="text-xs text-white/50 mb-3">
                Your engagement has declined. We'd love to help you find value again.
              </p>
            )}

            {state === 'dormant' && (
              <p className="text-xs text-white/50 mb-3">
                No pressure to jump back in. Take a few minutes to see what's new.
              </p>
            )}

            {state === 'returning' && (
              <p className="text-xs text-white/50 mb-3">
                Welcome back. Everything you saved is still here.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => onAction?.(intervention)}
                className={`text-sm h-8 ${
                  isUrgent
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {intervention.action === 'view_deals' && 'View Deals'}
                {intervention.action === 'continue_exploring' && 'Continue Exploring'}
                {intervention.action === 'show_comparisons' && 'Try Comparisons'}
                {intervention.action === 'view_metrics' && 'View Metrics'}
                {intervention.action === 'view_new_deals' && 'See New Deals'}
                {intervention.action === 'review_preferences' && 'Review Preferences'}
                {intervention.action === 'simplified_view' && 'Simplify View'}
                {intervention.action === 'view_summary' && 'View Summary'}
                {intervention.action === 'resume_activity' && 'Resume'}
                {intervention.action === 'view_saved_deals' && 'View Saved'}
              </Button>

              <Button
                onClick={handleDismiss}
                disabled={dismissing}
                variant="ghost"
                className="text-sm h-8 text-white/60 hover:text-white hover:bg-white/10"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
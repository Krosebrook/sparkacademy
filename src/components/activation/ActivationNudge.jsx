/**
 * Activation Nudge
 * Displays contextual nudges with dismissal and action tracking
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivationNudge({ nudge, activationStateId }) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      const state = await base44.entities.ActivationState?.get(activationStateId);
      const dismissed = state?.dismissed_nudges || [];

      await base44.entities.ActivationState?.update(activationStateId, {
        dismissed_nudges: [...new Set([...dismissed, nudge.nudge_id])]
      });

      toast.success('Nudge dismissed');
    } catch (error) {
      toast.error('Failed to dismiss nudge');
    } finally {
      setIsDismissing(false);
    }
  };

  const handleAction = async () => {
    try {
      const state = await base44.entities.ActivationState?.get(activationStateId);
      const active = state?.active_nudges || [];

      const updatedActive = active.map(n => 
        n.nudge_id === nudge.nudge_id ? { ...n, status: 'acted_on', clicked_date: new Date().toISOString() } : n
      );

      await base44.entities.ActivationState?.update(activationStateId, {
        active_nudges: updatedActive
      });

      // Navigate to CTA
      if (nudge.cta_url) {
        window.location.href = nudge.cta_url;
      }
    } catch (error) {
      console.error('Action tracking error:', error);
    }
  };

  const surfaceStyles = {
    banner: 'fixed top-16 left-0 right-0 mx-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg backdrop-blur',
    modal: 'fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm',
    toast: 'fixed bottom-6 right-6 max-w-sm',
    sidebar: 'relative bg-slate-800/50 border border-purple-500/20 rounded-lg',
    side_panel: 'relative bg-slate-800/80 border border-purple-500/30 rounded-lg shadow-lg'
  };

  const containerClass = surfaceStyles[nudge.surface] || surfaceStyles.banner;

  return (
    <div className={containerClass + ' p-4 z-40 animate-in fade-in slide-in-from-top'}>
      {nudge.surface === 'modal' && (
        <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-purple-500/30">
          <ActivationNudgeContent nudge={nudge} isDismissing={isDismissing} onDismiss={handleDismiss} onAction={handleAction} />
        </div>
      )}
      {nudge.surface !== 'modal' && (
        <ActivationNudgeContent nudge={nudge} isDismissing={isDismissing} onDismiss={handleDismiss} onAction={handleAction} />
      )}
    </div>
  );
}

function ActivationNudgeContent({ nudge, isDismissing, onDismiss, onAction }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm mb-1">{nudge.headline}</h4>
          <p className="text-gray-300 text-xs mb-3">{nudge.message}</p>
          <Button
            size="sm"
            onClick={onAction}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-7 text-xs"
          >
            {nudge.cta_text}
          </Button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        disabled={isDismissing}
        className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
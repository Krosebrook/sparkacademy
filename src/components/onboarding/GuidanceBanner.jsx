/**
 * Guidance Banner
 * Lightweight, non-blocking guidance for Quick Start users
 * Prompts completion of deferred setup steps
 */

import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function GuidanceBanner({ message, action, onDismiss, severity = 'info' }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const colors = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
    success: 'bg-green-500/10 border-green-500/30 text-green-200'
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className={`border rounded-lg p-3 flex items-center justify-between ${colors[severity]}`}>
      <p className="text-sm flex-1">{message}</p>
      <div className="flex gap-2 ml-4">
        {action && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = action.url}
            className="text-xs"
          >
            {action.label}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-300 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
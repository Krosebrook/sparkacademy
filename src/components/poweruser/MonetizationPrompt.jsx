/**
 * Monetization Prompt
 * Contextual upgrade opportunity with value preview
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

export default function MonetizationPrompt({ moment, onUpgrade, onDismiss }) {
  const [dismissing, setDismissing] = useState(false);

  if (!moment) return null;

  const handleDismiss = async () => {
    setDismissing(true);
    onDismiss?.(moment.moment_id);
  };

  // Determine styling based on moment type
  const isPaywall = moment.moment_type === 'capability_paywall';
  const isUnlockOffer = moment.moment_type === 'tier_unlock_offer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="max-w-md w-full mx-4"
      >
        <Card className={`border-0 ${isPaywall ? 'card-glow' : 'bg-gradient-to-br from-purple-600 to-pink-600'}`}>
          <CardContent className="p-0">
            <div className="p-6">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                disabled={dismissing}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="pr-8">
                <h2 className={`text-2xl font-bold mb-2 ${isPaywall ? 'text-white' : 'text-white'}`}>
                  {moment.headline}
                </h2>

                <p className={`text-sm mb-6 ${isPaywall ? 'text-gray-300' : 'text-white/90'}`}>
                  {moment.message}
                </p>

                {/* Value bullets */}
                {isPaywall && (
                  <div className="space-y-2 mb-6">
                    <div className="flex items-start gap-2 text-sm text-gray-200">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>No hidden limits — save everything you create</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-200">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Share comparisons and scenarios with your team</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-200">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>All your free features + these advanced tools</span>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => onUpgrade?.()}
                    className={`flex-1 font-semibold ${isPaywall 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                      : 'bg-white text-purple-600 hover:bg-gray-100'
                    }`}
                  >
                    {moment.cta_text || 'Learn More'}
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    disabled={dismissing}
                    variant="outline"
                    className={isPaywall ? 'border-gray-600 text-white hover:bg-gray-700/50' : 'border-white text-white hover:bg-white/10'}
                  >
                    Skip
                  </Button>
                </div>

                {/* Confidence note */}
                <p className={`text-xs mt-4 text-center ${isPaywall ? 'text-gray-500' : 'text-white/70'}`}>
                  {isPaywall ? '30-day money-back guarantee' : 'Free forever for basic features'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
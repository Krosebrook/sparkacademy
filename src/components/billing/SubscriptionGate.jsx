import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';

export default function SubscriptionGate({ user }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const currentUrl = window.location.origin;
      const response = await base44.functions.invoke('createSubscriptionCheckout', {
        successUrlBase: `${currentUrl}/subscription-success`,
        cancelUrlBase: `${currentUrl}/landing-page`
      });
      
      if (response.data.url) {
        window.top.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setError('Unable to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-4xl font-extrabold mb-3">
            Welcome to CourseSpark
          </CardTitle>
          <p className="text-lg text-slate-600">
            Subscribe to unlock unlimited access to all features
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-extrabold">$9.99</span>
              <span className="text-xl opacity-90">/month</span>
            </div>
            <p className="text-purple-100">Full platform access • Cancel anytime</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Everything Included:
            </h3>
            
            <div className="grid gap-3">
              {[
                'AI-Powered Course Creation',
                'Unlimited Course Access',
                '24/7 AI Learning Assistant',
                'AI Notes & Resume Generator',
                'Personal Storefront',
                'Certificates & Badges',
                'Community Forums',
                'Premium Analytics',
                'Time Capsule & Learning Wrapped'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Subscribe Now
              </>
            )}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Secure payment powered by Stripe • No commitments • Cancel anytime
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
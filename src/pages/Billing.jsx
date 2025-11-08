import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

export default function Billing() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
    setIsLoading(false);
  };

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    try {
      // Create Stripe customer portal session
      const response = await base44.functions.invoke('createPortalSession', {
        returnUrl: window.location.href
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open billing portal. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const currentUrl = window.location.origin;
      const response = await base44.functions.invoke('createSubscriptionCheckout', {
        successUrlBase: `${currentUrl}/subscription-success`,
        cancelUrlBase: currentUrl + '/billing'
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const subscription = user?.subscription || {};
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const isPastDue = subscription.status === 'past_due';
  const isCancelled = subscription.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Billing & Subscription</h1>
          <p className="text-slate-600">Manage your subscription and billing information</p>
        </div>

        {/* Current Subscription Status */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              {isActive && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
              {isPastDue && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Past Due
                </Badge>
              )}
              {isCancelled && (
                <Badge className="bg-slate-100 text-slate-700">
                  Cancelled
                </Badge>
              )}
              {!subscription.status && (
                <Badge className="bg-slate-100 text-slate-700">
                  Free
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isActive ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">CourseSpark Premium</h3>
                    <p className="text-sm text-slate-600">Full access to all features</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">$9.99</p>
                    <p className="text-xs text-slate-500">per month</p>
                  </div>
                </div>

                {subscription.renews_at && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Renews on {new Date(subscription.renews_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleManageSubscription}
                  disabled={isProcessing}
                  className="w-full"
                  variant="outline"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-slate-500">
                  Update payment method, view invoices, or cancel subscription
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-700 mb-2">Free Plan</h3>
                  <p className="text-sm text-slate-600">
                    You're currently on the free plan. Upgrade to Premium to access all features.
                  </p>
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upgrade to Premium - $9.99/month'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Included */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'AI Course Creator',
                '24/7 AI Learning Assistant',
                'AI Notes Generator',
                'AI Resume Builder',
                'Personal Storefront',
                'Unlimited Course Access',
                'Course Discussions',
                'AI Debate Partner',
                'Collaborative Whiteboard',
                'Creator Analytics',
                'Time Capsule',
                'Learning Wrapped'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Setup Info (only show for admins) */}
        {user?.role === 'admin' && (
          <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-base">Admin: Webhook Setup</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-slate-600">
                To receive subscription updates, configure your Stripe webhook:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 ml-2">
                <li>Go to Stripe Dashboard → Developers → Webhooks</li>
                <li>Click "Add endpoint"</li>
                <li>Use your stripeWebhook function URL as the endpoint</li>
                <li>Select these events:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>checkout.session.completed</li>
                    <li>customer.subscription.updated</li>
                    <li>customer.subscription.deleted</li>
                  </ul>
                </li>
                <li>Copy the signing secret and add it to your webhook_secret environment variable</li>
              </ol>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-slate-500">
                  Find your webhook URL in: Dashboard → Code → Functions → stripeWebhook
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
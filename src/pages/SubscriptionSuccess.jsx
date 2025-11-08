import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function SubscriptionSuccess() {
  const location = useLocation();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your subscription...');
  const [user, setUser] = useState(null);

  useEffect(() => {
    verifySubscription();
  }, []);

  const verifySubscription = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setMessage('No session found. Please contact support.');
        return;
      }

      // Get current user
      const userData = await base44.auth.me();
      setUser(userData);

      // Verify the session and update subscription
      const response = await base44.functions.invoke('verifySubscriptionSession', {
        sessionId: sessionId
      });

      if (response.data.ok) {
        setStatus('success');
        setMessage('Subscription activated successfully!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = createPageUrl('Dashboard');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(response.data.reason || 'Subscription verification failed.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Failed to verify subscription. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          {status === 'verifying' && (
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          )}
          
          <CardTitle className="text-2xl font-extrabold mb-2">
            {status === 'verifying' && 'Processing Payment...'}
            {status === 'success' && 'Welcome to CourseSpark!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-slate-600">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800 font-medium">
                  Your subscription is now active. Redirecting you to the dashboard...
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = createPageUrl('Dashboard')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  If you completed payment, please wait a few moments and refresh this page. 
                  If the issue persists, contact support with your payment confirmation.
                </p>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          )}
          
          {status === 'verifying' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                Please don't close this page. We're activating your subscription...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
/**
 * PWAManager Component
 * 
 * Manages Progressive Web App functionality including:
 * - Service Worker registration and updates
 * - Install prompt handling
 * - Offline status detection
 * - Background sync
 * 
 * @component
 */

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PWAInstallPrompt from './PWAInstallPrompt';

export default function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();
    
    // Listen for install prompt
    handleInstallPrompt();
    
    // Monitor online/offline status
    monitorOnlineStatus();
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Register service worker and handle updates
   */
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        console.log('[PWA] Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              toast.info('Update available!', {
                description: 'A new version is ready. Refresh to update.',
                action: {
                  label: 'Refresh',
                  onClick: () => window.location.reload()
                }
              });
            }
          });
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    }
  };

  /**
   * Handle install prompt event
   */
  const handleInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  };

  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  /**
   * Monitor online/offline status
   */
  const monitorOnlineStatus = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const handleOnline = () => {
    setIsOnline(true);
    toast.success('Back online!', {
      description: 'Your connection has been restored.'
    });
    
    // Trigger background sync if supported
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-progress');
      });
    }
  };

  const handleOffline = () => {
    setIsOnline(false);
    toast.warning('You are offline', {
      description: 'Some features may be limited.'
    });
  };

  return (
    <>
      {/* Install prompt component */}
      {deferredPrompt && <PWAInstallPrompt deferredPrompt={deferredPrompt} />}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 bg-yellow-900/90 backdrop-blur-sm text-yellow-300 px-4 py-2 rounded-lg shadow-lg border border-yellow-500/50">
          📡 Offline Mode
        </div>
      )}
    </>
  );
}
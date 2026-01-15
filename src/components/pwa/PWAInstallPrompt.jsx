import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

/**
 * PWA Install Prompt Component
 * Shows install prompt for Progressive Web App functionality
 * Handles iOS and Android install patterns
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event (Chrome, Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds or on second visit
      const installPromptShown = localStorage.getItem('pwa-install-shown');
      if (!installPromptShown) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
      localStorage.setItem('pwa-install-shown', 'true');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-shown', 'true');
  };

  if (isInstalled || (!showPrompt && !isIOS)) {
    return null;
  }

  // iOS install instructions (can't programmatically trigger)
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom">
        <Card className="card-glow shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-6 h-6 text-cyan-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">Install FlashFusion</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Install our app for the best experience. Tap the share button 
                  <span className="inline-block mx-1 px-1 bg-blue-500 rounded">⎋</span> 
                  and select "Add to Home Screen"
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Android/Chrome install prompt
  if (deferredPrompt && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom">
        <Card className="card-glow shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Download className="w-6 h-6 text-cyan-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">Install FlashFusion</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Get quick access and work offline by installing our app
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="btn-primary flex-1"
                  >
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="outline"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
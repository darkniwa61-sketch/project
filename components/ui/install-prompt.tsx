'use client';

import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, MonitorSmartphone } from 'lucide-react';

export function InstallPrompt() {
  const [isReady, setIsReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the user is already on the installed PWA
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    setIsStandalone(checkStandalone);

    // If they are already installed, or they previously dismissed this, don't show it again
    if (checkStandalone || localStorage.getItem('pwaPromptDismissed')) {
      return;
    }

    // iOS Detection (Safari does not support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      setShowPrompt(true);
    }

    // Android / Chrome / Desktop Installation listener
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    setIsReady(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Remember that the user dismissed it so it doesn't annoy them every visit
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!isReady || isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-[#e7e5e4] shadow-lg rounded-xl p-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1c1917] rounded-lg flex items-center justify-center shrink-0">
            <MonitorSmartphone className="text-[#c26941] w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2d2621] text-sm md:text-base">Install App</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add Amity Prime to your device for quick access.
            </p>
          </div>
        </div>
        <button 
          onClick={dismissPrompt}
          className="p-1 -mr-2 -mt-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4">
        {isIOS ? (
           <div className="bg-[#fafafa] rounded text-xs text-[#2d2621] p-3 border border-[#e7e5e4]">
             <p className="flex items-center gap-2 mb-2">
               1. Tap the <Share className="w-4 h-4 text-blue-500"/> Share button
             </p>
             <p className="flex items-center gap-2">
               2. Select <PlusSquare className="w-4 h-4 text-gray-500" /> &quot;Add to Home Screen&quot;
             </p>
           </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-[#1c1917] hover:bg-[#2d2621] text-white text-sm font-medium py-2 rounded transition-colors"
          >
            Install Now
          </button>
        )}
      </div>
    </div>
  );
}

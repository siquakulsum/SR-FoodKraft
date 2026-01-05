// PWA Utility Functions

export const isPWAInstalled = (): boolean => {
  // Check if running in standalone mode
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check if app is installed (for iOS)
  const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOSDevice) {
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    return isInStandaloneMode;
  }
  
  return standalone;
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
  }
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
};

export const getServiceWorkerVersion = async (): Promise<string | null> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }
  return null;
};

export const updateServiceWorker = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  }
};

export const addToHomeScreen = (): void => {
  // This function is called when user wants to add to home screen
  // The actual implementation depends on the platform
  if (isIOS()) {
    // For iOS, we show instructions
    alert('To add this app to your home screen:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
  } else {
    // For Android/Desktop, the browser will handle this
    console.log('Add to home screen functionality triggered');
  }
};

export const getInstallPrompt = (): Promise<BeforeInstallPromptEvent | null> => {
  return new Promise((resolve) => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      resolve(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt, { once: true });
    
    // Resolve with null after 5 seconds if no prompt is received
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      resolve(null);
    }, 5000);
  });
};

export const installPWA = async (): Promise<boolean> => {
  const prompt = await getInstallPrompt();
  if (prompt) {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    return outcome === 'accepted';
  }
  return false;
};

export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches;
};

export const getDisplayMode = (): string => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  return 'browser';
};

export const shareContent = async (data: ShareData): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }
  return false;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// PWA Analytics
export const trackPWAEvent = (eventName: string, properties?: Record<string, any>): void => {
  // This would integrate with your analytics service
  console.log('PWA Event:', eventName, properties);
  
  // Example: Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'PWA',
      ...properties
    });
  }
};

export const trackInstallPrompt = (outcome: 'accepted' | 'dismissed'): void => {
  trackPWAEvent('pwa_install_prompt', { outcome });
};

export const trackAppInstalled = (): void => {
  trackPWAEvent('pwa_installed');
};

export const trackOfflineUsage = (): void => {
  trackPWAEvent('pwa_offline_usage');
};

export const trackOnlineUsage = (): void => {
  trackPWAEvent('pwa_online_usage');
};

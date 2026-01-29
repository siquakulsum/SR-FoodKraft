import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { registerServiceWorker } from '../../utils/pwa';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const PWARegistration: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        const checkInstalled = () => {
            // Check if running in standalone mode
            const standalone = window.matchMedia('(display-mode: standalone)').matches;
            setIsStandalone(standalone);

            // Check if app is installed (for iOS)
            const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
            setIsIOS(isIOSDevice);

            if (isIOSDevice) {
                // Check if already added to home screen
                const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
                setIsInstalled(isInStandaloneMode);
            } else {
                setIsInstalled(standalone);
            }
        };

        checkInstalled();

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show install prompt after a delay if not dismissed before
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed) {
                setTimeout(() => {
                    setShowInstallPrompt(true);
                }, 3000);
            }
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            console.log('PWA was installed');
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
            localStorage.removeItem('pwa-install-dismissed');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Register service worker using centralized utility
        registerServiceWorker().then((registration) => {
            if (registration) {
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content is available, show update notification
                                showUpdateNotification();
                            }
                        });
                    }
                });
            }
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const showUpdateNotification = () => {
        // You can implement a custom update notification here
        if (confirm('A new version of the app is available. Would you like to update?')) {
            window.location.reload();
        }
    };

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }

            setDeferredPrompt(null);
            setShowInstallPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    const handleIOSInstall = () => {
        // For iOS, we show instructions
        setShowInstallPrompt(true);
    };

    // Don't show if already installed or in standalone mode
    if (isInstalled || isStandalone) {
        return null;
    }

    return (
        <>
            {/* Install Button for Android/Desktop */}
            {!isIOS && deferredPrompt && (
                <button
                    onClick={handleInstallClick}
                    className="fixed bottom-4 right-4 bg-gold text-black px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-500 transition-colors z-50 flex items-center space-x-2"
                >
                    <Download className="h-4 w-4" />
                    <span>Install App</span>
                </button>
            )}

            {/* Install Button for iOS */}
            {isIOS && !isInstalled && (
                <button
                    onClick={handleIOSInstall}
                    className="fixed bottom-4 right-4 bg-gold text-black px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-500 transition-colors z-50 flex items-center space-x-2"
                >
                    <Smartphone className="h-4 w-4" />
                    <span>Add to Home</span>
                </button>
            )}

            {/* Install Prompt Modal */}
            {showInstallPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Install Food Kraft App
                            </h3>
                            <button
                                onClick={handleDismiss}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    Add Food Kraft to your home screen for quick access and a better experience!
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">How to install:</h4>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                        <li>Tap the Share button <span className="inline-block w-4 h-4 bg-gray-300 rounded mx-1"></span> at the bottom of your screen</li>
                                        <li>Scroll down and tap "Add to Home Screen"</li>
                                        <li>Tap "Add" to confirm</li>
                                    </ol>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleDismiss}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Maybe Later
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="flex-1 px-4 py-2 bg-gold text-black rounded-lg hover:bg-yellow-500 transition-colors"
                                    >
                                        Got It!
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    Install Food Kraft app for a better experience with offline access and faster loading!
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        <li>Faster loading and better performance</li>
                                        <li>Works offline for browsing menu</li>
                                        <li>Push notifications for order updates</li>
                                        <li>Native app-like experience</li>
                                    </ul>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleDismiss}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Not Now
                                    </button>
                                    <button
                                        onClick={handleInstallClick}
                                        className="flex-1 px-4 py-2 bg-gold text-black rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Install</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PWARegistration;

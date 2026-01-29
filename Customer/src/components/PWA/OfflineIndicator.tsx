import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowIndicator(true);
            // Hide indicator after 3 seconds when back online
            setTimeout(() => setShowIndicator(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowIndicator(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showIndicator) {
        return null;
    }

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
            }`}>
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="flex items-center justify-center space-x-2">
                    {isOnline ? (
                        <>
                            <Wifi className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                You're back online! Your data will sync automatically.
                            </span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                You're offline. Some features may be limited.
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfflineIndicator;

'use client';

import { usePWA } from '@/providers/pwa-context';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 mx-4">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-red-600" />
        <div>
          <p className="text-sm font-medium text-red-800">You're offline</p>
          <p className="text-xs text-red-600">
            Some features may be limited. Your data will sync when you're back online.
          </p>
        </div>
      </div>
    </div>
  );
}

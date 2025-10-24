'use client';

import { usePWA } from '@/providers/pwa-context';
import { Download, CheckCircle, WifiOff } from 'lucide-react';

export function PWAStatus() {
  const { isInstalled, isOnline, canInstall, triggerInstall } = usePWA();

  if (isInstalled) {
    return (
      <div className="flex items-center space-x-1 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-xs font-medium">Installed</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center space-x-1 text-red-600">
        <WifiOff className="w-4 h-4" />
        <span className="text-xs font-medium">Offline</span>
      </div>
    );
  }

  if (canInstall) {
    return (
      <button
        onClick={triggerInstall}
        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="text-xs font-medium">Install</span>
      </button>
    );
  }

  return null;
}

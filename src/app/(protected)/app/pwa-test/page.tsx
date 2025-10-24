// src/app/(protected)/app/pwa-test/page.tsx
'use client';

import { usePWA } from '@/providers/pwa-context';
import { useEffect, useState } from 'react';

export default function PWATestPage() {
  const { isInstalled, isOnline, canInstall, triggerInstall } = usePWA();
  const [swStatus, setSwStatus] = useState<string>('checking...');
  const [manifestStatus, setManifestStatus] = useState<string>('checking...');
  const [cacheCount, setCacheCount] = useState<number>(0);

  useEffect(() => {
    // Check Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          setSwStatus(registration.active ? '✅ Active' : '⚠️ Not Active');
        })
        .catch(() => setSwStatus('❌ Not Registered'));
    } else {
      setSwStatus('❌ Not Supported');
    }

    // Check Manifest
    fetch('/manifest.json')
      .then((response) => {
        setManifestStatus(response.ok ? '✅ Valid' : '❌ Invalid');
      })
      .catch(() => setManifestStatus('❌ Not Found'));

    // Check Cache Storage
    if ('caches' in window) {
      caches.keys().then((keys) => {
        setCacheCount(keys.length);
      });
    }
  }, []);

  const clearCaches = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      alert('All caches cleared! Refresh the page.');
    }
  };

  const unregisterSW = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
      alert('Service worker unregistered! Refresh the page.');
    }
  };

  const forceUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        alert('Service worker update triggered!');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">PWA Diagnostic Page</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">PWA Context Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Installed:</span>
              <span className="font-mono">{isInstalled ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>Online:</span>
              <span className="font-mono">{isOnline ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>Can Install:</span>
              <span className="font-mono">{canInstall ? '✅' : '❌'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Browser Support</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Service Worker:</span>
              <span className="font-mono">
                {'serviceWorker' in navigator ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cache API:</span>
              <span className="font-mono">
                {'caches' in window ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Notifications:</span>
              <span className="font-mono">
                {'Notification' in window ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Service Worker</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-mono">{swStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>Caches:</span>
              <span className="font-mono">{cacheCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Manifest</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-mono">{manifestStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>Display Mode:</span>
              <span className="font-mono">
                {window.matchMedia('(display-mode: standalone)').matches
                  ? 'standalone'
                  : 'browser'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {canInstall && (
            <button
              onClick={triggerInstall}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Install App
            </button>
          )}
          <button
            onClick={forceUpdate}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Force SW Update
          </button>
          <button
            onClick={clearCaches}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Clear All Caches
          </button>
          <button
            onClick={unregisterSW}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Unregister SW
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2 text-blue-900">Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Check all status indicators show green checkmarks</li>
          <li>Try going offline (DevTools → Network → Offline)</li>
          <li>Install the app using the install button or browser prompt</li>
          <li>Open DevTools → Application tab to inspect SW and manifest</li>
          <li>Run Lighthouse audit for PWA score</li>
        </ol>
      </div>

      {/* Console Commands */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
        <h2 className="text-lg font-semibold mb-2">Console Commands</h2>
        <p className="text-sm text-gray-600 mb-4">
          Copy these into your browser console for detailed diagnostics:
        </p>
        <div className="space-y-3">
          <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
            <code>
              {`// Check SW status
navigator.serviceWorker.ready.then(r => console.log(r))`}
            </code>
          </div>
          <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
            <code>
              {`// List all caches
caches.keys().then(keys => console.log('Caches:', keys))`}
            </code>
          </div>
          <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
            <code>
              {`// Check if installed
console.log('Installed:', window.matchMedia('(display-mode: standalone)').matches)`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
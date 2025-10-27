'use client';

import { useEffect, useState } from 'react';

export function LandscapeWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth <= 768 && window.orientation !== 0) {
        setShowWarning(true);
        // Prevent scrolling in landscape
        document.body.style.overflow = 'hidden';
      } else {
        setShowWarning(false);
        document.body.style.overflow = 'auto';
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="landscape-warning">
      <div>
        <h2 className="text-2xl font-bold mb-4">Please rotate your device</h2>
        <p className="text-lg">This app works best in portrait mode on mobile devices.</p>
        <div className="mt-6">
          <div className="w-16 h-16 mx-auto border-4 border-white rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white rounded transform rotate-90"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

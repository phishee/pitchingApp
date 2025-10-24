// src/components/layouts/mobile-header.tsx
'use client';

import { useLayout } from '@/providers/layout-context';
import { useHeader } from '@/providers/header-context';
import { MobileUserProfile } from './mobile-user-profile';
import { PWAStatus } from '@/components/pwa/pwa-status';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { useState, useEffect } from 'react';

export function MobileHeader() {
  const { isMobile, headerVisible } = useLayout();
  const { 
    title, 
    showBackButton, 
    backAction, 
    rightContent, 
    variant, 
    isLoading 
  } = useHeader();
  const router = useRouter();
  const { scrollDirection, isScrolling } = useScrollDirection();
  const [shouldHide, setShouldHide] = useState(false);
  
  // Update hide state based on scroll - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    const scrollY = window.scrollY;
    
    // Always show when at the top
    if (scrollY < 50) {
      setShouldHide(false);
      return;
    }
    
    // Hide when scrolling down, show when scrolling up
    if (isScrolling) {
      setShouldHide(scrollDirection === 'down');
    }
  }, [scrollDirection, isScrolling]);
  
  // Early return AFTER all hooks
  if (!isMobile || !headerVisible) return null;
  
  // Default back action (browser back)
  const handleBack = () => {
    if (backAction) {
      backAction();
    } else {
      router.back();
    }
  };
  
  // Render right content or fallback to user profile
  const renderRightContent = () => {
    if (rightContent) {
      return rightContent;
    }
    return <MobileUserProfile />;
  };

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <header className={`fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-2 transition-transform duration-300 ease-in-out ${
        shouldHide ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="flex items-center justify-between h-10">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-sm font-medium text-gray-900 flex-1 text-center">
            {isLoading ? 'Loading...' : title}
          </h1>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>
      </header>
    );
  }
  
  // Full variant (default)
  return (
    <header className={`fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200 px-4 py-3 transition-transform duration-300 ease-in-out ${
      shouldHide ? '-translate-y-full' : 'translate-y-0'
    }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Loading...' : title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <PWAStatus />
            {renderRightContent()}
          </div>
        </div>
    </header>
  );
}
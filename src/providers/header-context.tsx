// src/providers/header-context.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type HeaderVariant = 'minimal' | 'full';

interface HeaderContextType {
  // Title management
  title: string;
  setTitle: (title: string) => void;
  
  // Back button
  showBackButton: boolean;
  setShowBackButton: (show: boolean) => void;
  backAction?: () => void;
  setBackAction: (action: () => void) => void;
  
  // Right side content
  rightContent?: React.ReactNode;
  setRightContent: (content: React.ReactNode) => void;
  
  // Header variant
  variant: HeaderVariant;
  setVariant: (variant: HeaderVariant) => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Reset header to default
  resetHeader: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

interface HeaderProviderProps {
  children: ReactNode;
}

export function HeaderProvider({ children }: HeaderProviderProps) {
  const router = useRouter();
  
  // Title state
  const [title, setTitle] = useState<string>('Page');
  
  // Back button state
  const [showBackButton, setShowBackButton] = useState<boolean>(false);
  const [backAction, setBackAction] = useState<(() => void) | undefined>(undefined);
  
  // Right content state
  const [rightContent, setRightContent] = useState<ReactNode | undefined>(undefined);
  
  // Header variant
  const [variant, setVariant] = useState<HeaderVariant>('full');
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Default back action (browser back)
  const defaultBackAction = () => {
    router.back();
  };
  
  // Reset to default values
  const resetHeader = () => {
    setTitle('Page');
    setShowBackButton(false);
    setBackAction(undefined);
    setRightContent(undefined);
    setVariant('full');
    setIsLoading(false);
  };
  
  const value: HeaderContextType = {
    // Title management
    title,
    setTitle,
    
    // Back button
    showBackButton,
    setShowBackButton,
    backAction,
    setBackAction,
    
    // Right side content
    rightContent,
    setRightContent,
    
    // Header variant
    variant,
    setVariant,
    
    // Loading state
    isLoading,
    setIsLoading,
    
    // Reset
    resetHeader,
  };
  
  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
}

// Custom hook to use the header context
export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}
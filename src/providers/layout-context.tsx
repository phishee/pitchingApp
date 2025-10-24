// src/providers/layout-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Standard breakpoints (most commonly used)
const BREAKPOINTS = {
  mobile: 768,    // Standard mobile breakpoint
  tablet: 1024,   // Standard tablet breakpoint
  desktop: 1280,  // Standard desktop breakpoint
} as const;

interface LayoutContextType {
  // Device detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Screen dimensions (always up-to-date)
  screenWidth: number;
  screenHeight: number;
  
  // Navigation state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  bottomNavVisible: boolean;
  headerVisible: boolean; // Add this for header visibility control
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setBottomNavVisible: (visible: boolean) => void;
  setHeaderVisible: (visible: boolean) => void; // Add this
  toggleHeader: () => void; // Add this for convenience
  
  // Current page/section (for active states)
  currentPage?: string;
  setCurrentPage: (page: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  // Screen dimensions state
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [screenHeight, setScreenHeight] = useState<number>(0);
  
  // Navigation state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [bottomNavVisible, setBottomNavVisible] = useState<boolean>(false);
  const [headerVisible, setHeaderVisible] = useState<boolean>(true); // Add this, default to true
  
  // Current page state
  const [currentPage, setCurrentPage] = useState<string>('');
  
  // Device detection based on screen width
  const isMobile = screenWidth > 0 && screenWidth < BREAKPOINTS.mobile;
  const isTablet = screenWidth >= BREAKPOINTS.mobile && screenWidth < BREAKPOINTS.tablet;
  const isDesktop = screenWidth >= BREAKPOINTS.tablet;
  
  // Update screen dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };
    
    // Set initial dimensions
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Auto-manage navigation visibility based on device type
  useEffect(() => {
    if (isMobile) {
      setBottomNavVisible(true);
      setSidebarOpen(false);
      setHeaderVisible(true); // Show header on mobile by default
    } else {
      setBottomNavVisible(false);
      setSidebarOpen(true);
      setHeaderVisible(false); // Hide header on desktop by default
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  const toggleHeader = () => {
    setHeaderVisible(prev => !prev);
  };
  
  const value: LayoutContextType = {
    // Device detection
    isMobile,
    isTablet,
    isDesktop,
    
    // Screen dimensions
    screenWidth,
    screenHeight,
    
    // Navigation state
    sidebarOpen,
    sidebarCollapsed,
    bottomNavVisible,
    headerVisible, // Add this
    
    // Actions
    setSidebarOpen,
    setSidebarCollapsed,
    toggleSidebar,
    setBottomNavVisible,
    setHeaderVisible, // Add this
    toggleHeader, // Add this
    
    // Current page
    currentPage,
    setCurrentPage,
  };
  
  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

// Custom hook to use the layout context
export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

// Export breakpoints for use in components
export { BREAKPOINTS };
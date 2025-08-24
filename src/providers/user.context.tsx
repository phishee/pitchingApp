'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './auth-context';
import { User } from '@/models';
import { userApi } from '@/app/services-client/userApi';

interface UserContextType {
  user: Partial<User> | null;
  setUser: (user: Partial<User> | null) => void;
  isLoading: boolean;
  error: string;
  loadUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { userFromFirebase } = useAuth();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add ref to track if we're already loading to prevent duplicate calls
  const loadingRef = useRef(false);
  const lastFirebaseUidRef = useRef<string | null>(null);

  // Reset function for logout - make it stable with useCallback
  const resetUserState = useCallback(() => {
    setUser(null);
    setIsLoading(true);
    setError('');
    loadingRef.current = false;
    lastFirebaseUidRef.current = null;
  }, []);

  // Make loadUserData stable with useCallback and proper dependencies
  const loadUserData = useCallback(async () => {
    if (!userFromFirebase?.uid || loadingRef.current) {
      if (!userFromFirebase?.uid) {
        setUser(null);
        setIsLoading(false);
      }
      return;
    }

    // Prevent duplicate calls
    loadingRef.current = true;

    try {
      setIsLoading(true);
      setError('');
      
      const userData = await userApi.getUser(userFromFirebase.uid);
      setUser(userData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // User doesn't exist in DB yet (probably in onboarding)
        setUser(null);
      } else if (error.code === 'ERR_NETWORK') {
        // Network error - don't retry, just set error state
        console.error('Network error loading user:', error);
        setError('Network error - please check your connection');
        setUser(null);
      } else {
        console.error('Error loading user:', error);
        setError('Failed to load user data');
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [userFromFirebase?.uid]); // Only depend on the actual UID

  // Listen for logout event
  useEffect(() => {
    const handleLogout = () => {
      resetUserState();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [resetUserState]);

  // Load user data when Firebase user changes - but only when it actually changes
  useEffect(() => {
    const currentUid = userFromFirebase?.uid || null;
    
    // Only load if the UID actually changed
    if (currentUid && currentUid !== lastFirebaseUidRef.current) {
      lastFirebaseUidRef.current = currentUid;
      loadUserData();
    } else if (!currentUid && lastFirebaseUidRef.current !== null) {
      // User logged out
      lastFirebaseUidRef.current = null;
      setUser(null);
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [userFromFirebase?.uid, loadUserData]);

  // Remove the duplicate effect - it's redundant with the above effect
  
  const value: UserContextType = {
    user,
    isLoading,
    error,
    loadUserData,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
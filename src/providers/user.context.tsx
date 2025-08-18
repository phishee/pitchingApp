'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { User } from '@/models';
import { userApi } from '@/app/services-client/userApi';

interface UserContextType {
  user: Partial<User> | null;
  setUser: (user: Partial<User> | null) => void; // Partial<User> is used to allow partial updates
  isLoading: boolean;
  error: string;
  loadUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { userFromFirebase, token } = useAuth();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true
  const [error, setError] = useState('');

  // Reset function for logout
  const resetUserState = () => {
    setUser(null);
    setIsLoading(true); // Reset to loading when clearing
    setError('');
  };

  // Listen for logout event
  useEffect(() => {
    const handleLogout = () => {
      resetUserState();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const loadUserData = async () => {
    if (!userFromFirebase?.uid) {
      setUser(null);
      setIsLoading(false); // No Firebase user, stop loading
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const userData = await userApi.getUser(userFromFirebase.uid);
      setUser(userData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // User doesn't exist in DB yet (probably in onboarding)
        setUser(null);
      } else {
        console.error('Error loading user:', error);
        setError('Failed to load user data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data when Firebase user changes
  useEffect(() => {
    if (userFromFirebase) {
      loadUserData();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [userFromFirebase]);

  // Also reset when userFromFirebase becomes null (backup)
  useEffect(() => {
    if (!userFromFirebase) {
      resetUserState();
      setIsLoading(false); // Stop loading when no Firebase user
    }
  }, [userFromFirebase]);

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
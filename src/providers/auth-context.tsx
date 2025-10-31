'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  getIdToken,
  onIdTokenChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userApi } from '@/app/services-client/userApi';
import { useRouter } from 'next/navigation';
import { usePathname } from "next/navigation";

interface AuthContextType {
  // Firebase authentication only
  userFromFirebase: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  isOnboardingComplete: boolean;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  
  // Firebase user management
  setUserFromFirebase: (user: FirebaseUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage keys
const TOKEN_KEY = 'firebase_id_token';
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

// Token management functions
const saveToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

const clearTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

const isOnboardingComplete = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
  } catch (error) {
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userFromFirebase, setUserFromFirebase] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Listen for auth state and token changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {      
      // Always set the Firebase user state first
      setUserFromFirebase(firebaseUser);
      
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser, true);
          setToken(idToken);
          saveToken(idToken);
          
          // Set onboarding status from localStorage
          const onboardingStatus = isOnboardingComplete();
          setOnboardingCompleteState(onboardingStatus);
          
          // Don't fetch user data here - let UserProvider handle it
          // Just handle token and basic auth state
          
        } catch (error: any) {
          console.error('Error getting token:', error);
          setToken(null);
          clearTokens();
        }
      } else {
        // No Firebase user - clear everything
        setToken(null);
        clearTokens();
        setOnboardingCompleteState(false);
      }
      setIsLoading(false);
    });

    // Listen for token changes (automatic refresh)
    const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser);
          setToken(idToken);
          saveToken(idToken);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      } else {
        setToken(null);
        clearTokens();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [pathname, router]);

  // Separate function to handle navigation after login/signup
  const navigateAfterAuth = async (firebaseUser: FirebaseUser) => {
    try {
      
      // Check if user exists in database using the unauthenticated check method
      const result = await userApi.checkUserExists(firebaseUser.uid);
      
      
      if (result.exists && result.user) {
        // User exists - go to dashboard
        router.push('/app/dashboard');
      } else {
        // User doesn't exist - go to onboarding
        router.push('/onboarding');
      }
    } catch (error: any) {
      // On any error, go to onboarding
      router.push('/onboarding');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get fresh token
      const idToken = await getIdToken(userCredential.user, true);
      setToken(idToken);
      saveToken(idToken);
      
      // Check onboarding status
      const onboardingStatus = isOnboardingComplete();
      setOnboardingCompleteState(onboardingStatus);
      
      // Navigate based on user status
      await navigateAfterAuth(userCredential.user);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Dispatch logout event to clear all provider data
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Firebase sign out
      await signOut(auth);
      setUserFromFirebase(null);
      setIsLoading(false);
      setToken(null);
      setOnboardingCompleteState(false);
      clearTokens();
      
      // Navigate to sign-in
      router.push('/sign-in');
    } catch (error: any) {
      console.error('Error during logout:', error);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Get token after user creation
      const idToken = await getIdToken(userCredential.user);
      setToken(idToken);
      saveToken(idToken);
      
      setOnboardingCompleteState(false);
      
      // Navigate based on user status
      await navigateAfterAuth(userCredential.user);
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Get fresh token
      const idToken = await getIdToken(userCredential.user, true);
      setToken(idToken);
      saveToken(idToken);

      // Check if this is a new user (no onboarding complete flag)
      const onboardingStatus = isOnboardingComplete();
      setOnboardingCompleteState(onboardingStatus);
      
      // Navigate based on user status
      await navigateAfterAuth(userCredential.user);
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const idToken = await getIdToken(currentUser, true);
        setToken(idToken);
        saveToken(idToken);
        return idToken;
      }
      return null;
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const value = {
    userFromFirebase,
    isLoading,
    isAuthenticated: !!userFromFirebase,
    token,
    isOnboardingComplete: onboardingComplete,
    setUserFromFirebase,
    login,
    logout,
    signup,
    signInWithGoogle,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
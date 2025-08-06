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
import { User } from '@/models';
import { userApi } from '@/app/services-client/userApi';
import { useRouter } from 'next/navigation';
import { usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  isOnboardingComplete: boolean;
  userFromFirebase: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  // updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<string | null>;
  setUserFromFirebase: (user: FirebaseUser | null) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default profile image path
const DEFAULT_PROFILE_IMAGE = '/assets/images/default_profile.png';

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

const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
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

const setOnboardingComplete = () => {
  try {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userFromFirebase, setUserFromFirebase] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // Listen for auth state and token changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser, true);
          setToken(idToken);
          saveToken(idToken);
  
          // Check if user exists in your DB
          let user = null;
          try {
            user = await userApi.getUser(firebaseUser.uid);
          } catch (err: any) {
            if (err.response && err.response.status !== 404) {
              throw err; // Only ignore 404, rethrow other errors
            }
          }
  
          if (user) {
            setUser(user);
            if (pathname === "/login" || pathname === "/onboarding") {
              router.push("/app/dashboard");
            } else {
              router.push(pathname)
            }
          } else {
            // User not found, go to onboarding
            setUser(null);
            router.push("/onboarding");
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setToken(null);
          clearTokens();
        }
      } else {
        setUser(null);
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
  }, []);

  useEffect(() => {
    console.log("userFromFirebase", userFromFirebase);
  }, [userFromFirebase]);

  const navigateAfterLogin = async(userFromFirebase: FirebaseUser) => {
    try {
      const user = await userApi.getUser(userFromFirebase?.uid || "");
      if (user) {
        router.push('/app/dashboard');
      }
    } catch (error: any) {
      if(error.status === 404) {
        setUserFromFirebase(userFromFirebase);
        router.push('/onboarding');
      }
     
    }
  }

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
      navigateAfterLogin(userCredential.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setToken(null);
      clearTokens();
      setOnboardingCompleteState(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
      navigateAfterLogin(userCredential.user);
      setOnboardingCompleteState(false);
    } catch (error) {
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

      navigateAfterLogin(userCredential.user);
      
      // Check if this is a new user (no onboarding complete flag)
      const onboardingStatus = isOnboardingComplete();
      setOnboardingCompleteState(onboardingStatus);
    } catch (error) {
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
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  // const updateUser = (userData: Partial<User>) => {
  //   // if (user) {
  //   //   setUser({ ...user, ...userData });
  //   // }
  // };

  const value = {
    user,
    userFromFirebase,
    isLoading,
    isAuthenticated: !!user,
    token,
    isOnboardingComplete: onboardingComplete,
    setUserFromFirebase,
    login,
    logout,
    signup,
    signInWithGoogle,
    // updateUser,
    refreshToken,
    setUser,
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
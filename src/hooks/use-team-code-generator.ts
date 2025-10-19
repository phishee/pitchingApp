'use client';

import { useState, useCallback } from 'react';
import { teamApi } from '@/app/services-client/teamApi';

// Hook for generating unique team codes
export function useTeamCodeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a random 6-character code
  const generateRandomCode = useCallback((): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }, []);

  // Check if a code is unique
  const checkCodeUniqueness = useCallback(async (code: string): Promise<boolean> => {
    try {
      const existingTeam = await teamApi.getTeamByCode(code);
      return !existingTeam; // Return true if no team exists (code is unique)
    } catch (err: any) {
      // If we get a 404 error, the code is unique
      if (err.response && err.response.status === 404) {
        return true;
      }
      // For other errors, throw them
      throw err;
    }
  }, []);

  // Generate a unique team code
  const generateUniqueCode = useCallback(async (): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      let code: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loops

      do {
        code = generateRandomCode();
        
        try {
          isUnique = await checkCodeUniqueness(code);
        } catch (err) {
          console.error('Error checking code uniqueness:', err);
          setError('Failed to verify code uniqueness. Please try again.');
          throw err;
        }

        attempts++;
        
        // If we've tried too many times, throw an error
        if (attempts >= maxAttempts) {
          throw new Error('Unable to generate a unique code after multiple attempts');
        }
      } while (!isUnique);

      return code;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate team code';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [generateRandomCode, checkCodeUniqueness]);

  // Clear any existing error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateUniqueCode,
    isGenerating,
    error,
    clearError,
  };
}

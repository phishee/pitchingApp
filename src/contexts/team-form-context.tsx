'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Team, TeamColor } from '@/models';
import { createTeamColor, getDefaultTeamColor } from '@/lib/colorUtils';

// Form mode type
export type TeamFormMode = 'create' | 'edit';

// Team form data interface
export interface TeamFormData {
  name: string;
  description: string;
  logoUrl: string;
  teamCode: string;
  color: TeamColor;
  facilityId: string;
}

// Validation errors interface
export interface TeamFormErrors {
  name?: string;
  description?: string;
  teamCode?: string;
  facilityId?: string;
  general?: string;
}

// Context state interface
interface TeamFormContextState {
  // Form data
  formData: TeamFormData;
  
  // Form state
  mode: TeamFormMode;
  isLoading: boolean;
  isSubmitting: boolean;
  errors: TeamFormErrors;
  
  // Team data (for edit mode)
  existingTeam: Team | null;
}

// Context actions interface
interface TeamFormContextActions {
  // Form data actions
  setFormData: (data: Partial<TeamFormData>) => void;
  updateField: (field: keyof TeamFormData, value: string | object) => void;
  resetForm: () => void;
  
  // Form state actions
  setMode: (mode: TeamFormMode) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setErrors: (errors: Partial<TeamFormErrors>) => void;
  clearErrors: () => void;
  
  // Team data actions
  setExistingTeam: (team: Team | null) => void;
  
  // Utility actions
  initializeForm: (mode: TeamFormMode, existingTeam?: Team | null) => void;
}

// Combined context type
type TeamFormContextType = TeamFormContextState & TeamFormContextActions;

// Create context
const TeamFormContext = createContext<TeamFormContextType | null>(null);

// Initial form data
const initialFormData: TeamFormData = {
  name: '',
  description: '',
  logoUrl: '',
  teamCode: '',
  color: getDefaultTeamColor(),
  facilityId: '',
};

// Initial context state
const initialState: TeamFormContextState = {
  formData: initialFormData,
  mode: 'create',
  isLoading: false,
  isSubmitting: false,
  errors: {},
  existingTeam: null,
};

// Provider component
export function TeamFormProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TeamFormContextState>(initialState);

  // Form data actions
  const setFormData = useCallback((data: Partial<TeamFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
      errors: {}, // Clear errors when form data changes
    }));
  }, []);

  const updateField = useCallback((field: keyof TeamFormData, value: string | TeamColor) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      errors: { ...prev.errors, [field]: undefined }, // Clear field-specific error
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: initialFormData,
      errors: {},
      existingTeam: null,
    }));
  }, []);

  // Form state actions
  const setMode = useCallback((mode: TeamFormMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const setErrors = useCallback((errors: Partial<TeamFormErrors>) => {
    setState(prev => ({ ...prev, errors: { ...prev.errors, ...errors } }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  // Team data actions
  const setExistingTeam = useCallback((existingTeam: Team | null) => {
    setState(prev => ({ ...prev, existingTeam }));
  }, []);

  // Utility actions
  const initializeForm = useCallback((mode: TeamFormMode, existingTeam?: Team | null) => {
    if (mode === 'edit' && existingTeam) {
      setState(prev => ({
        ...prev,
        mode,
        formData: {
          name: existingTeam.name,
          description: existingTeam.description || '',
          logoUrl: existingTeam.logoUrl || '',
          teamCode: existingTeam.teamCode,
          color: existingTeam.color || getDefaultTeamColor(),
          facilityId: existingTeam.facilityId || '',
        },
        existingTeam,
        errors: {},
      }));
    } else {
      setState(prev => ({
        ...prev,
        mode,
        formData: initialFormData,
        existingTeam: null,
        errors: {},
      }));
    }
  }, []);

  // Context value
  const contextValue: TeamFormContextType = {
    ...state,
    setFormData,
    updateField,
    resetForm,
    setMode,
    setLoading,
    setSubmitting,
    setErrors,
    clearErrors,
    setExistingTeam,
    initializeForm,
  };

  return (
    <TeamFormContext.Provider value={contextValue}>
      {children}
    </TeamFormContext.Provider>
  );
}

// Hook to use the context
export function useTeamForm() {
  const context = useContext(TeamFormContext);
  if (!context) {
    throw new Error('useTeamForm must be used within a TeamFormProvider');
  }
  return context;
}

// Hook for form validation
export function useTeamFormValidation() {
  const { formData, errors, setErrors } = useTeamForm();

  const validateField = useCallback((field: keyof TeamFormData, value: string) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'Team name is required';
        } else if (value.trim().length < 2) {
          error = 'Team name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          error = 'Team name must be less than 50 characters';
        }
        break;

      case 'description':
        if (value.length > 500) {
          error = 'Description must be less than 500 characters';
        }
        break;

      case 'teamCode':
        if (!value.trim()) {
          error = 'Team code is required';
        } else if (!/^[A-Z0-9]{6}$/.test(value)) {
          error = 'Team code must be 6 characters (letters and numbers only)';
        }
        break;

      case 'logoUrl':
        // Validation for URL format (when implemented)
        break;

      case 'color':
        // Color validation is handled by the color picker component
        break;

      case 'facilityId':
        // Facility ID validation is optional - can be empty
        break;

      default:
        break;
    }

    if (error) {
      setErrors({ [field]: error });
    } else {
      setErrors({ [field]: undefined });
    }

    return !error;
  }, [formData, setErrors]);

  const validateForm = useCallback(() => {
    const nameValid = validateField('name', formData.name);
    const descriptionValid = validateField('description', formData.description);
    const teamCodeValid = validateField('teamCode', formData.teamCode);

    return nameValid && descriptionValid && teamCodeValid;
  }, [formData, validateField]);

  return {
    validateField,
    validateForm,
    hasErrors: Object.values(errors).some(error => error !== undefined),
  };
}

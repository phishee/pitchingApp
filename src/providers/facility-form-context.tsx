'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Facility } from '@/models';

// Form mode type
export type FacilityFormMode = 'create' | 'edit';

// Facility form data interface
export interface FacilityFormData {
  name: string;
  description: string;
  type: 'field' | 'gym' | 'indoor_facility' | 'other';
  status: 'active' | 'inactive' | 'maintenance';
  coverPhotoUrl: string;
  address: string;
  maxOccupancy: number;
  amenities: string[];
  isBookable: boolean;
  requiresApproval: boolean;
  public: boolean;
}

// Validation errors interface
export interface FacilityFormErrors {
  name?: string;
  description?: string;
  type?: string;
  status?: string;
  address?: string;
  maxOccupancy?: string;
  amenities?: string;
  general?: string;
}

// Context state interface
interface FacilityFormContextState {
  // Form data
  formData: FacilityFormData;
  
  // Form state
  mode: FacilityFormMode;
  isLoading: boolean;
  isSubmitting: boolean;
  errors: FacilityFormErrors;
  
  // Facility data (for edit mode)
  existingFacility: Facility | null;
}

// Context actions interface
interface FacilityFormContextActions {
  // Form data actions
  setFormData: (data: Partial<FacilityFormData>) => void;
  updateField: (field: keyof FacilityFormData, value: string | number | boolean | string[]) => void;
  resetForm: () => void;
  
  // Form state actions
  setMode: (mode: FacilityFormMode) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setErrors: (errors: Partial<FacilityFormErrors>) => void;
  clearErrors: () => void;
  
  // Facility data actions
  setExistingFacility: (facility: Facility | null) => void;
  
  // Utility actions
  initializeForm: (mode: FacilityFormMode, existingFacility?: Facility | null) => void;
}

// Combined context type
type FacilityFormContextType = FacilityFormContextState & FacilityFormContextActions;

// Create context
const FacilityFormContext = createContext<FacilityFormContextType | null>(null);

// Initial form data
const initialFormData: FacilityFormData = {
  name: '',
  description: '',
  type: 'field',
  status: 'active',
  coverPhotoUrl: '',
  address: '',
  maxOccupancy: 0,
  amenities: [],
  isBookable: true,
  requiresApproval: false,
  public: false,
};

// Initial context state
const initialState: FacilityFormContextState = {
  formData: initialFormData,
  mode: 'create',
  isLoading: false,
  isSubmitting: false,
  errors: {},
  existingFacility: null,
};

// Provider component
export function FacilityFormProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FacilityFormContextState>(initialState);

  // Form data actions
  const setFormData = useCallback((data: Partial<FacilityFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
      errors: {}, // Clear errors when form data changes
    }));
  }, []);

  const updateField = useCallback((field: keyof FacilityFormData, value: string | number | boolean | string[]) => {
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
      existingFacility: null,
    }));
  }, []);

  // Form state actions
  const setMode = useCallback((mode: FacilityFormMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const setErrors = useCallback((errors: Partial<FacilityFormErrors>) => {
    setState(prev => ({ ...prev, errors: { ...prev.errors, ...errors } }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  // Facility data actions
  const setExistingFacility = useCallback((existingFacility: Facility | null) => {
    setState(prev => ({ ...prev, existingFacility }));
  }, []);

  // Utility actions
  const initializeForm = useCallback((mode: FacilityFormMode, existingFacility?: Facility | null) => {
    if (mode === 'edit' && existingFacility) {
      setState(prev => ({
        ...prev,
        mode,
        formData: {
          name: existingFacility.name,
          description: existingFacility.description || '',
          type: existingFacility.type,
          status: existingFacility.status,
          coverPhotoUrl: existingFacility.coverPhotoUrl || '',
          address: existingFacility.address || '',
          maxOccupancy: existingFacility.maxOccupancy || 0,
          amenities: existingFacility.amenities || [],
          isBookable: existingFacility.isBookable,
          requiresApproval: existingFacility.requiresApproval,
          public: existingFacility.public,
        },
        existingFacility,
        errors: {},
      }));
    } else {
      setState(prev => ({
        ...prev,
        mode,
        formData: initialFormData,
        existingFacility: null,
        errors: {},
      }));
    }
  }, []);

  // Context value
  const contextValue: FacilityFormContextType = {
    ...state,
    setFormData,
    updateField,
    resetForm,
    setMode,
    setLoading,
    setSubmitting,
    setErrors,
    clearErrors,
    setExistingFacility,
    initializeForm,
  };

  return (
    <FacilityFormContext.Provider value={contextValue}>
      {children}
    </FacilityFormContext.Provider>
  );
}

// Hook to use the context
export function useFacilityForm() {
  const context = useContext(FacilityFormContext);
  if (!context) {
    throw new Error('useFacilityForm must be used within a FacilityFormProvider');
  }
  return context;
}

// Hook for form validation
export function useFacilityFormValidation() {
  const { formData, errors, setErrors } = useFacilityForm();

  const validateField = useCallback((field: keyof FacilityFormData, value: string | number | boolean | string[]) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Facility name is required';
        } else if (typeof value === 'string' && value.trim().length < 2) {
          error = 'Facility name must be at least 2 characters';
        } else if (typeof value === 'string' && value.trim().length > 100) {
          error = 'Facility name must be less than 100 characters';
        }
        break;

      case 'description':
        if (typeof value === 'string' && value.length > 1000) {
          error = 'Description must be less than 1000 characters';
        }
        break;

      case 'type':
        if (!value || (typeof value === 'string' && !['field', 'gym', 'indoor_facility', 'other'].includes(value))) {
          error = 'Please select a valid facility type';
        }
        break;

      case 'status':
        if (!value || (typeof value === 'string' && !['active', 'inactive', 'maintenance'].includes(value))) {
          error = 'Please select a valid status';
        }
        break;

      case 'address':
        if (typeof value === 'string' && value.length > 200) {
          error = 'Address must be less than 200 characters';
        }
        break;

      case 'maxOccupancy':
        if (typeof value === 'number' && (value < 0 || value > 10000)) {
          error = 'Max occupancy must be between 0 and 10,000';
        }
        break;

      case 'amenities':
        if (Array.isArray(value) && value.length > 20) {
          error = 'Maximum 20 amenities allowed';
        }
        break;

      case 'coverPhotoUrl':
        // Validation for URL format (when implemented)
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
  }, [setErrors]);

  const validateForm = useCallback(() => {
    const nameValid = validateField('name', formData.name);
    const descriptionValid = validateField('description', formData.description);
    const typeValid = validateField('type', formData.type);
    const statusValid = validateField('status', formData.status);
    const addressValid = validateField('address', formData.address);
    const maxOccupancyValid = validateField('maxOccupancy', formData.maxOccupancy);
    const amenitiesValid = validateField('amenities', formData.amenities);

    return nameValid && descriptionValid && typeValid && statusValid && addressValid && maxOccupancyValid && amenitiesValid;
  }, [formData, validateField]);

  return {
    validateField,
    validateForm,
    hasErrors: Object.values(errors).some(error => error !== undefined),
  };
}

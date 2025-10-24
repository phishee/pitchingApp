'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTeamForm } from '@/providers/team-form-context';
import { Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TeamFormActionsProps {
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TeamFormActions({ 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: TeamFormActionsProps) {
  const { mode, formData, isSubmitting: contextSubmitting } = useTeamForm();
  const actualIsSubmitting = isSubmitting || contextSubmitting;

  const handleSubmit = async () => {
    try {
      await onSubmit();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save team. Please try again.');
    }
  };

  const isFormValid = formData.name.trim().length >= 2 && 
                     formData.teamCode.trim().length === 6;

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
      {/* Save/Create Button */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!isFormValid || actualIsSubmitting}
        className="flex-1 sm:flex-none sm:min-w-[120px] bg-blue-600 hover:bg-blue-700"
      >
        {actualIsSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {mode === 'create' ? 'Creating...' : 'Saving...'}
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {mode === 'create' ? 'Create Team' : 'Save Changes'}
          </>
        )}
      </Button>

      {/* Cancel Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={actualIsSubmitting}
        className="flex-1 sm:flex-none sm:min-w-[100px]"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}

'use client';

import React from 'react';
import { useTeamForm, useTeamFormValidation } from '@/contexts/team-form-context';
import { teamApi } from '@/app/services-client/teamApi';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/providers/organization-context';
import { useTeam } from '@/providers/team-context';
import { useUser } from '@/providers/user.context';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { toast } from 'sonner';
import { TeamBasicInfo } from './TeamBasicInfo';
import { TeamCodeGenerator } from './TeamCodeGenerator';
import { TeamImageUpload } from './TeamImageUpload';
import { TeamColorPicker } from './TeamColorPicker';
import { TeamFacilitySelector } from './TeamFacilitySelector';
import { TeamFormActions } from './TeamFormActions';

interface TeamFormProps {
  onSubmit?: () => Promise<void>;
  onCancel?: () => void;
}

export function TeamForm({ onSubmit, onCancel }: TeamFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const { currentOrganization, refreshOrganizationData } = useOrganization();
  const { refreshTeamData } = useTeam();
  const { 
    formData, 
    mode, 
    existingTeam, 
    setSubmitting, 
    setErrors,
    errors 
  } = useTeamForm();
  const { validateForm } = useTeamFormValidation();

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const teamData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        logoUrl: formData.logoUrl,
        teamCode: formData.teamCode,
        color: formData.color, // ✅ Include color data
        facilityId: formData.facilityId || undefined, // ✅ Include facility ID
        organizationId: existingTeam?.organizationId || currentOrganization?._id || '',
        createdAt: existingTeam?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (mode === 'create') {
        // 1. Create team first
        const newTeam = await teamApi.createTeam(teamData);
        console.log('✅ Team created successfully:', newTeam._id);
        
        // 2. If user is coach, create TeamMember automatically
        if (user?.role === 'coach' && user?.userId) {
          try {
            const teamMemberData = {
              teamId: newTeam._id,
              userId: user.userId,
              role: 'coach' as const,
              status: 'active' as const,
              joinedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await teamMemberApi.createTeamMember(teamMemberData);
            console.log('✅ TeamMember created successfully for coach');
            toast.success('Team created successfully! You have been added as a coach.');
          } catch (error) {
            console.error('❌ Failed to create TeamMember:', error);
            toast.error('Team created but failed to add you as a member. Please join manually.');
          }
        } else {
          toast.success('Team created successfully!');
        }
        
        // 3. Refresh contexts to update team lists
        console.log('🔄 Refreshing contexts after team creation...');
        await Promise.all([
          refreshOrganizationData(),
          refreshTeamData()
        ]);
        console.log('✅ Contexts refreshed successfully');
        
        // Call custom onSubmit if provided
        if (onSubmit) {
          await onSubmit();
        } else {
          // Default behavior: redirect to teams list
          router.push('/app/teams');
        }
      } else {
        // Edit mode
        if (!existingTeam) {
          throw new Error('No existing team data found');
        }

        const updatedTeam = await teamApi.updateTeam(existingTeam._id, teamData);
        toast.success('Team updated successfully!');
        
        // Refresh contexts to update team lists
        console.log('🔄 Refreshing contexts after team update...');
        await Promise.all([
          refreshOrganizationData(),
          refreshTeamData()
        ]);
        console.log('✅ Contexts refreshed successfully');
        
        // Call custom onSubmit if provided
        if (onSubmit) {
          await onSubmit();
        } else {
          // Default behavior: redirect to teams list
          router.push('/app/teams');
        }
      }
    } catch (error: any) {
      console.error('Team submission error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setErrors({ general: 'A team with this name or code already exists' });
        toast.error('A team with this name or code already exists');
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Invalid team data. Please check your input' });
        toast.error('Invalid team data. Please check your input');
      } else {
        setErrors({ general: 'Failed to save team. Please try again.' });
        toast.error('Failed to save team. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Default behavior: go back
      router.back();
    }
  };

  return (
    <div className="space-y-6">
      {/* General Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      {/* Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <TeamBasicInfo />
          <TeamCodeGenerator />
          <TeamFacilitySelector />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TeamImageUpload />
          <TeamColorPicker />
        </div>
      </div>

      {/* Form Actions */}
      <TeamFormActions
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={false} // This will be managed by the context
      />
    </div>
  );
}

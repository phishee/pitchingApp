'use client';

import React, { useEffect } from 'react';
import { useTeamForm } from '@/contexts/team-form-context';
import { teamApi } from '@/app/services-client/teamApi';
import { TeamForm } from './TeamForm';
import { Container } from '@/components/common/container';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface TeamFormPageProps {
  mode: 'create' | 'edit';
  teamId?: string;
  onSubmit?: () => Promise<void>;
  onCancel?: () => void;
}

export function TeamFormPage({ mode, teamId, onSubmit, onCancel }: TeamFormPageProps) {
  const router = useRouter();
  const { 
    initializeForm, 
    setLoading, 
    isLoading, 
    existingTeam 
  } = useTeamForm();

  // Initialize form based on mode
  useEffect(() => {
    const initialize = async () => {
      if (mode === 'edit' && teamId) {
        setLoading(true);
        try {
          const team = await teamApi.getTeam(teamId);
          initializeForm('edit', team);
        } catch (error) {
          console.error('Failed to load team:', error);
          toast.error('Failed to load team data');
          router.push('/app/teams');
        } finally {
          setLoading(false);
        }
      } else {
        initializeForm('create');
      }
    };

    initialize();
  }, [mode, teamId, initializeForm, setLoading, router]);

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">
              {mode === 'edit' ? 'Loading team data...' : 'Initializing form...'}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-6xl mx-auto py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'create' ? 'Create New Team' : 'Edit Team'}
              </h1>
              <p className="text-gray-600 mt-1">
                {mode === 'create' 
                  ? 'Set up a new team and invite members to join'
                  : `Edit ${existingTeam?.name || 'team'} settings and information`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <TeamForm onSubmit={onSubmit} onCancel={onCancel} />
      </div>
    </Container>
  );
}

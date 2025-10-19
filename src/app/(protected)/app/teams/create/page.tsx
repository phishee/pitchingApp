'use client';

import React from 'react';
import { TeamFormProvider } from '@/contexts/team-form-context';
import { TeamFormPage } from '@/components/teams/create-edit';

export default function CreateTeamPage() {
  return (
    <TeamFormProvider>
      <TeamFormPage mode="create" />
    </TeamFormProvider>
  );
}

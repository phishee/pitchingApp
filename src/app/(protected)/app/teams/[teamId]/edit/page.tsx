'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TeamFormProvider } from '@/providers/team-form-context';
import { TeamFormPage } from '@/components/teams/create-edit';

export default function EditTeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  return (
    <TeamFormProvider>
      <TeamFormPage mode="edit" teamId={teamId} />
    </TeamFormProvider>
  );
}

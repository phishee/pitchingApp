'use client';

import React from 'react';
import { AthleteDashboard } from '@/app/components/dashboard/athlete-dashboard';
import { CoachDashboard } from '@/app/components/dashboard/coach-dashboard';
import { useUser } from '@/providers/user.context';

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Render different dashboards based on user role
  switch (user.role) {
    case 'athlete':
      return <AthleteDashboard />;
    case 'coach':
      return <CoachDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}

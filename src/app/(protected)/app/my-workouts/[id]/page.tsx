'use client';

import React from 'react';
import { UserWorkoutDetail } from '@/components/my-workouts/user-workout-detail';

// Prevent static generation since this page requires user context and dynamic route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function UserWorkoutDetailPage() {
  return <UserWorkoutDetail />;
}


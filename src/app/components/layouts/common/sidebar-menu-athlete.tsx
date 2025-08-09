// src/app/components/layouts/common/sidebar-menu-athlete.tsx
'use client';

import { Home, Dumbbell, Users, BarChart, Settings } from 'lucide-react';
import { SidebarMenu } from './sidebar-menu';

const ATHLETE_MENU = [
  {
    title: 'Dashboard',
    path: '/app/dashboard',
    icon: Home,
  },
  {
    title: "My Workouts",
    path: '/app/my-workouts',
    icon: Dumbbell,
  },
  {
    title: 'My Team',
    path: '/app/users',
    icon: Users,
  },
  {
    title: 'Progress',
    path: '/app/progress',
    icon: BarChart,
  },
  {
    title: 'Settings',
    path: '/app/settings',
    icon: Settings,
  },
];

export function SidebarMenuAthlete() {
  return <SidebarMenu menuItems={ATHLETE_MENU} />;
}
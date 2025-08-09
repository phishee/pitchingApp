// src/app/components/layouts/common/sidebar-menu-coach.tsx
'use client';

import { Home, Users, Dumbbell, Calendar, Settings, BarChart3 } from 'lucide-react';
import { SidebarMenu } from './sidebar-menu';

const COACH_MENU = [
  {
    title: 'Dashboard',
    path: '/app/dashboard',
    icon: Home,
  },
  {
    title: "Workouts",
    path: '/app/workouts',
    icon: Dumbbell,
  },
  {
    title: "Users",
    path: '/app/users',
    icon: Users,
    children: [
      {
        title: 'Team',
        path: '/app/users',
        icon: Users,
      },
      {
        title: 'Analytics',
        path: '/app/users/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Teams',
    path: '/app/teams',
    icon: Users,
  },
  {
    title: 'Schedule',
    path: '/app/schedule',
    icon: Calendar,
  },
  {
    title: 'Settings',
    path: '/app/settings',
    icon: Settings,
  },
];

export function SidebarMenuCoach() {
  return <SidebarMenu menuItems={COACH_MENU} />;
}
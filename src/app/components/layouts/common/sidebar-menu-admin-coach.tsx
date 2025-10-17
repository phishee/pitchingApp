// src/app/components/layouts/common/sidebar-menu-admin-coach.tsx
'use client';

import { Home, Users, Dumbbell, Calendar, Settings, BarChart3, Library, BookOpen, Building2, Shield } from 'lucide-react';
import { SidebarMenu } from './sidebar-menu';

const ADMIN_COACH_MENU = [
  {
    title: 'Dashboard',
    path: '/app/dashboard',
    icon: Home,
  },
  {
    title: "Users",
    path: '/app/users',
    icon: Users,
    children: [
      {
        title: 'Team Management',
        path: '/app/users',
        icon: Users,
      },
      {
        title: 'User Analytics',
        path: '/app/users/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Workouts",
    path: '/app/workouts',
    icon: Dumbbell,
    children: [
      {
        title: 'Exercises Library',
        path: '/app/exercises-library',
        icon: Library,
      },
      {
        title: 'Workout Library',
        path: '/app/workout-library',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'Schedule',
    path: '/app/calendar/1',
    icon: Calendar,
  },
  {
    title: 'Organizations',
    path: '/app/organizations',
    icon: Building2,
    children: [
      {
        title: 'Management',
        path: '/app/organizations',
        icon: Building2,
      },
      {
        title: 'All Users',
        path: '/app/users/all',
        icon: Shield,
      },
      {
        title: 'All Teams',
        path: '/app/teams',
        icon: Users,
      },
    ],
  },
  {
    title: 'System',
    path: '/app/system',
    icon: Settings,
    children: [
      {
        title: 'System Settings',
        path: '/app/settings',
        icon: Settings,
      },
      {
        title: 'Organization Settings',
        path: '/app/organizations/settings',
        icon: Building2,
      },
    ],
  },
];

export function SidebarMenuAdminCoach() {
  return <SidebarMenu menuItems={ADMIN_COACH_MENU} />;
}

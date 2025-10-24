// src/data/mobile-menu-items.ts
import { 
  Home, 
  Dumbbell, 
  Users, 
  TrendingUp, 
  BarChart3, 
  UserCheck, 
  Calendar, 
  Settings, 
  Building, 
  User, 
  Users2, 
  Cog 
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: ('athlete' | 'coach' | 'admin')[];
}

export const MOBILE_MENU_ITEMS: MenuItem[] = [
  // Athlete Menu Items
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/app/dashboard',
    roles: ['athlete']
  },
  {
    id: 'workouts',
    label: 'Workouts',
    icon: Dumbbell,
    href: '/app/my-workouts',
    roles: ['athlete']
  },
  {
    id: 'teammates',
    label: 'Teammates',
    icon: Users,
    href: '/app/users',
    roles: ['athlete']
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: TrendingUp,
    href: '/app/progress',
    roles: ['athlete']
  },
  
  // Coach Menu Items
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    href: '/app',
    roles: ['coach']
  },
  {
    id: 'players',
    label: 'Players',
    icon: UserCheck,
    href: '/app/players',
    roles: ['coach']
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    href: '/app/calendar',
    roles: ['coach']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/app/settings',
    roles: ['coach']
  },
  
  // Admin Menu Items
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    icon: Building,
    href: '/app/admin',
    roles: ['admin']
  },
  {
    id: 'admin-users',
    label: 'Users',
    icon: User,
    href: '/app/admin/users',
    roles: ['admin']
  },
  {
    id: 'admin-teams',
    label: 'Teams',
    icon: Users2,
    href: '/app/admin/teams',
    roles: ['admin']
  },
  {
    id: 'admin-settings',
    label: 'Settings',
    icon: Cog,
    href: '/app/admin/settings',
    roles: ['admin']
  }
];

// Helper function to get menu items for a specific role
export function getMenuItemsForRole(role: 'athlete' | 'coach' | 'admin'): MenuItem[] {
  return MOBILE_MENU_ITEMS.filter(item => item.roles.includes(role));
}

// Helper function to get the first 4 menu items for a role (for bottom nav display)
export function getBottomNavItems(role: 'athlete' | 'coach' | 'admin'): MenuItem[] {
  return getMenuItemsForRole(role).slice(0, 4);
}
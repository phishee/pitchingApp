// src/data/mobile-menu-items.ts
export interface MenuItem {
    id: string;
    label: string;
    icon: string; // We'll use simple text for now, can be replaced with actual icons later
    href: string;
    roles: ('athlete' | 'coach' | 'admin')[];
  }
  
  export const MOBILE_MENU_ITEMS: MenuItem[] = [
    // Athlete Menu Items
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      href: '/app',
      roles: ['athlete']
    },
    {
      id: 'workouts',
      label: 'Workouts',
      icon: '🏋️‍♀️',
      href: '/app/my-workouts',
      roles: ['athlete']
    },
    {
      id: 'teammates',
      label: 'Teammates',
      icon: '👥',
      href: '/app/users',
      roles: ['athlete']
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: '📈',
      href: '/app/progress',
      roles: ['athlete']
    },
    
    // Coach Menu Items
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      href: '/app',
      roles: ['coach']
    },
    {
      id: 'players',
      label: 'Players',
      icon: '👨‍💼',
      href: '/app/players',
      roles: ['coach']
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: '📅',
      href: '/app/calendar',
      roles: ['coach']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      href: '/app/settings',
      roles: ['coach']
    },
    
    // Admin Menu Items (can inherit from coach or have their own)
    {
      id: 'admin-dashboard',
      label: 'Dashboard',
      icon: '🏢',
      href: '/app/admin',
      roles: ['admin']
    },
    {
      id: 'admin-users',
      label: 'Users',
      icon: '👤',
      href: '/app/admin/users',
      roles: ['admin']
    },
    {
      id: 'admin-teams',
      label: 'Teams',
      icon: '🏟️',
      href: '/app/admin/teams',
      roles: ['admin']
    },
    {
      id: 'admin-settings',
      label: 'Settings',
      icon: '⚙️',
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
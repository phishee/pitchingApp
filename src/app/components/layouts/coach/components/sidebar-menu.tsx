'use client';
import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-context';
// import { SidebarMenuPrimary } from './sidebar-menu-primary';
import { SidebarMenuPrimary } from '../../common/sidebar-menu-primary';
import { SidebarMenuSecondary } from './sidebar-menu-secondary';
import { SidebarMenuAdmin } from '../../common/sidebar-menu-admin';
import { SidebarMenuAthlete } from '../../common/sidebar-menu-athlete';
import { SidebarMenuCoach } from '../../common/sidebar-menu-coach';

export function SidebarMenu() {
  const { user } = useAuth();

  useEffect(() => {

  }, [user]);

  return (
    <div className="space-y-5 p-4">
      {/* <SidebarMenuPrimary /> */}
      {user?.role === 'coach' && !user?.isAdmin ? (
        <SidebarMenuCoach />
      ) : user?.isAdmin ? (
        <SidebarMenuAdmin />
      ) : user?.role === 'athlete' ? (
        <SidebarMenuAthlete />
      ) : null}
      <SidebarMenuSecondary />
    </div>
  );
}

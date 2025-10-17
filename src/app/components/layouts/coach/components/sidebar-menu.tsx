import { useUser } from '@/providers/user.context';
import { SidebarMenuAdmin } from '../../common/sidebar-menu-admin';
import { SidebarMenuAdminCoach } from '../../common/sidebar-menu-admin-coach';
import { SidebarMenuAthlete } from '../../common/sidebar-menu-athlete';
import { SidebarMenuCoach } from '../../common/sidebar-menu-coach';

export function SidebarMenu() {
  const { user } = useUser();

  return (
    <div className="space-y-5 p-4">
      {user?.role === 'coach' && user?.isAdmin ? (
        <SidebarMenuAdminCoach />
      ) : user?.role === 'coach' && !user?.isAdmin ? (
        <SidebarMenuCoach />
      ) : user?.isAdmin && user?.role !== 'coach' ? (
        <SidebarMenuAdmin />
      ) : user?.role === 'athlete' ? (
        <SidebarMenuAthlete />
      ) : null}
      {/* <SidebarMenuSecondary /> */}
    </div>
  );
}

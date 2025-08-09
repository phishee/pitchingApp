import { useUser } from '@/providers/user.context';
import { SidebarMenuAdmin } from '../../common/sidebar-menu-admin';
import { SidebarMenuAthlete } from '../../common/sidebar-menu-athlete';
import { SidebarMenuCoach } from '../../common/sidebar-menu-coach';

export function SidebarMenu() {
  const { user } = useUser();

  return (
    <div className="space-y-5 p-4">
      {user?.role === 'coach' && !user?.isAdmin ? (
        <SidebarMenuCoach />
      ) : user?.isAdmin ? (
        <SidebarMenuAdmin />
      ) : user?.role === 'athlete' ? (
        <SidebarMenuAthlete />
      ) : null}
      {/* <SidebarMenuSecondary /> */}
    </div>
  );
}

// src/app/components/layouts/common/sidebar-menu-admin.tsx
'use client';

import { Home, Users, Settings, Building2 } from 'lucide-react';
import { AccordionMenu, AccordionMenuGroup, AccordionMenuItem } from '@/components/ui/accordion-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_MENU = [
  {
    title: 'Dashboard',
    path: '/app/dashboard',
    icon: Home,
  },
  {
    title: 'Organizations',
    path: '/app/organizations',
    icon: Building2,
  },
  {
    title: 'Users',
    path: '/app/users',
    icon: Users,
  },
  {
    title: 'Settings',
    path: '/app/settings',
    icon: Settings,
  },
];

export function SidebarMenuAdmin() {
  const pathname = usePathname();

  return (
    <AccordionMenu
      type="single"
      selectedValue={pathname}
      collapsible
      classNames={{ root: 'space-y-2.5 px-3.5' }}
    >
      <AccordionMenuGroup>
        {ADMIN_MENU.map((item, idx) => (
          <AccordionMenuItem key={idx} value={item.path}>
            <Link href={item.path}>
              {item.icon && <item.icon className="mr-2" />}
              {item.title}
            </Link>
          </AccordionMenuItem>
        ))}
      </AccordionMenuGroup>
    </AccordionMenu>
  );
}
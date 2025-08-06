// src/app/components/layouts/common/sidebar-menu-coach.tsx
'use client';

import { Home, Users, Dumbbell, Calendar, Settings } from 'lucide-react';
import { AccordionMenu, AccordionMenuGroup, AccordionMenuItem } from '@/components/ui/accordion-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  return (
    <AccordionMenu
      type="single"
      selectedValue={pathname}
      collapsible
      classNames={{ root: 'space-y-2.5 px-3.5' }}
    >
      <AccordionMenuGroup>
        {COACH_MENU.map((item, idx) => (
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
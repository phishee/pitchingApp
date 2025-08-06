// src/app/components/layouts/common/sidebar-menu-athlete.tsx
'use client';

import { Home, Dumbbell, Users, BarChart } from 'lucide-react';
import { AccordionMenu, AccordionMenuGroup, AccordionMenuItem } from '@/components/ui/accordion-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    path: '/app/my-team',
    icon: Users,
  },
  {
    title: 'Progress',
    path: '/app/progress',
    icon: BarChart,
  },
];

export function SidebarMenuAthlete() {
  const pathname = usePathname();

  return (
    <AccordionMenu
      type="single"
      selectedValue={pathname}
      collapsible
      classNames={{ root: 'space-y-2.5 px-3.5' }}
    >
      <AccordionMenuGroup>
        {ATHLETE_MENU.map((item, idx) => (
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
'use client';

import { JSX, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Settings, Dumbbell  } from 'lucide-react'; // Example icons
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { cn } from '@/lib/utils';

// Simple hardcoded menu structure with icons
const SIMPLE_MENU = [
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
    title: 'Users',
    path: '/app/users',
    icon: Users,
    children: [
      {
        title: 'List',
        path: '/app/users/list',
      },
      {
        title: 'Add User',
        path: '/app/users/add',
      },
    ],
  },
  {
    title: 'Settings',
    path: '/app/settings',
    icon: Settings,
  },
];

export function SidebarMenuPrimary() {
  const pathname = usePathname();

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  // Global classNames for consistent styling
  const classNames: AccordionMenuClassNames = {
    root: 'space-y-2.5 px-3.5',
    group: 'gap-px',
    label:
      'uppercase text-xs font-medium text-muted-foreground/70 pt-2.25 pb-px',
    separator: '',
    item: 'h-9 hover:bg-transparent border border-transparent text-accent-foreground hover:text-mono data-[selected=true]:text-mono data-[selected=true]:bg-background data-[selected=true]:border-border data-[selected=true]:font-medium',
    sub: '',
    subTrigger:
      'h-9 hover:bg-transparent border border-transparent text-accent-foreground hover:text-mono data-[selected=true]:text-mono data-[selected=true]:bg-background data-[selected=true]:border-border data-[selected=true]:font-medium',
    subContent: 'py-0',
    indicator: '',
  };

  const buildMenu = (items: typeof SIMPLE_MENU): JSX.Element[] => {
    return items.map((item, index) => {
      if (!item.children) {
        return buildMenuItemRoot(item, index);
      } else {
        return buildMenuItemRoot(item, index);
      }
    });
  };

  const buildMenuItemRoot = (item: any, index: number): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className="text-sm font-medium">
            {item.icon && <item.icon data-slot="accordion-menu-icon" className="mr-2" />}
            <span data-slot="accordion-menu-title">{item.title}</span>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `root-${index}`}
            className="ps-6"
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(item.children, 1)}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className="text-sm font-medium"
        >
          <Link href={item.path || '#'}>
            {item.icon && <item.icon data-slot="accordion-menu-icon" className="mr-2" />}
            <span data-slot="accordion-menu-title">{item.title}</span>
          </Link>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemChildren = (
    items: any[],
    level: number = 0,
  ): JSX.Element[] => {
    return items.map((item, index) => {
      if (!item.children) {
        return buildMenuItemChild(item, index, level);
      } else {
        return buildMenuItemChild(item, index, level);
      }
    });
  };

  const buildMenuItemChild = (
    item: any,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub
          key={index}
          value={item.path || `child-${level}-${index}`}
        >
          <AccordionMenuSubTrigger className="text-[13px]">
            {item.icon && <item.icon data-slot="accordion-menu-icon" className="mr-2" />}
            {item.title}
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `child-${level}-${index}`}
            className={cn(
              'ps-4',
              !item.collapse && 'relative',
              !item.collapse && (level > 0 ? '' : ''),
            )}
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(
                item.children,
                item.collapse ? level : level + 1,
              )}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className="text-[13px]"
        >
          <Link href={item.path || '#'}>
            {item.icon && <item.icon data-slot="accordion-menu-icon" className="mr-2" />}
            {item.title}
          </Link>
        </AccordionMenuItem>
      );
    }
  };

  return (
    <AccordionMenu
      type="single"
      selectedValue={pathname}
      matchPath={matchPath}
      collapsible
      classNames={classNames}
    >
      {buildMenu(SIMPLE_MENU)}
    </AccordionMenu>
  );
}
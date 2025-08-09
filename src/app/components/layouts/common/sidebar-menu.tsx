'use client';

import { useCallback } from 'react';
import { 
  AccordionMenu, 
  AccordionMenuGroup, 
  AccordionMenuItem,
  AccordionMenuSub,
  AccordionMenuSubTrigger,
  AccordionMenuSubContent
} from '@/components/ui/accordion-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  title: string;
  path: string;
  icon?: any;
  children?: MenuItem[];
}

interface SidebarMenuProps {
  menuItems: MenuItem[];
  className?: string;
}

export function SidebarMenu({ menuItems, className = '' }: SidebarMenuProps) {
  const pathname = usePathname();

  // Custom matching function that handles parent/child conflicts
  const matchPath = useCallback(
    (path: string): boolean => {
      try {
        // Parse the current URL to get clean pathname
        const url = new URL(pathname, window.location.origin);
        const cleanPathname = url.pathname;
        
        const pathSegments = cleanPathname.split('/').filter(Boolean);
        const menuPathSegments = path.split('/').filter(Boolean);
        
        // Get the last meaningful segment
        const currentLastSegment = pathSegments[pathSegments.length - 1];
        const menuLastSegment = menuPathSegments[menuPathSegments.length - 1];
        
        // Only match if the last segments match
        return currentLastSegment === menuLastSegment;
      } catch (error) {
        // Fallback to simple split if URL parsing fails
        const pathSegments = pathname.split('?')[0].split('/').filter(Boolean);
        const menuPathSegments = path.split('/').filter(Boolean);
        
        const currentLastSegment = pathSegments[pathSegments.length - 1];
        const menuLastSegment = menuPathSegments[menuPathSegments.length - 1];
        
        return currentLastSegment === menuLastSegment;
      }
    },
    [pathname],
  );

  // Global classNames for consistent styling with active states
  const classNames = {
    root: `space-y-6 px-3.5 ${className}`,
    group: 'gap-px',
    item: 'h-9 hover:bg-transparent border border-transparent text-accent-foreground hover:text-mono data-[selected=true]:text-mono data-[selected=true]:bg-background data-[selected=true]:border-border data-[selected=true]:font-medium',
    sub: '',
    subTrigger: 'h-9 hover:bg-transparent border border-transparent text-accent-foreground hover:text-mono data-[selected=true]:text-mono data-[selected=true]:bg-background data-[selected=true]:border-border data-[selected=true]:font-medium',
    subContent: 'py-0',
    indicator: '',
  };

  const buildMenuItem = (item: MenuItem, index: number) => {
    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path} className="py-4">
          <AccordionMenuSubTrigger className="text-sm font-medium">
            {item.icon && <item.icon className="mr-2" />}
            <span>{item.title}</span>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path}
            className="ps-6"
          >
            <AccordionMenuGroup>
              {item.children.map((child: MenuItem, childIdx: number) => (
                <AccordionMenuItem
                  key={childIdx}
                  value={child.path}
                  className="text-[13px]"
                >
                  <Link href={child.path}>
                    {child.icon && <child.icon className="mr-2 w-4 h-4" />}
                    <span>{child.title}</span>
                  </Link>
                </AccordionMenuItem>
              ))}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem key={index} value={item.path} className="text-sm font-medium py-6">
          <Link href={item.path}>
            {item.icon && <item.icon className="mr-2" />}
            <span>{item.title}</span>
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
      <AccordionMenuGroup>
        {menuItems.map((item, idx) => buildMenuItem(item, idx))}
      </AccordionMenuGroup>
    </AccordionMenu>
  );
}
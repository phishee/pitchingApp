'use client';

import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from '../coach/components/sidebar-menu';

export function Sidebar() {
  return (
    <div className="flex flex-col fixed top-0 bottom-0 z-20 lg:flex items-stretch shrink-0 w-64 h-screen bg-gray-100">
      <SidebarHeader />
      <div className="flex-1 overflow-y-auto min-h-0">
        <SidebarMenu />
      </div>
      <SidebarFooter />
    </div>
  );
}

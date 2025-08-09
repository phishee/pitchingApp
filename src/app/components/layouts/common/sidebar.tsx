'use client';

import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from '../coach/components/sidebar-menu';
import { TeamSwitcher } from '@/components/common/team-switcher';
import { Separator } from '@/components/ui/separator';
export function Sidebar() {
  return (
    <div className="flex flex-col fixed top-0 bottom-0 z-20 lg:flex items-stretch shrink-0 w-64 h-screen bg-gray-100">
      <SidebarHeader />
      <div className="flex items-center justify-center">
        <TeamSwitcher />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <SidebarMenu />
      </div>
      <div className=" bottom-0 mb-2 w-full">
        {/* <Separator className="bg-gray-300 w-11/12" /> */}
        <SidebarFooter />
      </div>
    </div>
  );
}

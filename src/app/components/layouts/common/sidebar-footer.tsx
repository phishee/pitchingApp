'use client';


import { Separator } from '@/components/ui/separator';
import { UserDropdownMenu } from './user-drop-down-menu';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useAuth } from '@/providers/auth-context';

export function SidebarFooter() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col justify-center items-center">
      <Separator className="bg-gray-300 mb-3  w-11/12" />
      <div className="flex flex-center justify-between shrink-0 ps-4 pe-3.5 bottom-0 bg-white p-2 m-2 rounded-3xl shadow-md hover:cursor-pointer">
        <UserDropdownMenu
          trigger={
            <div className="flex gap-2">
              <img
                className="size-9 rounded-full border-2 border-mono/25 shrink-0 cursor-pointer bg-cover"
                src={user?.profileImageUrl}
                alt="User Avatar"
              />
              <div className="flex flex-col">
                <span className="text-sm text-mono font-semibold">
                  {user?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

'use client';


import { Separator } from '@/components/ui/separator';
import { UserDropdownMenu } from './user-drop-down-menu';
import { useUser } from '@/providers/user.context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SidebarFooter() {
  const { user } = useUser();
  
  // Add this debug log
  console.log(' SidebarFooter user data:', {
    profileImageUrl: user?.profileImageUrl,
    name: user?.name,
    email: user?.email,
    fullUser: user
  });

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex flex-center justify-between shrink-0 ps-4 pe-3.5 bg-white p-2 m-2 rounded-3xl shadow-md hover:cursor-pointer w-10/12">
        <UserDropdownMenu
          trigger={
            <div className="flex gap-2">
              <Avatar className="size-9 shrink-0 cursor-pointer">
                <AvatarImage 
                  src={user?.profileImageUrl} // Test with a known working image
                  alt="User Avatar"
                />
                <AvatarFallback className="text-sm font-semibold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
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

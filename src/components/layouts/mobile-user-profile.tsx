// src/components/layouts/mobile-user-profile.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@/providers/user.context';
import { useAuth } from '@/providers/auth-context';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Moon, LogOut } from 'lucide-react';

export function MobileUserProfile() {
  const { user } = useUser();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/sign-in');
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-md transition-colors">
          <Avatar className="w-8 h-8">
            {user?.profileImageUrl && user.profileImageUrl.trim() !== '' && (
              <AvatarImage src={user.profileImageUrl} alt="User avatar" />
            )}
            <AvatarFallback className="text-xs font-semibold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64" 
        side="bottom" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-3">
          <Avatar className="w-10 h-10">
            {user?.profileImageUrl && user.profileImageUrl.trim() !== '' && (
              <AvatarImage src={user.profileImageUrl} alt="User avatar" />
            )}
            <AvatarFallback className="text-sm font-semibold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">
              {user?.name || 'User'}
            </span>
            <span className="text-xs text-gray-500">
              {user?.email || 'user@example.com'}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3"
          onClick={() => {
            router.push('/app/profile');
            setIsOpen(false);
          }}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3"
          onClick={() => {
            router.push('/app/settings');
            setIsOpen(false);
          }}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4" />
            <span className="text-sm">Dark Mode</span>
          </div>
          <Switch
            size="sm"
            checked={theme === 'dark'}
            onCheckedChange={handleThemeToggle}
          />
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
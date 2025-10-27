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
import { User, Settings, Users, Calendar, LogOut, X } from 'lucide-react';

export function MobileUserProfile() {
  const { user } = useUser();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout(); // This already handles navigation to /sign-in
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback navigation if logout fails
      router.push('/sign-in');
    } finally {
      setIsLoggingOut(false);
      setIsDrawerOpen(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Profile Button */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Avatar className="w-8 h-8">
          {user?.profileImageUrl && user.profileImageUrl.trim() !== '' && (
            <AvatarImage src={user.profileImageUrl} alt="User avatar" />
          )}
          <AvatarFallback className="text-xs font-semibold">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Left Drawer Overlay - Extremely high z-index */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          style={{ zIndex: 99999 }}
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Left Drawer - Extremely high z-index */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 99999 }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isLoggingOut}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {user?.profileImageUrl && user.profileImageUrl.trim() !== '' && (
                <AvatarImage src={user.profileImageUrl} alt="User avatar" />
              )}
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900">
                {user?.name || 'User'}
              </span>
              <span className="text-sm text-gray-500">
                {user?.email || 'user@example.com'}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4">
          <nav className="space-y-2">
            {/* Profile */}
            <button
              onClick={() => handleMenuClick('/app/profile')}
              className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-100 transition-colors"
              disabled={isLoggingOut}
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handleMenuClick('/app/settings')}
              className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-100 transition-colors"
              disabled={isLoggingOut}
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Settings</span>
            </button>

            {/* Teammates */}
            <button
              onClick={() => handleMenuClick('/app/users')}
              className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-100 transition-colors"
              disabled={isLoggingOut}
            >
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Teammates</span>
            </button>

            {/* Calendar */}
            <button
              onClick={() => handleMenuClick('/app/calendar')}
              className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-100 transition-colors"
              disabled={isLoggingOut}
            >
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Calendar</span>
            </button>
          </nav>

          {/* Dark Mode Toggle */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                </div>
                <span className="text-gray-900">Dark Mode</span>
              </div>
              <Switch
                size="sm"
                checked={theme === 'dark'}
                onCheckedChange={handleThemeToggle}
                disabled={isLoggingOut}
              />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </>
  );
}
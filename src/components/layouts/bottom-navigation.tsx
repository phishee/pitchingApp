// src/components/layouts/bottom-navigation.tsx
'use client';

import { useLayout } from '@/providers/layout-context';
import { useUser } from '@/providers/user.context';
import { getBottomNavItems } from '@/data/mobile-menus/mobile-menu-items';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNavigation() {
  const { isMobile, bottomNavVisible } = useLayout();
  const { user } = useUser();
  const pathname = usePathname();
  
  if (!isMobile || !bottomNavVisible || !user?.role) return null;
  
  // Get menu items for the user's role
  const menuItems = getBottomNavItems(user.role as 'athlete' | 'coach' | 'admin');
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-1 z-40">
      <div className="flex justify-around items-center h-12">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="text-base">{item.icon}</div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
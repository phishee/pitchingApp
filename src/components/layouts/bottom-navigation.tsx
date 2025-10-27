// src/components/layouts/bottom-navigation.tsx
'use client';

import { useLayout } from '@/providers/layout-context';
import { useUser } from '@/providers/user.context';
import { useTeam } from '@/providers/team-context';
import { getBottomNavItems } from '@/data/mobile-menus/mobile-menu-items';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { getDefaultTeamColor } from '@/lib/colorUtils';

export function BottomNavigation() {
  const { isMobile, bottomNavVisible } = useLayout();
  const { user } = useUser();
  const { currentTeam } = useTeam();
  const pathname = usePathname();
  const [showLabels, setShowLabels] = useState(false);
  
  // Early return
  if (!isMobile || !bottomNavVisible || !user?.role) return null;
  
  // Get team colors with fallback
  const teamColors = currentTeam?.color || getDefaultTeamColor();
  const primaryColor = teamColors.primary;
  const secondaryColor = teamColors.secondary;
  
  // Get menu items for the user's role
  const menuItems = getBottomNavItems(user.role as 'athlete' | 'coach' | 'admin');
  
  return (
    <nav className="fixed bottom-6 left-4 right-4 z-40">
      <div 
        className="backdrop-blur-sm rounded-full px-4 py-3 shadow-lg"
        style={{ 
          backgroundColor: primaryColor,
          opacity: 0.9
        }}
      >
        <div className="flex justify-around items-center">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'text-white bg-white/20' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <IconComponent 
                  className="w-5 h-5 text-white" 
                />
                {showLabels && (
                  <span className="text-xs font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
'use client';

import React from 'react';
import { useTeam } from '@/providers/team-context';
import { useUser } from '@/providers/user.context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { createTeamColor } from '@/lib/colorUtils';

interface TeamSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

// Helper function to render team logo or fallback icon
const TeamLogoOrIcon = ({ 
  team, 
  icon: Icon, 
  iconSize = "w-3.5 h-3.5",
  containerSize = "w-7 h-7",
  useTeamColors = false
}: {
  team: any;
  icon: React.ComponentType<{ className?: string }>;
  iconSize?: string;
  containerSize?: string;
  useTeamColors?: boolean;
}) => {
  const teamColors = useTeamColors ? getTeamColors(team) : null;
  if (team.logoUrl && team.logoUrl.trim() !== '') {
    const bgColor = useTeamColors && teamColors 
      ? { backgroundColor: teamColors.primary }
      : { backgroundColor: '#3B82F6' }; // Default blue fallback
    
    return (
      <div 
        className={cn("flex items-center justify-center", containerSize, "rounded-full overflow-hidden")}
        style={bgColor}
      >
        <Image
          src={team.logoUrl}
          alt={`${team.name} logo`}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  const bgColor = useTeamColors && teamColors 
    ? { backgroundColor: teamColors.primary }
    : { backgroundColor: '#3B82F6' }; // Default blue fallback
  
  const iconColorClass = useTeamColors && teamColors 
    ? "text-white" // White icon on colored background
    : "text-blue-600"; // Default blue icon
  
  return (
    <div 
      className={cn("flex items-center justify-center", containerSize, "rounded-full flex-shrink-0")}
      style={bgColor}
    >
      <Icon className={cn(iconSize, iconColorClass)} />
    </div>
  );
};

// Helper function to get team colors or generate fallback
const getTeamColors = (team: any) => {
  if (team.color) {
    return {
      primary: team.color.primary,
      secondary: team.color.secondary
    };
  }
  
  // Generate consistent color based on team name (same as TeamCard)
  const colors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
    '#EF4444', '#6366F1', '#EC4899', '#14B8A6'
  ];
  const index = team.name.charCodeAt(0) % colors.length;
  const primaryColor = colors[index];
  return createTeamColor(primaryColor);
};

export function TeamSwitcher({ 
  className = '', 
  showIcon = true
}: TeamSwitcherProps) {
  const { 
    currentTeam, 
    allTeams, 
    allTeamMembers, 
    switchTeam, 
    userTeamStatus,
    isLoading 
  } = useTeam();
  
  const { user } = useUser();

  // Don't render if user is not a team member
  if (userTeamStatus !== 'team-member' || !currentTeam) {
    return null;
  }

  // If user only has one team, show a nice single team display
  if (allTeams.length <= 1) {
    const currentMember = allTeamMembers.find(member => member.teamId === currentTeam._id);
    const teamColors = getTeamColors(currentTeam);
    
    return (
      <div 
        className={cn(
          "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200",
          "min-w-[200px] w-full mx-2 my-1",
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${teamColors.secondary} 0%, ${teamColors.primary}20 100%)`,
          borderColor: `${teamColors.primary}50`
        }}
      >
        {showIcon && (
          <TeamLogoOrIcon 
            team={currentTeam}
            icon={Trophy}
            iconSize="w-3.5 h-3.5"
            containerSize="w-7 h-7"
            useTeamColors={true}
          />
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-sm text-gray-900 truncate">
            {currentTeam.name}
          </span>
          <Badge 
            variant="secondary" 
            className="text-xs px-1.5 py-0.5 mt-0.5 w-fit"
          >
            {currentMember?.status || 'active'}
          </Badge>
        </div>
      </div>
    );
  }

  // If user has multiple teams, show dropdown (only for coaches)
  if (user?.role === 'coach' && allTeams.length > 1) {
    const currentTeamColors = getTeamColors(currentTeam);
    
    return (
      <div 
        className={cn(
          "flex items-center gap-2.5 p-1.5 rounded-3xl border transition-all duration-200",
          "min-w-[200px] w-full mx-2 my-1",
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${currentTeamColors.secondary} 0%, ${currentTeamColors.primary}20 100%)`,
          borderColor: `${currentTeamColors.primary}50`
        }}
      >
        {showIcon && (
          <TeamLogoOrIcon 
            team={currentTeam}
            icon={Users}
            iconSize="w-3.5 h-3.5"
            containerSize="w-7 h-7"
            useTeamColors={true}
          />
        )}
        <Select
          value={currentTeam._id}
          onValueChange={switchTeam}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0">
            <SelectValue>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="font-semibold text-sm text-gray-900 truncate">
                    {currentTeam.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {allTeams.length} teams
                  </span>
                </div>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-72">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                Switch Team
              </div>
              {allTeams.map((team) => {
                const teamMember = allTeamMembers.find(member => member.teamId === team._id);
                const isCurrentTeam = team._id === currentTeam._id;
                const teamColors = getTeamColors(team);
                
                return (
                  <SelectItem 
                    key={team._id} 
                    value={team._id}
                    className={cn(
                      "relative cursor-pointer rounded-xl p-2.5 mb-1",
                      isCurrentTeam 
                        ? "border" 
                        : "hover:bg-gray-50"
                    )}
                    style={isCurrentTeam ? {
                      background: `linear-gradient(135deg, ${teamColors.secondary} 0%, ${teamColors.primary}10 100%)`,
                      borderColor: `${teamColors.primary}50`
                    } : {}}
                  >
                    <div className="flex items-center gap-2.5">
                      <TeamLogoOrIcon 
                        team={team}
                        icon={Building}
                        iconSize="w-3 h-3"
                        containerSize="w-6 h-6"
                        useTeamColors={true}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "font-medium text-sm truncate",
                            isCurrentTeam ? "text-gray-900" : "text-gray-900"
                          )}>
                            {team.name}
                          </span>
                          {isCurrentTeam && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-1.5 py-0.5 flex-shrink-0 ml-2"
                              style={{
                                backgroundColor: `${teamColors.primary}20`,
                                color: teamColors.primary
                              }}
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs px-1.5 py-0.5 mt-1"
                        >
                          {teamMember?.status || 'active'}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </div>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Fallback for athletes with multiple teams
  const fallbackTeamColors = getTeamColors(currentTeam);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200",
        "min-w-[200px] w-full mx-2 my-1",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${fallbackTeamColors.secondary} 0%, ${fallbackTeamColors.primary}20 100%)`,
        borderColor: `${fallbackTeamColors.primary}50`
      }}
    >
      {showIcon && (
        <TeamLogoOrIcon 
          team={currentTeam}
          icon={Trophy}
          iconSize="w-3.5 h-3.5"
          containerSize="w-7 h-7"
          useTeamColors={true}
        />
      )}
      <span className="font-semibold text-sm text-gray-900">{currentTeam.name}</span>
    </div>
  );
} 
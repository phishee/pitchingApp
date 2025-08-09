'use client';

import React from 'react';
import { useTeam } from '@/providers/team-context';
import { useUser } from '@/providers/user.context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

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
    
    return (
      <div className={cn(
        "flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50",
        "hover:from-blue-100 hover:to-indigo-100 transition-all duration-200",
        "min-w-[200px] w-full mx-2 my-1",
        className
      )}>
        {showIcon && (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
            <Trophy className="w-3.5 h-3.5" />
          </div>
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
    return (
      <div className={cn(
        "flex items-center gap-2.5 p-1.5 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50",
        "hover:from-purple-100 hover:to-indigo-100 transition-all duration-200",
        "min-w-[200px] w-full mx-2 my-1",
        className
      )}>
        {showIcon && (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
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
                
                return (
                  <SelectItem 
                    key={team._id} 
                    value={team._id}
                    className={cn(
                      "relative cursor-pointer rounded-xl p-2.5 mb-1",
                      isCurrentTeam 
                        ? "bg-blue-50 border border-blue-200" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0",
                        isCurrentTeam 
                          ? "bg-blue-100 text-blue-600" 
                          : "bg-gray-100 text-gray-600"
                      )}>
                        <Building className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "font-medium text-sm truncate",
                            isCurrentTeam ? "text-blue-900" : "text-gray-900"
                          )}>
                            {team.name}
                          </span>
                          {isCurrentTeam && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 flex-shrink-0 ml-2">
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
  return (
    <div className={cn(
      "flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50",
      "hover:from-blue-100 hover:to-indigo-100 transition-all duration-200",
      "min-w-[200px] w-full mx-2 my-1",
      className
    )}>
      {showIcon && (
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
          <Trophy className="w-3.5 h-3.5" />
        </div>
      )}
      <span className="font-semibold text-sm text-gray-900">{currentTeam.name}</span>
    </div>
  );
} 
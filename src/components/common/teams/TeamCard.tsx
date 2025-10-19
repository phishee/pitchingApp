'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, ArrowRight, Check, UserPlus, Edit3 } from 'lucide-react';
import { Team } from '@/models';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getRandomTeamColor, createTeamColor } from '@/lib/colorUtils';

interface TeamCardProps {
  team: Team;
  memberCount?: number;
  userRole?: 'coach' | 'athlete';
  isCurrentTeam?: boolean;
  onViewTeam?: (teamId: string) => void;
  onSwitchTeam?: (teamId: string) => void;
  onJoinTeam?: (teamId: string) => void;
  onEditTeam?: (teamId: string) => void;
}

export function TeamCard({ 
  team, 
  memberCount = 0,
  userRole,
  isCurrentTeam = false,
  onViewTeam,
  onSwitchTeam,
  onJoinTeam,
  onEditTeam 
}: TeamCardProps) {
  // Generate team initials for fallback
  const getTeamInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get team colors or generate fallback
  const getTeamColors = () => {
    if (team.color) {
      return {
        primary: team.color.primary,
        secondary: team.color.secondary
      };
    }
    
    // Generate consistent color based on team name
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
      '#EF4444', '#6366F1', '#EC4899', '#14B8A6'
    ];
    const index = team.name.charCodeAt(0) % colors.length;
    const primaryColor = colors[index];
    return createTeamColor(primaryColor);
  };

  const teamColors = getTeamColors();

  const teamInitials = getTeamInitials(team.name);

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-pointer",
        isCurrentTeam && "ring-2 ring-blue-500 ring-opacity-50"
      )}
      onClick={() => onViewTeam?.(team._id)}
    >
        {/* Team Logo/Header */}
        <div 
          className="relative h-32 overflow-hidden flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${teamColors.secondary} 0%, ${teamColors.primary}20 100%)`
          }}
        >
        {team.logoUrl && team.logoUrl.trim() !== '' ? (
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={team.logoUrl}
              alt={`${team.name} logo`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-white font-bold text-xl"
            style={{ backgroundColor: teamColors.primary }}
          >
            {teamInitials}
          </div>
        )}
        
        {/* Current Team Badge */}
        {isCurrentTeam && (
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className="bg-blue-600 text-white border-0 font-medium text-xs px-2 py-1 shadow-sm"
            >
              <Check className="w-3 h-3 mr-1" />
              Current
            </Badge>
          </div>
        )}
        
        {/* Action buttons overlay */}
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewTeam?.(team._id);
            }}
          >
            <Eye className="w-3 h-3" />
          </Button>
          {userRole === 'coach' && onEditTeam && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditTeam(team._id);
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Team Name and Code */}
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1">
            {team.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-gray-200"
            >
              #{team.teamCode}
            </Badge>
          </div>
        </div>
        
        {/* Description */}
        {team.description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {team.description}
          </p>
        )}
        
        {/* Member Count */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isCurrentTeam ? (
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onViewTeam?.(team._id);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          ) : onSwitchTeam ? (
            <Button 
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onSwitchTeam(team._id);
              }}
            >
              <ArrowRight className="w-3 h-3 mr-1" />
              Switch Team
            </Button>
          ) : onJoinTeam ? (
            <Button 
              variant="secondary"
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                onJoinTeam(team._id);
              }}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Join Team
            </Button>
          ) : (
            <Button 
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewTeam?.(team._id);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Team
            </Button>
          )}
        </div>
      </CardContent>

      {/* Hover border effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-lg transition-colors duration-200 pointer-events-none"></div>
    </Card>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TeamMemberWithUser } from '@/models';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MemberSwitcherProps {
  selectedMember: Partial<TeamMemberWithUser> | null;
  members: Partial<TeamMemberWithUser>[];
  onMemberSelect: (member: Partial<TeamMemberWithUser> | null) => void;
  className?: string;
}

export function MemberSwitcher({ 
  selectedMember, 
  members, 
  onMemberSelect, 
  className = "" 
}: MemberSwitcherProps) {
  const getUserDisplayName = (member: Partial<TeamMemberWithUser>) => {
    if ('user' in member && member.user) {
      return member.user.name || 'Unknown User';
    } else if ('name' in member) {
      return member.name || 'Unknown User';
    }
    return 'Team Member';
  };

  const getUserRole = (member: Partial<TeamMemberWithUser>) => {
    if ('user' in member && member.user) {
      return member.user.role || '';
    } else if ('role' in member) {
      return member.role || '';
    }
    return '';
  };

  const getUserProfileImage = (member: Partial<TeamMemberWithUser>) => {
    if ('user' in member && member.user) {
      return member.user.profileImageUrl || '';
    } else if ('profileImageUrl' in member) {
      return member.profileImageUrl || '';
    }
    return '';
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const selectedUserInfo = selectedMember ? {
    name: getUserDisplayName(selectedMember),
    role: getUserRole(selectedMember),
    profileImage: getUserProfileImage(selectedMember)
  } : null;

  return (
    <div className={cn("member-switcher", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className=" justify-between p-3 h-auto rounded-full"
          >
            <div className="flex items-center space-x-3">
              {selectedUserInfo ? (
                <>
                  <Avatar className="w-8 h-8">
                    {selectedUserInfo.profileImage && typeof selectedUserInfo.profileImage === 'string' && selectedUserInfo.profileImage.trim() !== '' && (
                      <AvatarImage src={selectedUserInfo.profileImage} alt="User avatar" />
                    )}
                    <AvatarFallback className="text-sm font-medium">
                      {getInitials(selectedUserInfo.name as string)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium text-sm">{selectedUserInfo.name as string}</div>
                    <div className="text-xs text-muted-foreground">{selectedUserInfo.role}</div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-gray-500">Select a team member</div>
                  </div>
                </div>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" side="bottom" align="start">
          {/* Clear selection option */}
          <DropdownMenuItem
            onClick={() => onMemberSelect(null)}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-gray-500" />
            </div>
            <div className="text-gray-500 italic">Clear selection</div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {members.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-center text-sm">
              No team members available
            </div>
          ) : (
            members.map((member) => {
              const userId = ('user' in member && member.user?.userId) || member.userId;
              const displayName = getUserDisplayName(member);
              const role = getUserRole(member);
              const profileImage = getUserProfileImage(member);
              
              return (
                <DropdownMenuItem
                  key={userId}
                  onClick={() => onMemberSelect(member)}
                  className="flex items-center gap-3 p-3"
                >
                  <Avatar className="w-8 h-8">
                    {profileImage && typeof profileImage === 'string' && profileImage.trim() !== '' && (
                      <AvatarImage src={profileImage} alt="User avatar" />
                    )}
                    <AvatarFallback className="text-sm font-medium">
                      {getInitials(displayName as string)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{displayName as string}</span>
                    <span className="text-xs text-muted-foreground">{role}</span>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
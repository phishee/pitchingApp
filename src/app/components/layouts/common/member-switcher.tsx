import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMemberWithUser } from '@/models';
import { useTeam } from '@/providers/team-context';

// Member Switcher Component
interface MemberSwitcherProps {
  selectedMember?: Partial<TeamMemberWithUser> | null;
  members?: Partial<TeamMemberWithUser>[];
  onMemberSelect: (member: Partial<TeamMemberWithUser>) => void;
  className?: string;
}

export function MemberSwitcher({ 
  selectedMember, 
  members, 
  onMemberSelect, 
  className = "" 
}: MemberSwitcherProps) {
  const { teamMembers, currentTeamMember } = useTeam();
  
  // Use provided members or fall back to team context
  const availableMembers = members || teamMembers;
  
  // Use selectedMember prop or fall back to currentTeamMember from context
  const currentMember = selectedMember || currentTeamMember;
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMemberDisplayName = (member?: Partial<TeamMemberWithUser> | null) => {
    if (!member) return 'Unknown Member';
    
    // Check if it's a PopulatedTeamMember with user data
    if ('user' in member && member.user) {
      return member.user.name || 'Unknown User';
    }
    // Fallback for basic TeamMember
    return 'Team Member';
  };

  const getMemberProfileImage = (member?: Partial<TeamMemberWithUser> | null) => {
    if (!member) return undefined;
    // console.log('member image: ', member?.user?.profileImageUrl);
    // Check if it's a PopulatedTeamMember with user data
    if ('user' in member && member.user && member.user.profileImageUrl && member.user.profileImageUrl.trim() !== '') {
      return member.user.profileImageUrl;
    }
    return undefined;
  };

  const getMemberEmail = (member?: Partial<TeamMemberWithUser> | null) => {
    if (!member) return undefined;
    
    // Check if it's a PopulatedTeamMember with user data
    if ('user' in member && member.user) {
      return member.user.email;
    }
    return undefined;
  };

  if (!currentMember || availableMembers.length <= 1) {
    // If no current member or only one member, show a simple display
    return (
      <div className={`flex items-center gap-2 bg-purple-50 p-3 rounded-lg border border-purple-200 ${className}`}>
        <Avatar className="w-8 h-8">
          {getMemberProfileImage(currentMember) && getMemberProfileImage(currentMember)?.trim() !== '' && (
            <AvatarImage 
              src={getMemberProfileImage(currentMember)} 
              alt="Member avatar" 
            />
          )}
          <AvatarFallback className="text-sm font-semibold">
            {getInitials(getMemberDisplayName(currentMember))}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {getMemberDisplayName(currentMember)}
          </span>
          {getMemberEmail(currentMember) && (
            <span className="text-xs text-muted-foreground">
              {getMemberEmail(currentMember)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center gap-2 pt-2 pb-2 pl-3 pr-3 h-auto bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full ${className}`}
        >
          <Avatar className="w-8 h-8">
            {getMemberProfileImage(currentMember) && getMemberProfileImage(currentMember)?.trim() !== '' && (
              <AvatarImage 
                src={getMemberProfileImage(currentMember)} 
                alt="Member avatar" 
              />
            )}
            <AvatarFallback className="text-sm font-semibold">
              {getInitials(getMemberDisplayName(currentMember))}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {getMemberDisplayName(currentMember)}
            </span>
            {/* {getMemberEmail(currentMember) && (
              <span className="text-xs text-muted-foreground">
                {getMemberEmail(currentMember)}
              </span>
            )} */}
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="start">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Switch Member
          </div>
          {availableMembers.map((member) => {
            if (!member) return null; // Skip undefined members
            
            const isCurrentMember = member._id === currentMember?._id;
            const displayName = getMemberDisplayName(member);
            const profileImage = getMemberProfileImage(member);
            const email = getMemberEmail(member);
            
            return (
              <DropdownMenuItem
                key={member._id}
                onClick={() => onMemberSelect(member)}
                className={`flex items-center gap-2 p-2 cursor-pointer ${
                  isCurrentMember ? 'bg-accent' : ''
                }`}
              >
                <Avatar className="w-8 h-8">
                  {profileImage && profileImage.trim() !== '' && (
                    <AvatarImage src={profileImage} alt="Member avatar" />
                  )}
                  <AvatarFallback className="text-sm font-semibold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">
                    {displayName}
                  </span>
                  {email && (
                    <span className="text-xs text-muted-foreground">
                      {email}
                    </span>
                  )}
                </div>
                {isCurrentMember && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { Search, X, UserPlus, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TeamInvitation } from '@/models';

interface User {
  _id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  position?: string;
  role?: 'coach' | 'athlete';
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'onboarding' | 'user-page';
  existingInvitations: Partial<TeamInvitation>[];
  existingMembers: string[]; // Array of userIds who are already team members
  onAddMember?: (invitation: Partial<TeamInvitation>) => void; // For onboarding
  onInviteUser?: (invitation: Partial<TeamInvitation>) => void; // For user page
  teamId?: string;
  invitedBy: string; // Current user's ID
}

const InviteUserModal = ({
  isOpen,
  onClose,
  mode,
  existingInvitations,
  existingMembers,
  onAddMember,
  onInviteUser,
  teamId,
  invitedBy
}: InviteUserModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'coach' | 'athlete'>('athlete');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Mock data - replace with actual API call
  const allUsers: User[] = [
    {
      _id: "user_001",
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      position: "pitcher",
      role: "athlete"
    },
    {
      _id: "user_002",
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      position: "catcher",
      role: "athlete"
    },
    {
      _id: "user_003",
      name: "Mike Rodriguez",
      email: "mike.rodriguez@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      position: "shortstop",
      role: "athlete"
    },
    {
      _id: "user_004",
      name: "Coach Williams",
      email: "coach.williams@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "coach"
    },
    {
      _id: "user_005",
      name: "Emma Davis",
      email: "emma.davis@email.com",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      position: "center_field",
      role: "athlete"
    }
  ];

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return allUsers;
    
    return allUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter out existing team members
      const isNotMember = !existingMembers.includes(user._id);
      
      // Filter by selected role
      const matchesRole = user.role === selectedRole;
      
      return matchesSearch && isNotMember && matchesRole;
    });
  }, [searchQuery, selectedRole, existingMembers]);

  const isUserAlreadyInvited = (userId: string) => {
    return existingInvitations.some(inv => inv.invitedUserId === userId);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSendInvitations = () => {
    const selectedUsersList = Array.from(selectedUsers);
    
    selectedUsersList.forEach(userId => {
      const user = allUsers.find(u => u._id === userId);
      if (user) {
        const invitation: Partial<TeamInvitation> = {
          teamId,
          invitedUserId: user._id,
          invitedEmail: user.email,
          role: user.role,
          invitedBy,
          invitedAt: new Date(),
          status: 'pending',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (mode === 'onboarding') {
          onAddMember?.(invitation);
        } else {
          onInviteUser?.(invitation);
        }
      }
    });

    // Clear selection and close modal
    setSelectedUsers(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedUsers(new Set());
    onClose();
  };

  const getPositionDisplay = (position?: string) => {
    if (!position) return '-';
    return position.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Invite Users to Team</DialogTitle>
          <DialogDescription>
            Search for users and invite them to join your team
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
          {/* Search and Role Filter */}
          <div className="flex gap-4 flex-shrink-0">
            <div className="flex-1 relative">
              <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
              {searchQuery.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedRole === 'athlete' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedRole('athlete')}
              >
                Athletes
              </Button>
              <Button
                variant={selectedRole === 'coach' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedRole('coach')}
              >
                Coaches
              </Button>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedUsers.size > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUsers(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No users found matching your search' : 'Start typing to search for users'}
                  </div>
                ) : (
                  filteredUsers.map(user => {
                    const isInvited = isUserAlreadyInvited(user._id);
                    const isSelected = selectedUsers.has(user._id);
                    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
                    
                    return (
                      <div 
                        key={user._id} 
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => !isInvited && toggleUserSelection(user._id)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12">
                            {user.profileImageUrl && (
                              <AvatarImage src={user.profileImageUrl} alt={user.name} />
                            )}
                            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-1">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="capitalize">
                                {user.role}
                              </Badge>
                              {user.position && (
                                <Badge variant="secondary" className="capitalize">
                                  {getPositionDisplay(user.position)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {isInvited ? (
                            <span className="text-sm text-muted-foreground">Already invited</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <Check className="size-5 text-primary" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {isSelected ? 'Selected' : 'Click to select'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer with action buttons */}
        <DialogFooter className="flex items-center justify-between flex-shrink-0 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedUsers.size > 0 && `${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''} ready to invite`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvitations}
              disabled={selectedUsers.size === 0}
              className="flex items-center gap-2"
            >
              <UserPlus className="size-4" />
              {mode === 'onboarding' ? 'Add Selected Members' : 'Send Invitations'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X, UserPlus, Check, Loader2 } from 'lucide-react';
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
import { TeamInvitation, User } from '@/models';
import { userApi } from '@/app/services-client/userApi';

  // interface User {
  //   _id: string;
  //   name: string;
  //   email: string;
  //   profileImageUrl?: string;
  //   position?: string;
  //   role?: 'coach' | 'athlete';
  // }

interface SearchResult {
  type: 'existing' | 'new';
  user?: User;
  email?: string;
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'onboarding' | 'user-page';
  existingInvitations: Partial<TeamInvitation>[];
  existingMembers: string[]; // Array of userIds who are already team members
  onAddMember?: (invitation: Partial<TeamInvitation>[]) => void; // For onboarding
  onInviteUser?: (invitation: Partial<TeamInvitation>[]) => void; // For user page
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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = useCallback(async (email: string) => {
    if (!email || email.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Now using userApi instead of direct fetch
      const existingUsers = await userApi.searchUsersByEmail(email.trim());
      
      // Create search results
      const results: SearchResult[] = [];
      
      // Add existing users that match the role
      existingUsers.forEach(user => {
        if (user.role === selectedRole && !existingMembers.includes(user.userId)) {
          results.push({
            type: 'existing',
            user
          });
        }
      });
      
      // If no existing users found, show the email as a new user option
      if (results.length === 0 && email.trim().length > 0) {
        results.push({
          type: 'new',
          email: email.trim()
        });
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [selectedRole, existingMembers]);

  // Handle search input changes with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for 1 second
    const timeout = setTimeout(() => {
      performSearch(value);
    }, 1000);
    
    setSearchTimeout(timeout);
  };

  // Clear search results when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    }
  }, [isOpen, searchTimeout]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const isUserAlreadyInvited = (userId: string) => {
    return existingInvitations.some(inv => inv.invitedUserId === userId);
  };

  const isEmailAlreadyInvited = (email: string) => {
    return existingInvitations.some(inv => inv.invitedEmail === email);
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

  const toggleEmailSelection = (email: string) => {
    const newSelection = new Set(selectedUsers);
    const emailKey = `email_${email}`;
    
    if (newSelection.has(emailKey)) {
      newSelection.delete(emailKey);
    } else {
      newSelection.add(emailKey);
    }
    setSelectedUsers(newSelection);
  };

  const handleSendInvitations = () => {
    const selectedUsersList = Array.from(selectedUsers);
    const invitations: Partial<TeamInvitation>[] = [];
    
    // Build the invitations array
    selectedUsersList.forEach(userId => {
      // Check if it's an existing user or new email
      if (userId.startsWith('email_')) {
        // New user invitation
        const email = userId.replace('email_', '');
        const invitation: Partial<TeamInvitation> = {
          teamId,
          invitedEmail: email,
          role: selectedRole,
          invitedBy,
          invitedAt: new Date(),
          status: 'pending',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        invitations.push(invitation);
      } else {
        // Existing user invitation
        const user = searchResults.find(result => 
          result.type === 'existing' && result.user?.userId === userId
        )?.user;
        
        if (user) {
          const invitation: Partial<TeamInvitation> = {
            teamId,
            invitedUserId: user.userId,
            invitedEmail: user.email,
            role: user.role || 'athlete',
            invitedBy,
            invitedAt: new Date(),
            status: 'pending',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          invitations.push(invitation);
        }
      }
    });

    // Call the appropriate callback with the entire array
    if (mode === 'onboarding') {
      onAddMember?.(invitations);
    } else {
      onInviteUser?.(invitations);
    }

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

  const getEmailInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Invite Users to Team</DialogTitle>
          <DialogDescription>
            Search for users by email and invite them to join your team
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
          {/* Search and Role Filter */}
          <div className="flex gap-4 flex-shrink-0">
            <div className="flex-1 relative">
              <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="ps-9"
              />
              {searchQuery.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {isSearching && (
                <Loader2 className="size-4 text-muted-foreground absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6 animate-spin" />
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
                {searchError && (
                  <div className="text-center text-red-600 py-4 bg-red-50 border border-red-200 rounded-lg">
                    {searchError}
                  </div>
                )}
                
                {!searchQuery && (
                  <div className="text-center text-muted-foreground py-8">
                    Start typing an email to search for users
                  </div>
                )}
                
                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No users found matching your search
                  </div>
                )}
                
                {searchResults.map((result, index) => {
                  if (result.type === 'existing' && result.user) {
                    const user = result.user;
                    const isInvited = isUserAlreadyInvited(user.userId);
                    const isAlreadyMember = existingMembers.includes(user.userId);
                    const isSelected = selectedUsers.has(user.userId);
                    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
                    
                    return (
                      <div 
                        key={user.userId} 
                        className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                          isAlreadyMember ? 'bg-gray-50 border-gray-200 cursor-not-allowed' :
                          isSelected ? 'border-primary bg-primary/5 cursor-pointer' : 
                          'hover:bg-muted/50 cursor-pointer'
                        }`}
                        onClick={() => !isInvited && !isAlreadyMember && toggleUserSelection(user.userId)}
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
                          {isAlreadyMember ? (
                            <span className="text-sm text-muted-foreground">Already a team member</span>
                          ) : isInvited ? (
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
                  } else if (result.type === 'new' && result.email) {
                    const email = result.email;
                    const isInvited = isEmailAlreadyInvited(email);
                    const isSelected = selectedUsers.has(`email_${email}`);
                    const initials = getEmailInitials(email);
                    
                    return (
                      <div 
                        key={`email_${email}`} 
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => !isInvited && toggleEmailSelection(email)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12">
                            <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-1">
                            <div className="font-medium text-muted-foreground">New User</div>
                            <div className="text-sm text-muted-foreground">{email}</div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="capitalize">
                                {selectedRole}
                              </Badge>
                              <Badge variant="secondary">
                                Email Invitation
                              </Badge>
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
                  }
                  
                  return null;
                })}
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

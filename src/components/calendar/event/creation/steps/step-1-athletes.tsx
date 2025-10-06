import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Search, AlertCircle, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AthletesStepProps } from '../work-assignment-types';
import { UserInfo } from '@/models';
import { useWorkoutEventCreation } from '@/providers/event-creation-context';

export function Step1SelectAthletes({
  assignmentData,
  onAssignmentDataChange,
  availableMembers,
  searchQuery,
  onSearchChange,
}: AthletesStepProps) {
  const { 
    eventCreationData, 
    updateParticipants, 
    updateTargetAthletes,
    currentUserId
  } = useWorkoutEventCreation();

  // Handle athlete selection logic
  const handleAthleteSelection = (selectedAthletes: UserInfo[]) => {
    if (selectedAthletes.length === 1) {
      // Single athlete - put in participants
      updateParticipants({
        athletes: selectedAthletes,
        required: selectedAthletes.map(a => a.userId)
      });
      updateTargetAthletes([]); // Clear targetAthletes
    } else if (selectedAthletes.length > 1) {
      // Multiple athletes - put in targetAthletes
      updateTargetAthletes(selectedAthletes);
      updateParticipants({
        athletes: [], // Clear participants
        required: []
      });
    } else {
      // No athletes selected - clear both
      updateParticipants({
        athletes: [],
        required: []
      });
      updateTargetAthletes([]);
    }

    // Also update the assignment data for backward compatibility
    onAssignmentDataChange({
      selectedMembers: selectedAthletes.map(athlete => ({
        _id: athlete.memberId,
        userId: athlete.userId,
        user: { userId: athlete.userId }
      }))
    });
  };

  // Get current selected athletes from context
  const getCurrentSelectedAthletes = (): UserInfo[] => {
    const { eventData, targetAthletes } = eventCreationData;
    
    // Check if we have athletes in targetAthletes (multiple selection)
    if (targetAthletes && targetAthletes.length > 0) {
      return targetAthletes;
    }
    
    // Check if we have athletes in participants (single selection)
    if (eventData.participants?.athletes && eventData.participants.athletes.length > 0) {
      return eventData.participants.athletes;
    }
    
    return [];
  };

  const currentSelectedAthletes = getCurrentSelectedAthletes();

  useEffect(() => {
    // If we have a current user from the context and no athletes are currently selected
    if (currentUserId && currentSelectedAthletes.length === 0) {
      // Find the current user in available members
      const currentUserMember = availableMembers.find(member => 
        member.userId === currentUserId || 
        ('user' in member && member.user?.userId === currentUserId)
      );
      
      if (currentUserMember) {
        const currentUserInfo: UserInfo = {
          userId: currentUserMember.userId || currentUserId,
          memberId: currentUserMember._id || ''
        };
        
        // Automatically select the current user
        handleAthleteSelection([currentUserInfo]);
      }
    }
  }, [currentUserId, availableMembers, currentSelectedAthletes.length, handleAthleteSelection]);

  // Convert UserInfo[] to the format expected by your existing UI
  const selectedMembersForUI = currentSelectedAthletes.map(athlete => ({
    _id: athlete.memberId,
    userId: athlete.userId,
    user: { userId: athlete.userId }
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Athletes</h3>
        
        {/* Athlete selection UI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Select Athletes ({currentSelectedAthletes.length} selected)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAthleteSelection(availableMembers.map(m => ({
                    userId: m.userId || '',
                    memberId: m._id || ''
                  })))}
                  disabled={availableMembers.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAthleteSelection([])}
                  disabled={currentSelectedAthletes.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search athletes by name or email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Athletes List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No athletes available to assign</p>
                </div>
              ) : (
                availableMembers.map((member) => {
                  const userName = ('user' in member && member.user?.name) || 'Unknown User';
                  const userEmail = ('user' in member && member.user?.email) || '';
                  const isSelected = currentSelectedAthletes.some(a => a.memberId === member._id);
                  
                  return (
                    <div
                      key={member._id}
                      onClick={() => {
                        const memberUserInfo: UserInfo = {
                          userId: member.userId || '',
                          memberId: member._id || ''
                        };
                        const newSelection = isSelected
                          ? currentSelectedAthletes.filter(a => a.memberId !== member._id)
                          : [...currentSelectedAthletes, memberUserInfo];
                        handleAthleteSelection(newSelection);
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                        isSelected 
                          ? "bg-primary/5 border-primary hover:bg-primary/10" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox 
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{userName}</div>
                        <div className="text-sm text-muted-foreground truncate">{userEmail}</div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Show current selection status */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {currentSelectedAthletes.length === 0 && "No athletes selected"}
            {currentSelectedAthletes.length === 1 && 
              `Single athlete selected: ${currentSelectedAthletes[0].userId} (will be added to participants)`
            }
            {currentSelectedAthletes.length > 1 && 
              `${currentSelectedAthletes.length} athletes selected (will be added to targetAthletes)`
            }
          </p>
        </div>

        {/* Validation Message */}
        {currentSelectedAthletes.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-900 dark:text-amber-200 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>Please select at least one athlete to continue</p>
          </div>
        )}
      </div>
    </div>
  );
}
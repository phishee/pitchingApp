'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ViewToggle } from './view-toggle';
import { MonthNavigation } from './month-navigation';
import { ActionButtons } from './action-buttons';
import { EventPopup } from './event/popup/event-popup';
import { MonthView } from './views/month-view';
import { WeekView } from './views/week-view';
import { DayView } from './views/day-view';
import { useCalendar } from '@/providers/calendar-context';
import { useTeam } from '@/providers/team-context';
import { MemberSwitcher } from '@/app/components/layouts/common/member-switcher';
import { CalendarEvent, Event, TeamMemberWithUser } from '@/models';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useOrganization } from '@/providers/organization-context';

interface CoachCalendarProps {
  className?: string;
}

export function CoachCalendar({ className }: CoachCalendarProps) {
  const {
    currentDate,
    currentView,
    selectedEvent,
    popupPosition,
    selectedMember,
    isLoadingEvents,
    setCurrentView,
    navigateToPrevious,
    navigateToNext,
    showEventPopup,
    hideEventPopup,
    setSelectedMember,
    addEvent,
  } = useCalendar();

  const { teamMembers } = useTeam();
  const { currentOrganization } = useOrganization();
  const { currentTeam } = useTeam();
  const handleEventClick = (event: CalendarEvent) => {
    // For now, we'll position the popup in the center of the screen
    // In a real app, you might want to get the actual click position
    showEventPopup(event, {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
  };

  const handleMemberSelect = (member: Partial<TeamMemberWithUser> | null) => {
    setSelectedMember(member);
    // Events will be automatically loaded via useEffect in the context
  };

  const handleEventTypeSelect = async (eventType: string) => {
    if (!selectedMember) {
      console.warn('Please select a team member first');
      return;
    }

    try {
      // Get current user ID from selected member
      const userId = ('user' in selectedMember && selectedMember.user?.userId) || selectedMember.userId;
      if (!userId) {
        console.error('No userId found in selected member');
        return;
      }

      // Create a proper Event object
      const newEvent: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        groupId: `manual-${Date.now()}`,
        type: getEventTypeFromString(eventType),
        organizationId: currentOrganization?._id || '', // You'll need to get this from context
        teamId: currentTeam?._id || '', // You'll need to get this from context
        title: `${eventType} - ${getMemberDisplayName(selectedMember)}`,
        description: eventType,
        startTime: new Date(`${currentDate.toISOString().split('T')[0]}T14:00:00`),
        endTime: new Date(`${currentDate.toISOString().split('T')[0]}T16:00:00`),
        participants: {
          athletes: [{ userId, memberId: 'member-id' }],
          coaches: [],
          required: [userId],
          optional: []
        },
        sourceId: 'manual-workout-event',
        sourceType: 'workout_assignment' as const,
        sequenceNumber: 1,
        totalInSequence: 1,
        isModified: false,
        status: 'scheduled' as const,
        visibility: 'team_only' as const,
        createdBy: { userId, memberId: 'creator-member-id' }
      };

      await addEvent(newEvent as Event);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className={cn(
      "p-6 bg-white",
      currentView === 'week' || currentView === 'day' ? "h-screen flex flex-col" : "min-h-screen",
      className
    )}>
      {/* Member Switcher at the top */}
      <div className="mb-6 flex-shrink-0">
        <MemberSwitcher
          selectedMember={selectedMember}
          members={teamMembers}
          onMemberSelect={handleMemberSelect}
        />
      </div>

      {/* Header with View Toggle and Navigation */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        <MonthNavigation
          currentDate={currentDate}
          onPreviousMonth={navigateToPrevious}
          onNextMonth={navigateToNext}
          view={currentView}
        />
        <ActionButtons 
          onEventTypeSelect={handleEventTypeSelect}
          selectedMembers={selectedMember && selectedMember._id && selectedMember.teamId && selectedMember.userId ? [selectedMember as TeamMemberWithUser] : []}
          availableMembers={teamMembers?.filter((member): member is TeamMemberWithUser => 
            member._id !== undefined && member.teamId !== undefined && member.userId !== undefined
          ) || []}
          // onAddEvent={addEvent}
          organizationId={currentOrganization?._id || ''} // Replace with actual organization ID
          teamId={currentTeam?._id || ''} // Replace with actual team ID
          currentUserId="current-user" // Replace with actual current user ID
        />
      </div>

      {/* Loading State */}
      {isLoadingEvents && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading {selectedMember ? getMemberDisplayName(selectedMember) as string : 'member'}'s calendar...
          </span>
        </div>
      )}

      {/* No Member Selected State */}
      {!selectedMember && !isLoadingEvents && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Team Member</h3>
            <p className="text-gray-500">Choose a team member above to view their calendar and assign events.</p>
          </div>
        </div>
      )}

      {/* Calendar Content */}
      {!isLoadingEvents && selectedMember && (
        <>
          {currentView === 'day' ? (
            <DayView
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          ) : currentView === 'week' ? (
            <WeekView
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          ) : (
            <MonthView
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          )}
        </>
      )}

      {/* Event Popup */}
      {selectedEvent && (
        <EventPopup
          event={selectedEvent}
          position={popupPosition}
          onClose={hideEventPopup}
        />
      )}
    </div>
  );
}

// Helper function to get member display name
function getMemberDisplayName(member: Partial<TeamMemberWithUser>) {
  if ('user' in member && member.user) {
    return member.user.name || 'Unknown User';
  } else if ('name' in member) {
    return member.name || 'Unknown User';
  }
  return 'Team Member';
}

// Helper function to get event type from string
function getEventTypeFromString(eventType: string): 'workout' | 'gameday' | 'assessment' | 'coaching_session' {
  switch (eventType) {
    case 'Assign Workout':
      return 'workout';
    case 'Assign Assessment':
      return 'assessment';
    case 'Book Session':
      return 'coaching_session';
    default:
      return 'workout';
  }
}

// Helper function to get color based on event type
function getEventTypeColor(eventType: string): string {
  switch (eventType) {
    case 'Assign Workout':
      return '#2196F3'; // blue
    case 'Assign Assessment':
      return '#4CAF50'; // green
    case 'Book Session':
      return '#FF9800'; // orange
    default:
      return '#9C27B0'; // purple
  }
}
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { CalendarView, CalendarEvent, TeamMemberWithUser, CalendarDay, Event } from '@/models';
import { calendarService } from '@/app/services-client/calendar-service';
import { eventApi, CreateEventsResponse } from '@/app/services-client/eventApi';

interface CalendarContextType {
  // Core state
  currentDate: Date;
  currentView: CalendarView;
  events: CalendarEvent[];
  calendarDays: CalendarDay[];
  selectedEvent: CalendarEvent | null;
  popupPosition: { x: number; y: number };
  
  // Member selection state
  selectedMember: Partial<TeamMemberWithUser> | null;
  isLoadingEvents: boolean;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setCurrentView: (view: CalendarView) => void;
  navigateToPrevious: () => void;
  navigateToNext: () => void;
  selectEvent: (event: CalendarEvent | null) => void;
  showEventPopup: (event: CalendarEvent, position: { x: number; y: number }) => void;
  hideEventPopup: () => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  
  // Member actions
  setSelectedMember: (member: Partial<TeamMemberWithUser> | null) => void;
  loadMemberEvents: (member: Partial<TeamMemberWithUser> | null) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
  organizationId: string; // NEW: Required
  initialDate?: Date;
  initialView?: CalendarView;
  initialEvents?: CalendarEvent[];
  initialSelectedMember?: Partial<TeamMemberWithUser> | null;
}

export function CalendarProvider({ 
  children,
  organizationId, // NEW: Required
  initialDate = new Date(), 
  initialView = 'month',
  initialEvents = [],
  initialSelectedMember = null
}: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [currentView, setCurrentView] = useState<CalendarView>(initialView);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState<Partial<TeamMemberWithUser> | null>(initialSelectedMember);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Get current user ID from selected member
  const getCurrentUserId = useCallback((): string | null => {
    if (!selectedMember) return null;
    
    if ('user' in selectedMember && selectedMember.user?.userId) {
      return selectedMember.user.userId;
    } else if ('userId' in selectedMember && selectedMember.userId) {
      return selectedMember.userId;
    }
    return null;
  }, [selectedMember]);

  // Load events when selected member or date/view changes
  const loadMemberEvents = useCallback(async (member: Partial<TeamMemberWithUser> | null) => {
    if (!member) {
      setEvents([]);
      setCalendarDays([]);
      return;
    }

    setIsLoadingEvents(true);
    try {
      let userId: string;
      if ('user' in member && member.user?.userId) {
        userId = member.user.userId;
      } else if ('userId' in member && member.userId) {
        userId = member.userId;
      } else {
        console.error('No userId found in member');
        setEvents([]);
        setCalendarDays([]);
        return;
      }

      if (currentView === 'month') {
        const monthData = await calendarService.getCalendarMonth(
          organizationId, // NEW: Pass organizationId
          userId, 
          currentDate.getFullYear(), 
          currentDate.getMonth() + 1
        );
        setCalendarDays(monthData);
        
        const allEvents = monthData.flatMap(day => day.events);
        setEvents(allEvents);
      } else {
        const range = currentView === 'week' ? getWeekRange(currentDate) : getDayRange(currentDate);
        const memberEvents = await calendarService.getEventsForDateRange(
          organizationId, // NEW: Pass organizationId
          userId, 
          range
        );
        setEvents(memberEvents);
        setCalendarDays([]);
      }
    } catch (error) {
      console.error('Error loading member events:', error);
      setEvents([]);
      setCalendarDays([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [organizationId, currentDate, currentView]); // NEW: Added organizationId to deps

  // Refresh events for current member and date range
  const refreshEvents = useCallback(async () => {
    await loadMemberEvents(selectedMember);
  }, [loadMemberEvents, selectedMember]);

  // Auto-reload events when member, date, or view changes
  useEffect(() => {
    loadMemberEvents(selectedMember);
  }, [selectedMember, currentDate, currentView, loadMemberEvents]);

  // Navigation actions
  const navigateToPrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (currentView === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (currentView === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  };

  const navigateToNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (currentView === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (currentView === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Event actions
  const selectEvent = (event: CalendarEvent | null) => {
    setSelectedEvent(event);
  };

  const showEventPopup = (event: CalendarEvent, position: { x: number; y: number }) => {
    setSelectedEvent(event);
    setPopupPosition(position);
  };

  const hideEventPopup = () => {
    setSelectedEvent(null);
  };

  const addEvent = async (eventData: Event) => {
    if (!selectedMember) {
      console.error('No member selected');
      return;
    }

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No userId found in selected member');
        return;
      }

      const newEvent = await calendarService.createEvent(eventData);
      const calendarEvent = calendarService.transformToCalendarEvent(newEvent, userId);
      setEvents(prev => [...prev, calendarEvent]);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error; // Propagate error for handling
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    if (!selectedMember) {
      console.error('No member selected');
      return;
    }

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No userId found in selected member');
        return;
      }

      const updatedEvent = await calendarService.updateEvent(eventId, updates);
      const calendarEvent = calendarService.transformToCalendarEvent(updatedEvent, userId);
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId ? calendarEvent : event
        )
      );
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!selectedMember) {
      console.error('No member selected');
      return;
    }

    try {
      await calendarService.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const contextValue: CalendarContextType = {
    // Core state
    currentDate,
    currentView,
    events,
    calendarDays,
    selectedEvent,
    popupPosition,
    selectedMember,
    isLoadingEvents,
    
    // Actions
    setCurrentDate,
    setCurrentView,
    navigateToPrevious,
    navigateToNext,
    selectEvent,
    showEventPopup,
    hideEventPopup,
    addEvent,
    updateEvent,
    deleteEvent,
    setSelectedMember,
    loadMemberEvents,
    refreshEvents,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}

// Utility functions
function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

function getDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CalendarView, CalendarEvent, TeamMemberWithUser } from '@/models';
import { calendarApi } from '@/app/services-client/calendarApi';

interface CalendarContextType {
  // Core state
  currentDate: Date;
  currentView: CalendarView;
  events: CalendarEvent[];
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
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
  
  // Member actions
  setSelectedMember: (member: Partial<TeamMemberWithUser> | null) => void;
  loadMemberEvents: (member: Partial<TeamMemberWithUser> | null) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
  initialDate?: Date;
  initialView?: CalendarView;
  initialEvents?: CalendarEvent[];
  initialSelectedMember?: Partial<TeamMemberWithUser> | null;
}

export function CalendarProvider({ 
  children, 
  initialDate = new Date(), 
  initialView = 'month',
  initialEvents = [],
  initialSelectedMember = null
}: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [currentView, setCurrentView] = useState<CalendarView>(initialView);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState<Partial<TeamMemberWithUser> | null>(initialSelectedMember);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Load events when selected member changes
  const loadMemberEvents = async (member: Partial<TeamMemberWithUser> | null) => {
    if (!member) {
      setEvents([]);
      return;
    }

    setIsLoadingEvents(true);
    try {
      // Get userId from member - handle both populated and non-populated members
      let userId: string;
      if ('user' in member && member.user?.userId) {
        userId = member.user.userId;
      } else if (member.userId) {
        userId = member.userId;
      } else {
        console.error('No userId found in member');
        setEvents([]);
        return;
      }

      const memberEvents = await calendarApi.getEventsByUserId(userId);
      setEvents(memberEvents);
    } catch (error) {
      console.error('Error loading member events:', error);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Load events when selected member changes
  useEffect(() => {
    loadMemberEvents(selectedMember);
  }, [selectedMember]);

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

  const addEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!selectedMember) {
      console.error('No member selected');
      return;
    }

    try {
      // Get userId from selected member
      let userId: string;
      if ('user' in selectedMember && selectedMember.user?.userId) {
        userId = selectedMember.user.userId;
      } else if (selectedMember.userId) {
        userId = selectedMember.userId;
      } else {
        console.error('No userId found in selected member');
        return;
      }

      const newEvent = await calendarApi.createEvent(userId, eventData);
      setEvents(prev => [...prev, newEvent]);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    if (!selectedMember) {
      console.error('No member selected');
      return;
    }

    try {
      // Get userId from selected member
      let userId: string;
      if ('user' in selectedMember && selectedMember.user?.userId) {
        userId = selectedMember.user.userId;
      } else if (selectedMember.userId) {
        userId = selectedMember.userId;
      } else {
        console.error('No userId found in selected member');
        return;
      }

      const updatedEvent = await calendarApi.updateEvent(userId, eventId, updates);
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId ? updatedEvent : event
        )
      );
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!selectedMember) {
      console.error('No member selected');
      return;
    }

    try {
      // Get userId from selected member
      let userId: string;
      if ('user' in selectedMember && selectedMember.user?.userId) {
        userId = selectedMember.user.userId;
      } else if (selectedMember.userId) {
        userId = selectedMember.userId;
      } else {
        console.error('No userId found in selected member');
        return;
      }

      await calendarApi.deleteEvent(userId, eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const contextValue: CalendarContextType = {
    // Core state
    currentDate,
    currentView,
    events,
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

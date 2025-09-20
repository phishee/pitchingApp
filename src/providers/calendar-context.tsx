'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CalendarView, CalendarEvent } from '@/models';
import { mockEvents } from '@/data/mock-event';

interface CalendarContextType {
  // Core state
  currentDate: Date;
  currentView: CalendarView;
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  popupPosition: { x: number; y: number };
  
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
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
  initialDate?: Date;
  initialView?: CalendarView;
  initialEvents?: CalendarEvent[];
}

export function CalendarProvider({ 
  children, 
  initialDate = new Date(), 
  initialView = 'month',
  initialEvents = mockEvents
}: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [currentView, setCurrentView] = useState<CalendarView>(initialView);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

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

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      )
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const contextValue: CalendarContextType = {
    // Core state
    currentDate,
    currentView,
    events,
    selectedEvent,
    popupPosition,
    
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

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RecurrenceConfig } from '@/models/Calendar';

interface ScheduleConfigState {
  recurrenceConfig: RecurrenceConfig;
  defaultStartTime: string;
  defaultEndTime: string;
  sessionType: 'individual' | 'coached';
  notes: string;
}

interface ScheduleConfigContextType {
  state: ScheduleConfigState;
  updateRecurrence: (config: RecurrenceConfig) => void;
  updateTimeSlot: (start: string, end: string) => void;
  updateSessionType: (type: 'individual' | 'coached') => void;
  updateNotes: (notes: string) => void;
  resetSchedule: () => void;
}

const ScheduleConfigContext = createContext<ScheduleConfigContextType | undefined>(undefined);

const DEFAULT_RECURRENCE: RecurrenceConfig = {
  pattern: 'weekly',
  interval: 1,
  startDate: new Date(),
  daysOfWeek: [],
  occurrences: 12
};

export function ScheduleConfigProvider({ children }: { children: ReactNode }) {
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>(DEFAULT_RECURRENCE);
  const [defaultStartTime, setDefaultStartTime] = useState('14:00');
  const [defaultEndTime, setDefaultEndTime] = useState('16:00');
  const [sessionType, setSessionType] = useState<'individual' | 'coached'>('individual');
  const [notes, setNotes] = useState('');

  const updateRecurrence = (config: RecurrenceConfig) => setRecurrenceConfig(config);
  const updateTimeSlot = (start: string, end: string) => {
    setDefaultStartTime(start);
    setDefaultEndTime(end);
  };
  const updateSessionType = (type: 'individual' | 'coached') => setSessionType(type);
  const updateNotes = (newNotes: string) => setNotes(newNotes);
  const resetSchedule = () => {
    setRecurrenceConfig(DEFAULT_RECURRENCE);
    setDefaultStartTime('14:00');
    setDefaultEndTime('16:00');
    setSessionType('individual');
    setNotes('');
  };

  return (
    <ScheduleConfigContext.Provider value={{
      state: { recurrenceConfig, defaultStartTime, defaultEndTime, sessionType, notes },
      updateRecurrence,
      updateTimeSlot,
      updateSessionType,
      updateNotes,
      resetSchedule
    }}>
      {children}
    </ScheduleConfigContext.Provider>
  );
}

export const useScheduleConfig = () => {
  const context = useContext(ScheduleConfigContext);
  if (!context) {
    throw new Error('useScheduleConfig must be used within ScheduleConfigProvider');
  }
  return context;
};



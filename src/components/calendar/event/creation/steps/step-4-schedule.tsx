'use client';

import React from 'react';
import { RecurrenceScheduler } from '../reccurence-scheduler';
import { RecurrenceConfig } from '@/models/Calendar';
import { useScheduleConfig } from '@/providers/workout-assignment/schedule-config.context';

export function Step4ConfigureSchedule() {
  const { state, updateRecurrence } = useScheduleConfig();

  const handleChange = (config: RecurrenceConfig) => {
    // Simple state update - no syncing, no loops
    updateRecurrence(config);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Configure Schedule</h3>
      
      <RecurrenceScheduler
        initialConfig={state.recurrenceConfig}
        onChange={handleChange}
        defaultStartDate={state.recurrenceConfig.startDate || new Date()}
        showPreview={true}
        enabledPatterns={['weekly', 'none']}
      />
    </div>
  );
}

import React, { useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Check, AlertCircle, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleStepProps } from '../work-assignment-types';
import { getTimePresets, getDaysOfWeek, getWeekdayShortcuts } from '../work-assignment-utils';
import { RecurrenceScheduler } from '../reccurence-scheduler';
import { RecurrenceConfig } from '@/models/Calendar';
import { useWorkoutEventCreation } from '@/providers/event-creation-context';

export function Step4ConfigureSchedule({
  assignmentData,
  onAssignmentDataChange
}: ScheduleStepProps) {
  const { eventCreationData, updateRecurrence } = useWorkoutEventCreation();

  // Get recurrence configuration from context
  const contextRecurrence = eventCreationData.eventData.recurrence;

  // Create initial configuration from context data
  const initialConfig = useMemo((): RecurrenceConfig => {
    if (contextRecurrence) {
      return {
        pattern: contextRecurrence.pattern || 'weekly',
        interval: contextRecurrence.interval || 1,
        startDate: contextRecurrence.startDate || new Date(),
        daysOfWeek: contextRecurrence.daysOfWeek || [],
        weekOfMonth: contextRecurrence.weekOfMonth,
        dayOfMonth: contextRecurrence.dayOfMonth,
        endDate: contextRecurrence.endDate,
        occurrences: contextRecurrence.occurrences,
        exceptions: contextRecurrence.exceptions
      };
    }

    // Fallback to assignment data if no context data
    return {
      pattern: 'weekly',
      interval: 1,
      startDate: assignmentData.scheduleConfig.startDate,
      daysOfWeek: assignmentData.scheduleConfig.daysOfWeek,
      occurrences: assignmentData.scheduleConfig.numberOfWeeks * assignmentData.scheduleConfig.daysOfWeek.length,
      endDate: assignmentData.scheduleConfig.endDate
    };
  }, [contextRecurrence, assignmentData.scheduleConfig]);
  // const { short: daysOfWeek, full: fullDaysOfWeek } = getDaysOfWeek();
  // const timePresets = getTimePresets();
  // const shortcuts = getWeekdayShortcuts();

  // const handleDayToggle = (dayIndex: number) => {
  //   const newDays = assignmentData.scheduleConfig.daysOfWeek.includes(dayIndex)
  //     ? assignmentData.scheduleConfig.daysOfWeek.filter(d => d !== dayIndex)
  //     : [...assignmentData.scheduleConfig.daysOfWeek, dayIndex].sort();

  //   onAssignmentDataChange({
  //     scheduleConfig: {
  //       ...assignmentData.scheduleConfig,
  //       daysOfWeek: newDays
  //     }
  //   });
  // };

  // const handleWeekdaysShortcut = () => {
  //   onAssignmentDataChange({
  //     scheduleConfig: {
  //       ...assignmentData.scheduleConfig,
  //       daysOfWeek: shortcuts.weekdays
  //     }
  //   });
  // };

  // const handleWeekendShortcut = () => {
  //   onAssignmentDataChange({
  //     scheduleConfig: {
  //       ...assignmentData.scheduleConfig,
  //       daysOfWeek: shortcuts.weekend
  //     }
  //   });
  // };

  // const handleAllDaysShortcut = () => {
  //   onAssignmentDataChange({
  //     scheduleConfig: {
  //       ...assignmentData.scheduleConfig,
  //       daysOfWeek: shortcuts.allDays
  //     }
  //   });
  // };

  // const handleTimePreset = (preset: 'morning' | 'afternoon' | 'evening') => {
  //   const presetTimes = timePresets[preset];
  //   onAssignmentDataChange({
  //     scheduleConfig: {
  //       ...assignmentData.scheduleConfig,
  //       defaultStartTime: presetTimes.start,
  //       defaultEndTime: presetTimes.end
  //     }
  //   });
  // };

  // const handleWeeksChange = (weeks: number) => {
  //   const newWeeks = Math.max(1, Math.min(52, weeks));
  //   const newEndDate = new Date(assignmentData.scheduleConfig.startDate);
  //   newEndDate.setDate(newEndDate.getDate() + (newWeeks * 7));

  //   onAssignmentDataChange({
  //     scheduleConfig: {
  //       ...assignmentData.scheduleConfig,
  //       numberOfWeeks: newWeeks,
  //       endDate: newEndDate
  //     }
  //   });
  // };

  // const handleStartDateChange = (date: Date) => {
  //   const newEndDate = new Date(date);
  //   newEndDate.setDate(newEndDate.getDate() + assignmentData.scheduleConfig.numberOfWeeks * 7);

  //   onAssignmentDataChange({
  //     scheduleConfig: {
  //       ...assignmentData.scheduleConfig,
  //       startDate: date,
  //       endDate: newEndDate
  //     }
  //   });
  // };

  // return (
  //   <div className="space-y-6">
  //     <Card>
  //       <CardHeader>
  //         <CardTitle className="flex items-center gap-2 text-base">
  //           <Calendar className="h-4 w-4" />
  //           Schedule Configuration
  //         </CardTitle>
  //       </CardHeader>
  //       <CardContent className="space-y-6">
  //         {/* Days of Week */}
  //         <div>
  //           <div className="flex items-center justify-between mb-3">
  //             <Label className="text-sm font-medium">Days of Week</Label>
  //             <div className="flex gap-2">
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={handleWeekdaysShortcut}
  //                 className="text-xs h-7"
  //               >
  //                 Weekdays
  //               </Button>
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={handleWeekendShortcut}
  //                 className="text-xs h-7"
  //               >
  //                 Weekend
  //               </Button>
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={handleAllDaysShortcut}
  //                 className="text-xs h-7"
  //               >
  //                 All Days
  //               </Button>
  //             </div>
  //           </div>
  //           <div className="grid grid-cols-7 gap-2">
  //             {daysOfWeek.map((day, index) => {
  //               const isSelected = assignmentData.scheduleConfig.daysOfWeek.includes(index);
  //               return (
  //                 <Button
  //                   key={index}
  //                   variant={isSelected ? "primary" : "outline"}
  //                   size="lg"
  //                   onClick={() => handleDayToggle(index)}
  //                   className={cn(
  //                     "h-12 flex flex-col items-center justify-center",
  //                     isSelected && "ring-2 ring-primary ring-offset-2"
  //                   )}
  //                 >
  //                   {isSelected && <Check className="h-3 w-3 mb-0.5" />}
  //                   <span className="text-xs font-medium">{day}</span>
  //                 </Button>
  //               );
  //             })}
  //           </div>
  //           {assignmentData.scheduleConfig.daysOfWeek.length > 0 && (
  //             <p className="text-xs text-muted-foreground mt-2">
  //               Selected: {assignmentData.scheduleConfig.daysOfWeek.map(i => fullDaysOfWeek[i]).join(', ')}
  //             </p>
  //           )}
  //         </div>

  //         {/* Number of Weeks */}
  //         <div>
  //           <Label className="text-sm font-medium mb-2 block">Duration (Weeks)</Label>
  //           <div className="flex items-center gap-3">
  //             <Button
  //               variant="outline"
  //               size="icon"
  //               onClick={() => handleWeeksChange(assignmentData.scheduleConfig.numberOfWeeks - 1)}
  //               disabled={assignmentData.scheduleConfig.numberOfWeeks <= 1}
  //             >
  //               <Minus className="h-4 w-4" />
  //             </Button>
  //             <div className="flex-1 text-center">
  //               <div className="text-2xl font-bold">{assignmentData.scheduleConfig.numberOfWeeks}</div>
  //               <div className="text-xs text-muted-foreground">
  //                 {assignmentData.scheduleConfig.numberOfWeeks === 1 ? 'week' : 'weeks'}
  //               </div>
  //             </div>
  //             <Button
  //               variant="outline"
  //               size="icon"
  //               onClick={() => handleWeeksChange(assignmentData.scheduleConfig.numberOfWeeks + 1)}
  //               disabled={assignmentData.scheduleConfig.numberOfWeeks >= 52}
  //             >
  //               <Plus className="h-4 w-4" />
  //             </Button>
  //           </div>
  //           <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
  //             <div 
  //               className="h-full bg-primary transition-all"
  //               style={{ width: `${(assignmentData.scheduleConfig.numberOfWeeks / 52) * 100}%` }}
  //             />
  //           </div>
  //           <p className="text-xs text-muted-foreground mt-2">
  //             {assignmentData.scheduleConfig.daysOfWeek.length > 0 && (
  //               <>Total: {assignmentData.scheduleConfig.numberOfWeeks * assignmentData.scheduleConfig.daysOfWeek.length} sessions</>
  //             )}
  //           </p>
  //         </div>

  //         {/* Date Range */}
  //         <div className="grid grid-cols-2 gap-4">
  //           <div>
  //             <Label className="text-sm font-medium mb-2 block">Start Date</Label>
  //             <Input
  //               type="date"
  //               value={assignmentData.scheduleConfig.startDate.toISOString().split('T')[0]}
  //               onChange={(e) => handleStartDateChange(new Date(e.target.value))}
  //             />
  //           </div>
  //           <div>
  //             <Label className="text-sm font-medium mb-2 block">End Date</Label>
  //             <Input
  //               type="date"
  //               value={assignmentData.scheduleConfig.endDate.toISOString().split('T')[0]}
  //               disabled
  //               className="bg-muted"
  //             />
  //           </div>
  //         </div>

  //         {/* Time Configuration */}
  //         <div>
  //           <div className="flex items-center justify-between mb-3">
  //             <Label className="text-sm font-medium">Default Time</Label>
  //             <div className="flex gap-2">
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={() => handleTimePreset('morning')}
  //                 className="text-xs h-7"
  //               >
  //                 Morning
  //               </Button>
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={() => handleTimePreset('afternoon')}
  //                 className="text-xs h-7"
  //               >
  //                 Afternoon
  //               </Button>
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={() => handleTimePreset('evening')}
  //                 className="text-xs h-7"
  //               >
  //                 Evening
  //               </Button>
  //             </div>
  //           </div>
  //           <div className="grid grid-cols-2 gap-4">
  //             <div>
  //               <Label className="text-xs text-muted-foreground mb-1 block">Start Time</Label>
  //               <Input
  //                 type="time"
  //                 value={assignmentData.scheduleConfig.defaultStartTime}
  //                 onChange={(e) => 
  //                   onAssignmentDataChange({
  //                     scheduleConfig: {
  //                       ...assignmentData.scheduleConfig,
  //                       defaultStartTime: e.target.value
  //                     }
  //                   })
  //                 }
  //               />
  //             </div>
  //             <div>
  //               <Label className="text-xs text-muted-foreground mb-1 block">End Time</Label>
  //               <Input
  //                 type="time"
  //                 value={assignmentData.scheduleConfig.defaultEndTime}
  //                 onChange={(e) => 
  //                   onAssignmentDataChange({
  //                     scheduleConfig: {
  //                       ...assignmentData.scheduleConfig,
  //                       defaultEndTime: e.target.value
  //                     }
  //                   })
  //                 }
  //               />
  //             </div>
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>

  //     {/* Validation Message */}
  //     {assignmentData.scheduleConfig.daysOfWeek.length === 0 && (
  //       <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-900 dark:text-amber-200 text-sm">
  //         <AlertCircle className="h-4 w-4 flex-shrink-0" />
  //         <p>Please select at least one day of the week to continue</p>
  //       </div>
  //     )}
  //   </div>
  // );

  const lastConfigRef = useRef<RecurrenceConfig | null>(null);

  const handleChange = useCallback((config: RecurrenceConfig) => {
    // Prevent infinite loops by checking if this is the same config
    if (lastConfigRef.current && 
        JSON.stringify(lastConfigRef.current) === JSON.stringify(config)) {
      return;
    }
    
    lastConfigRef.current = config;
    
    // Update the context with the new recurrence configuration
    updateRecurrence(config);
    
    // Also update the assignment data for backward compatibility
    onAssignmentDataChange({
      scheduleConfig: {
        ...assignmentData.scheduleConfig,
        startDate: config.startDate || assignmentData.scheduleConfig.startDate,
        daysOfWeek: config.daysOfWeek || [],
        numberOfWeeks: config.occurrences ? Math.ceil(config.occurrences / (config.daysOfWeek?.length || 1)) : 1,
        endDate: config.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  }, [assignmentData.scheduleConfig, onAssignmentDataChange, updateRecurrence]);

  return (
    <RecurrenceScheduler
      initialConfig={initialConfig}
      onChange={handleChange}
      defaultStartDate={assignmentData.scheduleConfig.startDate}
      showPreview={true}
      enabledPatterns={['weekly', 'none']}
    />
  )
}


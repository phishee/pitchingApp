'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Check,
  Calendar,
  User,
  Dumbbell,
  Settings
} from 'lucide-react';
import { useAthleteSelection } from '@/providers/workout-assignment/athlete-selection.context';
import { useWorkoutSelection } from '@/providers/workout-assignment/workout-selection.context';
import { useExercisePrescription } from '@/providers/workout-assignment/exercise-prescription.context';
import { useScheduleConfig } from '@/providers/workout-assignment/schedule-config.context';

const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function Step5ReviewCustomize() {
  const { state: athleteState } = useAthleteSelection();
  const { state: workoutState } = useWorkoutSelection();
  const { state: prescriptionState } = useExercisePrescription();
  const { state: scheduleState, updateSessionType, updateNotes } = useScheduleConfig();

  // Calculate total events
  const totalEvents = useMemo(() => {
    const athleteCount = athleteState.selectedAthletes.length;
    
    if (scheduleState.recurrenceConfig.pattern === 'none') {
      return athleteCount;
    }

    const occurrences = scheduleState.recurrenceConfig.occurrences || 12;
    return athleteCount * occurrences;
  }, [athleteState.selectedAthletes.length, scheduleState.recurrenceConfig]);

  // Count modified exercises
  const modifiedExercisesCount = useMemo(() => {
    return Object.values(prescriptionState.prescriptions).filter(p => p.isModified).length;
  }, [prescriptionState.prescriptions]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Review & Customize</h3>
      
      {/* Assignment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Check className="h-4 w-4" />
            Assignment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Athletes Summary */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Athletes ({athleteState.selectedAthletes.length})
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {athleteState.selectedAthletes.map((athlete, index) => (
                <Badge key={athlete.userId || index} variant="secondary" className="px-3 py-1">
                  <User className="h-3 w-3 mr-1" />
                  Athlete {index + 1}
                </Badge>
              ))}
            </div>
          </div>

          {/* Workout Summary */}
          {workoutState.selectedWorkout && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Workout</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Dumbbell className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">{workoutState.selectedWorkout.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workoutState.selectedWorkout.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {workoutState.selectedWorkout.flow.exercises.length} exercises
                      </Badge>
                      {modifiedExercisesCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {modifiedExercisesCount} customized
                        </Badge>
                      )}
                      {workoutState.selectedWorkout.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Summary */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Schedule</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Pattern</div>
                <div className="text-sm font-medium capitalize">
                  {scheduleState.recurrenceConfig.pattern === 'none' ? 'One-time' :
                    scheduleState.recurrenceConfig.pattern}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Days</div>
                <div className="text-sm font-medium">
                  {scheduleState.recurrenceConfig.daysOfWeek && scheduleState.recurrenceConfig.daysOfWeek.length > 0
                    ? scheduleState.recurrenceConfig.daysOfWeek.map(i => fullDaysOfWeek[i]).join(', ')
                    : 'All days'}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                <div className="text-sm font-medium">
                  {scheduleState.recurrenceConfig.startDate?.toLocaleDateString() || 'Not set'}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Occurrences</div>
                <div className="text-sm font-medium">
                  {scheduleState.recurrenceConfig.occurrences || 'Until end date'}
                </div>
              </div>
            </div>
          </div>

          {/* Total Events */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">
                  {totalEvents} Calendar Events
                </div>
                <div className="text-sm text-muted-foreground">
                  Will be created for {athleteState.selectedAthletes.length}{' '}
                  {athleteState.selectedAthletes.length === 1 ? 'athlete' : 'athletes'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Session Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Type */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Session Type</Label>
            <Select
              value={scheduleState.sessionType}
              onValueChange={(value: 'individual' | 'coached') => updateSessionType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Session</SelectItem>
                <SelectItem value="coached">Coached Session</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {scheduleState.sessionType === 'individual'
                ? 'Athletes complete the workout independently'
                : 'Sessions will be scheduled with a coach'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Notes</Label>
            <Textarea
              value={scheduleState.notes}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="Add any additional notes or instructions for these workout sessions..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



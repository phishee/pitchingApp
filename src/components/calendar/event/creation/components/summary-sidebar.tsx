import React from 'react';
import { Check, Calendar, Info, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { WorkoutAssignmentData, WizardStep } from '../work-assignment-types';

interface SummarySidebarProps {
  assignmentData: WorkoutAssignmentData;
  totalEvents: number;
  currentStep: WizardStep;
}

export function SummarySidebar({
  assignmentData,
  totalEvents,
  currentStep
}: SummarySidebarProps) {
  const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <aside className="w-80 flex-shrink-0 hidden lg:block">
      <div className="sticky top-4 border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Summary
        </h3>
        
        <div className="space-y-4">
          {/* Athletes */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">ATHLETES</Label>
            {assignmentData.selectedMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">None selected</p>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {assignmentData.selectedMembers.length} {assignmentData.selectedMembers.length === 1 ? 'athlete' : 'athletes'} selected
                </p>
                <div className="flex flex-wrap gap-1">
                  {assignmentData.selectedMembers.slice(0, 3).map(member => {
                    const userName = ('user' in member && member.user?.name) || 'Unknown';
                    return (
                      <Badge key={member._id} variant="secondary" className="text-xs">
                        {userName.split(' ')[0]}
                      </Badge>
                    );
                  })}
                  {assignmentData.selectedMembers.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{assignmentData.selectedMembers.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t" />

        {/* Workout */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">WORKOUT</Label>
          {assignmentData.selectedWorkout ? (
            <div>
              <p className="text-sm font-medium">{assignmentData.selectedWorkout.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {assignmentData.selectedWorkout.flow.exercises.length} exercises
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Not selected</p>
          )}
        </div>

        <div className="border-t" />

        {/* Schedule */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">SCHEDULE</Label>
          {assignmentData.scheduleConfig.daysOfWeek.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Not configured</p>
          ) : (
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">
                  {assignmentData.scheduleConfig.daysOfWeek.map(i => 
                    fullDaysOfWeek[i].slice(0, 3)
                  ).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {assignmentData.scheduleConfig.numberOfWeeks} {assignmentData.scheduleConfig.numberOfWeeks === 1 ? 'week' : 'weeks'}
                </p>
              </div>
              <div className="text-xs">
                <p className="text-muted-foreground">
                  {assignmentData.scheduleConfig.startDate.toLocaleDateString()} - {assignmentData.scheduleConfig.endDate.toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">
                  {assignmentData.scheduleConfig.defaultStartTime} - {assignmentData.scheduleConfig.defaultEndTime}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t" />

        {/* Total Events */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">TOTAL EVENTS</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-lg font-bold">{totalEvents}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Calendar events will be created
          </p>
        </div>

        {/* Progress Checklist */}
        {currentStep !== 'review' && (
          <>
            <div className="border-t" />
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">PROGRESS</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0",
                    assignmentData.selectedMembers.length > 0 
                      ? "bg-green-500 border-green-500 text-white" 
                      : "border-muted"
                  )}>
                    {assignmentData.selectedMembers.length > 0 && <Check className="h-3 w-3" />}
                  </div>
                  <span className={assignmentData.selectedMembers.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                    Athletes selected
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0",
                    assignmentData.selectedWorkout 
                      ? "bg-green-500 border-green-500 text-white" 
                      : "border-muted"
                  )}>
                    {assignmentData.selectedWorkout && <Check className="h-3 w-3" />}
                  </div>
                  <span className={assignmentData.selectedWorkout ? "text-foreground" : "text-muted-foreground"}>
                    Workout selected
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0",
                    assignmentData.scheduleConfig.daysOfWeek.length > 0 
                      ? "bg-green-500 border-green-500 text-white" 
                      : "border-muted"
                  )}>
                    {assignmentData.scheduleConfig.daysOfWeek.length > 0 && <Check className="h-3 w-3" />}
                  </div>
                  <span className={assignmentData.scheduleConfig.daysOfWeek.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                    Schedule configured
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

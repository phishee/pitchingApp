import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Check, 
  Calendar, 
  Settings, 
  Activity, 
  ChevronDown, 
  ChevronRight, 
  User, 
  Users 
} from 'lucide-react';
import { ReviewStepProps } from '../work-assignment-types';
import { CalendarPreview } from "../components/calendar-preview";
import { ExercisePrescriptionCard } from "../components/exercise-prescription-card";

export function Step4ReviewCustomize({
  assignmentData,
  onAssignmentDataChange,
  exercisePrescriptions,
  isLoadingExercises,
  isAdvancedExpanded,
  onToggleAdvanced,
  onPrescriptionToggle,
  onMetricChange,
  totalEvents
}: ReviewStepProps) {
  const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
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
            <Label className="text-sm font-medium text-muted-foreground">Athletes ({assignmentData.selectedMembers.length})</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {assignmentData.selectedMembers.map(member => {
                const userName = ('user' in member && member.user?.name) || 'Unknown User';
                return (
                  <Badge key={member._id} variant="secondary" className="px-3 py-1">
                    <User className="h-3 w-3 mr-1" />
                    {userName}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Workout Summary */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Workout</Label>
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{assignmentData.selectedWorkout?.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assignmentData.selectedWorkout?.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {assignmentData.selectedWorkout?.flow.exercises.length} exercises
                    </Badge>
                    {assignmentData.selectedWorkout?.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Summary */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Schedule</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Days</div>
                <div className="text-sm font-medium">
                  {assignmentData.scheduleConfig.daysOfWeek.map(i => fullDaysOfWeek[i]).join(', ')}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="text-sm font-medium">
                  {assignmentData.scheduleConfig.numberOfWeeks} {assignmentData.scheduleConfig.numberOfWeeks === 1 ? 'week' : 'weeks'}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                <div className="text-sm font-medium">
                  {assignmentData.scheduleConfig.startDate.toLocaleDateString()}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Time</div>
                <div className="text-sm font-medium">
                  {assignmentData.scheduleConfig.defaultStartTime} - {assignmentData.scheduleConfig.defaultEndTime}
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
                  Will be created for {assignmentData.selectedMembers.length} {assignmentData.selectedMembers.length === 1 ? 'athlete' : 'athletes'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Preview */}
      {/* <CalendarPreview
        scheduleConfig={assignmentData.scheduleConfig}
        totalEvents={totalEvents}
      /> */}

      {/* Session Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Session Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Session Type</Label>
            <Select 
              value={assignmentData.sessionType} 
              onValueChange={(sessionType: 'individual' | 'coached') => 
                onAssignmentDataChange({ sessionType })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Individual</div>
                      <div className="text-xs text-muted-foreground">Athletes complete on their own</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="coached">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Coached</div>
                      <div className="text-xs text-muted-foreground">Requires coach supervision</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Notes (Optional)</Label>
            <Textarea
              value={assignmentData.notes}
              onChange={(e) => onAssignmentDataChange({ notes: e.target.value })}
              placeholder="Add any additional instructions or notes for these workout sessions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced: Exercise Prescriptions */}
      <Card>
        <CardHeader>
          <button
            onClick={onToggleAdvanced}
            className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
          >
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Advanced: Exercise Prescriptions
              <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
            </CardTitle>
            {isAdvancedExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        {isAdvancedExpanded && (
          <CardContent>
            {isLoadingExercises ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading exercises...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Customize specific metrics for each exercise. By default, exercises use their standard metrics.
                </p>
                {exercisePrescriptions.map((prescription) => (
                  <ExercisePrescriptionCard
                    key={prescription.exerciseId}
                    prescription={prescription}
                    onPrescriptionToggle={onPrescriptionToggle}
                    onMetricChange={onMetricChange}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}



import React, { useState, useEffect, useMemo } from 'react';
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
// import { ExercisePrescriptionCard } from "../components/exercise-prescription-card";
import { useWorkoutEventCreation } from '@/providers/event-creation-context';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { Exercise, WorkoutEventDetails } from '@/models';

export function Step5ReviewCustomize({
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
  const {
    eventCreationData,
    updateWorkoutDetails,
    updateExercisePrescription,
    buildCompleteEventData
  } = useWorkoutEventCreation();

  // Local state for review step
  const [isAdvancedExpandedLocal, setIsAdvancedExpandedLocal] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercisesLocal, setIsLoadingExercisesLocal] = useState(false);

  const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get current data from context
  const workoutDetails = eventCreationData.eventData.details as Partial<WorkoutEventDetails>;
  const selectedAthletes = eventCreationData.targetAthletes || eventCreationData.eventData.participants?.athletes || [];
  const recurrence = eventCreationData.eventData.recurrence;

  // Calculate total events based on recurrence
  const calculatedTotalEvents = useMemo(() => {
    if (!recurrence || recurrence.pattern === 'none') {
      return selectedAthletes.length;
    }

    // Calculate based on recurrence pattern and selected athletes
    // This is a simplified calculation - you might want to use the actual recurrence calculation
    const daysCount = recurrence.daysOfWeek?.length || 1;
    const weeksCount = recurrence.occurrences ? Math.ceil(recurrence.occurrences / daysCount) : 4;
    return daysCount * weeksCount * selectedAthletes.length;
  }, [recurrence, selectedAthletes]);

  // Load exercise details when workout is selected
  useEffect(() => {
    const loadExercises = async () => {
      if (workoutDetails?.workoutId && workoutDetails.exercisePrescriptions) {
        setIsLoadingExercisesLocal(true);
        try {
          const exerciseIds = Object.keys(workoutDetails.exercisePrescriptions);
          const exerciseData = await exerciseApi.getExercisesByIds(exerciseIds);
          setExercises(exerciseData);
        } catch (error) {
          console.error('Failed to load exercises:', error);
          setExercises([]);
        } finally {
          setIsLoadingExercisesLocal(false);
        }
      }
    };

    loadExercises();
  }, [workoutDetails?.workoutId, workoutDetails?.exercisePrescriptions]);

  // Handle session type change
  const handleSessionTypeChange = (sessionType: 'individual' | 'coached') => {
    const mappedSessionType = sessionType === 'coached' ? 'individual' : sessionType;
    updateWorkoutDetails({
      sessionType: mappedSessionType
    });

    // Also update assignment data for backward compatibility
    onAssignmentDataChange({ sessionType });
  };

  // Handle notes change
  const handleNotesChange = (notes: string) => {
    updateWorkoutDetails({ notes });

    // Also update assignment data for backward compatibility
    onAssignmentDataChange({ notes });
  };

  // Handle exercise prescription toggle
  const handlePrescriptionToggle = (exerciseId: string) => {
    const currentPrescriptions = workoutDetails?.exercisePrescriptions || {};
    const currentPrescription = currentPrescriptions[exerciseId];

    if (currentPrescription) {
      updateExercisePrescription(exerciseId, {
        prescribedMetrics: currentPrescription.prescribedMetrics,
        notes: currentPrescription.notes || ''
      });
    }

    // Also call the original handler for backward compatibility
    onPrescriptionToggle(exerciseId);
  };

  // Handle metric change
  const handleMetricChange = (exerciseId: string, metricId: string, value: any) => {
    const currentPrescriptions = workoutDetails?.exercisePrescriptions || {};
    const currentPrescription = currentPrescriptions[exerciseId];

    if (currentPrescription) {
      updateExercisePrescription(exerciseId, {
        prescribedMetrics: {
          ...currentPrescription.prescribedMetrics,
          [metricId]: value
        },
        notes: currentPrescription.notes || ''
      });
    }

    // Also call the original handler for backward compatibility
    onMetricChange(exerciseId, metricId, value);
  };

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
            <Label className="text-sm font-medium text-muted-foreground">Athletes ({selectedAthletes.length})</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedAthletes.map((athlete, index) => (
                <Badge key={athlete.userId || index} variant="secondary" className="px-3 py-1">
                  <User className="h-3 w-3 mr-1" />
                  {athlete.userId}
                </Badge>
              ))}
            </div>
          </div>

          {/* Workout Summary */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Workout</Label>
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{assignmentData.selectedWorkout?.name || 'Workout Selected'}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assignmentData.selectedWorkout?.description || 'Workout details from context'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(workoutDetails?.exercisePrescriptions || {}).length} exercises
                    </Badge>
                    {assignmentData.selectedWorkout?.tags?.slice(0, 3).map(tag => (
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
                <div className="text-xs text-muted-foreground mb-1">Pattern</div>
                <div className="text-sm font-medium">
                  {recurrence?.pattern === 'none' ? 'One-time' :
                    recurrence?.pattern === 'daily' ? 'Daily' :
                      recurrence?.pattern === 'weekly' ? 'Weekly' :
                        recurrence?.pattern === 'monthly' ? 'Monthly' : 'Custom'}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Days</div>
                <div className="text-sm font-medium">
                  {recurrence?.daysOfWeek?.map(i => fullDaysOfWeek[i]).join(', ') || 'All days'}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                <div className="text-sm font-medium">
                  {recurrence?.startDate?.toLocaleDateString() || 'Not set'}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Occurrences</div>
                <div className="text-sm font-medium">
                  {recurrence?.occurrences || 'Until end date'}
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
                  {calculatedTotalEvents} Calendar Events
                </div>
                <div className="text-sm text-muted-foreground">
                  Will be created for {selectedAthletes.length} {selectedAthletes.length === 1 ? 'athlete' : 'athletes'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



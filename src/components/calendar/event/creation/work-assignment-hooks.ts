import { useState, useEffect, useCallback, useMemo } from 'react';
import { Workout, TeamMemberWithUser } from '@/models';
import { workoutApi } from '@/app/services-client/workoutApi';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { WorkoutAssignmentData, ExerciseMetricPrescription } from './work-assignment-types';

export const useWorkoutAssignment = (
  initialSelectedMembers: TeamMemberWithUser[],
  organizationId: string
) => {
  const [assignmentData, setAssignmentData] = useState<WorkoutAssignmentData>({
    selectedMembers: initialSelectedMembers,
    selectedWorkout: null,
    scheduleConfig: {
      daysOfWeek: [],
      numberOfWeeks: 4,
      startDate: new Date(),
      endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      defaultStartTime: '14:00',
      defaultEndTime: '16:00'
    },
    exercisePrescriptions: {},
    sessionType: 'individual',
    notes: ''
  });

  const updateAssignmentData = useCallback((updates: Partial<WorkoutAssignmentData>) => {
    setAssignmentData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    assignmentData,
    updateAssignmentData,
    setAssignmentData
  };
};

export const useWorkouts = (organizationId: string, isOpen: boolean) => {
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);

  const loadWorkouts = useCallback(async () => {
    setIsLoadingWorkouts(true);
    try {
      const response = await workoutApi.getWorkouts({}, organizationId);
      setAvailableWorkouts(response.data);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoadingWorkouts(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (isOpen) {
      loadWorkouts();
    }
  }, [isOpen, loadWorkouts]);

  return {
    availableWorkouts,
    isLoadingWorkouts,
    loadWorkouts
  };
};

export const useExercisePrescriptions = (selectedWorkout: Workout | null) => {
  const [exercisePrescriptions, setExercisePrescriptions] = useState<ExerciseMetricPrescription[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);

  const loadExercisePrescriptions = useCallback(async (workout: Workout) => {
    setIsLoadingExercises(true);
    try {
      const exerciseIds = workout.flow.exercises.map(ex => ex.exercise_id);
      const exercises = await Promise.all(
        exerciseIds.map(id => exerciseApi.getExerciseById(id))
      );

      const prescriptions: ExerciseMetricPrescription[] = exercises.map((exercise, index) => {
        const workoutExercise = workout.flow.exercises[index];
        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          isPrescribed: false,
          defaultMetrics: workoutExercise.default_Metrics,
          prescribedMetrics: { ...workoutExercise.default_Metrics },
          exercise
        };
      });

      setExercisePrescriptions(prescriptions);
      return prescriptions;
    } catch (error) {
      console.error('Failed to load exercise prescriptions:', error);
      return [];
    } finally {
      setIsLoadingExercises(false);
    }
  }, []);

  useEffect(() => {
    if (selectedWorkout) {
      loadExercisePrescriptions(selectedWorkout);
    }
  }, [selectedWorkout, loadExercisePrescriptions]);

  return {
    exercisePrescriptions,
    isLoadingExercises,
    loadExercisePrescriptions,
    setExercisePrescriptions
  };
};

export const useMemberSearch = (availableMembers: TeamMemberWithUser[], searchQuery: string) => {
  const filteredMembers = useMemo(() => {
    return availableMembers.filter(member => {
      const matchesSearch = searchQuery === '' || 
        (('user' in member && member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
         ('user' in member && member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    }).sort((a, b) => {
      const nameA = ('user' in a && a.user?.name) || '';
      const nameB = ('user' in b && b.user?.name) || '';
      return nameA.localeCompare(nameB);
    });
  }, [availableMembers, searchQuery]);

  return { filteredMembers };
};

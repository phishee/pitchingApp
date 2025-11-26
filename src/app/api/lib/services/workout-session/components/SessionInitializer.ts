import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import {
  ISessionInitializer,
  SessionInitializationInput,
} from '../interfaces/IWorkoutSessionService';
import {
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSessionSet,
  WorkoutSessionStep,
} from '@/models/WorkoutSession';

@injectable()
export class SessionInitializer implements ISessionInitializer {
  async initialize(input: SessionInitializationInput): Promise<WorkoutSession> {
    const {
      sessionData,
      resolvedPrescriptions,
      athleteUserId,
      calendarEventId,
    } = input;

    const { assignment, workout, exercises, athlete, coach, event } = sessionData;

    const sessionExercises: WorkoutSessionExercise[] =
      workout.flow?.exercises?.map((workoutExercise: any) => {
        const exerciseId = workoutExercise.exercise_id;
        const exercise = exercises.find((item: any) => {
          const sourceId = item?.id?.toString?.() ?? item?.id;
          return sourceId === exerciseId;
        });

        if (!exercise) {
          throw new Error(`Exercise not found: ${exerciseId}`);
        }

        const prescription = resolvedPrescriptions.find(
          (resolved) => resolved.exerciseId === exerciseId
        );

        const sets: WorkoutSessionSet[] =
          prescription?.sets.map((set) => ({
            setNumber: set.setNumber,
            status: 'pending',
            prescribed: set.prescribed,
          })) ?? [];

        return {
          exerciseId,
          exerciseName: exercise.name,
          exerciseType: exercise.exercise_type,
          exerciseImage: exercise.image ?? exercise.photoCover,
          sets,
          summary: {
            totalSets: sets.length,
            completedSets: 0,
            compliancePercent: 0,
            totalVolumeLifted: undefined,
          },
        };
      }) ?? [];

    const totalSets = sessionExercises.reduce(
      (accumulator, exercise) => accumulator + exercise.sets.length,
      0
    );

    const now = new Date();
    const initialStep = this.getInitialStep(workout);

    const workoutSession: WorkoutSession = {
      _id: new ObjectId().toString(),
      organizationId: assignment.organizationId,
      teamId: assignment.teamId,
      workoutAssignmentId: assignment._id?.toString?.() ?? assignment._id,
      calendarEventId,
      workoutId: workout.id,
      athleteInfo: {
        userId: assignment.athleteInfo?.userId ?? athlete.userId,
        memberId: assignment.athleteInfo?.memberId,
        name: athlete.name,
        email: athlete.email,
        profileImageUrl: athlete.profileImageUrl,
      },
      coachInfo: coach
        ? {
          userId: coach.userId,
          memberId: assignment.coachInfo?.memberId,
          name: coach.name,
        }
        : undefined,
      workout: {
        workoutId: workout.id,
        name: workout.name,
        description: workout.description,
        coverImage: workout.coverImage,
        tags: workout.tags ?? [],
        rpe: workout.flow?.rpe,
        flow: workout.flow,
      },
      scheduledDate: new Date(event.startTime),
      actualStartTime: now,
      status: 'in_progress',
      exercises: sessionExercises,
      summary: {
        totalExercises: sessionExercises.length,
        completedExercises: 0,
        totalSets,
        completedSets: 0,
        compliancePercent: 0,
        totalVolumeLifted: undefined,
        averageIntensityPercent: undefined,
        sessionRPE: 0,
        averageExerciseRPE: 0,
      },
      flags: {
        highRPE: false,
        lowCompliance: false,
        volumeSpike: false,
        shortRestPeriod: false,
        possibleOvertraining: false,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: {
        userId: athleteUserId,
        role: 'athlete',
      },
      progress: {
        currentStep: initialStep,
        updatedAt: now,
      },
    };

    return workoutSession;
  }

  private getInitialStep(workout: any): WorkoutSessionStep {
    const hasPreQuestionnaire = Array.isArray(workout.flow?.questionnaires) && workout.flow.questionnaires.length > 0;
    return hasPreQuestionnaire ? 'pre_workout_questionnaire' : 'exercises';
  }
}


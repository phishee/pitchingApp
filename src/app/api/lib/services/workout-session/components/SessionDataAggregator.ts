import { inject, injectable } from 'inversify';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { DB_TYPES } from '@/app/api/lib/symbols/Symbols';
import { ISessionDataAggregator, SessionAggregatedData } from '../interfaces/IWorkoutSessionService';
import { NotFoundError } from '../errors/SessionErrors';

@injectable()
export class SessionDataAggregator implements ISessionDataAggregator {
  private readonly eventsCollection = 'events';
  private readonly assignmentsCollection = 'workout_assignments';
  private readonly workoutsCollection = 'workouts';
  private readonly exercisesCollection = 'exercises';
  private readonly usersCollection = 'users';

  constructor(
    @inject(DB_TYPES.MongoDBProvider)
    private readonly mongoProvider: MongoDBProvider
  ) { }

  async aggregateSessionData(calendarEventId: string): Promise<SessionAggregatedData> {
    const event = await this.mongoProvider.findById(this.eventsCollection, calendarEventId);
    if (!event) {
      throw new NotFoundError('Calendar event not found');
    }

    const assignment = await this.mongoProvider.findById(
      this.assignmentsCollection,
      event.sourceId
    );
    if (!assignment) {
      throw new NotFoundError('Workout assignment not found');
    }

    const workout = await this.mongoProvider.findOne(this.workoutsCollection, { id: assignment.workoutId });
    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    const workoutExercises = workout.flow?.exercises ?? [];
    const exerciseIds = workoutExercises.map((exercise: any) => exercise.exercise_id);

    const exercises = await this.mongoProvider.findQuery(this.exercisesCollection, {
      id: { $in: exerciseIds }
    });

    const exerciseMap = new Map(exercises.map((ex: any) => [ex.id, ex]));
    const missingExerciseIds = exerciseIds.filter((id: string) => !exerciseMap.has(id));

    if (missingExerciseIds.length > 0) {
      throw new NotFoundError(`Missing exercises: ${missingExerciseIds.join(', ')}`);
    }

    // Ensure exercises are returned in the same order as the workout flow
    const orderedExercises = exerciseIds.map((id: string) => exerciseMap.get(id));

    const athlete = await this.mongoProvider.findOne(this.usersCollection, {
      userId: assignment.athleteInfo?.userId,
    });
    if (!athlete) {
      throw new NotFoundError('Athlete not found');
    }

    let coach: any | undefined;
    if (assignment.coachInfo?.userId) {
      coach = await this.mongoProvider.findOne(this.usersCollection, {
        userId: assignment.coachInfo.userId,
      });
    }

    return {
      event,
      assignment,
      workout,
      exercises: orderedExercises.filter(Boolean),
      athlete,
      coach: coach ?? undefined,
    };
  }
}


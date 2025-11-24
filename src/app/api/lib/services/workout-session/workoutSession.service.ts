import { inject, injectable } from 'inversify';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { DB_TYPES, WORKOUT_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutSession, WorkoutSessionStep } from '@/models/WorkoutSession';
import type {
  IWorkoutSessionService,
  ISessionValidator,
  ISessionDataAggregator,
  IPrescriptionResolver,
  ISessionInitializer,
  ISessionEventBus,
  ResolvedPrescription,
} from './interfaces/IWorkoutSessionService';
import { ValidationError } from './errors/SessionErrors';

@injectable()
export class WorkoutSessionService implements IWorkoutSessionService {
  private readonly sessionsCollection = 'workout_sessions';
  private readonly eventsCollection = 'events';

  constructor(
    @inject(DB_TYPES.MongoDBProvider)
    private readonly mongoProvider: MongoDBProvider,
    @inject(WORKOUT_SESSION_TYPES.SessionValidator)
    private readonly validator: ISessionValidator,
    @inject(WORKOUT_SESSION_TYPES.SessionDataAggregator)
    private readonly dataAggregator: ISessionDataAggregator,
    @inject(WORKOUT_SESSION_TYPES.PrescriptionResolver)
    private readonly prescriptionResolver: IPrescriptionResolver,
    @inject(WORKOUT_SESSION_TYPES.SessionInitializer)
    private readonly sessionInitializer: ISessionInitializer,
    @inject(WORKOUT_SESSION_TYPES.SessionEventBus)
    private readonly eventBus: ISessionEventBus
  ) { }

  async startSession(calendarEventId: string, athleteUserId: string): Promise<WorkoutSession> {
    return this.mongoProvider.withTransaction(async () => {
      // Step 1: Ensure idempotency by returning an active session if one already exists
      const existingSession = await this.checkForExistingSession(calendarEventId, athleteUserId);
      if (existingSession) {
        return this.normalizeSession(existingSession);
      }

      // Step 2: Validate the athlete can start the requested workout session
      const validationResult = await this.validator.validateCanStart(
        calendarEventId,
        athleteUserId
      );

      if (!validationResult.valid) {
        throw new ValidationError(validationResult.errors);
      }

      // Step 3: Aggregate all data required to instantiate the session (event, assignment, workout, users)
      const sessionData = await this.dataAggregator.aggregateSessionData(calendarEventId);

      // Step 4: Resolve exercise prescriptions using assignment overrides and workout defaults
      const resolvedPrescriptions = this.prescriptionResolver.resolvePrescriptions(
        sessionData.assignment,
        sessionData.workout,
        sessionData.exercises
      );

      // Step 5: Validate the resolved prescriptions include all required metrics
      this.validatePrescriptions(resolvedPrescriptions, sessionData.exercises);

      // Step 6: Initialize an in-memory session payload with sets, status, and metadata
      const initializedSession = await this.sessionInitializer.initialize({
        calendarEventId,
        athleteUserId,
        sessionData,
        resolvedPrescriptions,
      });

      // Step 7: Persist the session document
      const savedSession = await this.mongoProvider.create(
        this.sessionsCollection,
        initializedSession
      );

      // Step 8: Update the calendar event status to in-progress
      await this.mongoProvider.update(this.eventsCollection, calendarEventId, {
        status: 'in_progress',
        updatedAt: new Date(),
      });

      // Step 9: Publish a non-blocking event for downstream consumers (analytics, notifications, etc.)
      this.eventBus.publish('session.started', {
        sessionId: savedSession?._id?.toString?.() ?? savedSession?._id,
        athleteUserId: initializedSession.athleteInfo.userId,
        workoutName: initializedSession.workout.name,
        timestamp: new Date(),
      });

      return this.normalizeSession(savedSession);
    });
  }

  async getActiveSession(athleteUserId: string): Promise<WorkoutSession | null> {
    const session = await this.mongoProvider.findOne(this.sessionsCollection, {
      'athleteInfo.userId': athleteUserId,
      status: 'in_progress',
    });

    return session ? this.normalizeSession(session) : null;
  }

  async getSessionById(sessionId: string): Promise<WorkoutSession | null> {
    const session = await this.mongoProvider.findById(this.sessionsCollection, sessionId);
    return session ? this.normalizeSession(session) : null;
  }

  async getSessionByEventId(calendarEventId: string): Promise<WorkoutSession | null> {
    const session = await this.mongoProvider.findOne(this.sessionsCollection, {
      calendarEventId,
    });

    return session ? this.normalizeSession(session) : null;
  }

  async updateSessionProgress(
    sessionId: string,
    nextStep: WorkoutSessionStep
  ): Promise<WorkoutSession | null> {
    const updated = await this.mongoProvider.update(this.sessionsCollection, sessionId, {
      progress: {
        currentStep: nextStep,
        updatedAt: new Date(),
      },
      updatedAt: new Date(),
    });

    return updated ? this.normalizeSession(updated.value ?? updated) : null;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<WorkoutSession>
  ): Promise<WorkoutSession | null> {
    // Prevent updating immutable fields or critical metadata through this generic method if needed
    // For now, we trust the controller to filter the body
    console.log(`[Service] updateSession called for sessionId: ${sessionId}`);

    const updated = await this.mongoProvider.update(this.sessionsCollection, sessionId, {
      ...updates,
      updatedAt: new Date(),
    });
    console.log(`[Service] updateSession mongo result:`, updated);

    return updated ? this.normalizeSession(updated.value ?? updated) : null;
  }

  private async checkForExistingSession(
    calendarEventId: string,
    athleteUserId: string
  ): Promise<any | null> {
    return this.mongoProvider.findOne(this.sessionsCollection, {
      calendarEventId,
      'athleteInfo.userId': athleteUserId,
      status: 'in_progress',
    });
  }

  private validatePrescriptions(prescriptions: ResolvedPrescription[], exercises: any[]): void {
    prescriptions.forEach((prescription) => {
      const exercise = exercises.find((item: any) => {
        const exerciseId = item?.id || null;
        return exerciseId === prescription.exerciseId;
      });

      if (!exercise) {
        throw new ValidationError([`Exercise not found: ${prescription.exerciseId}`]);
      }

      if (!prescription.sets || prescription.sets.length === 0) {
        throw new ValidationError([`Exercise "${exercise.name}" requires at least one set.`]);
      }

      const allSetsFreeRange = prescription.sets.every(
        (set) => Object.keys(set.prescribed ?? {}).length === 0
      );

      if (allSetsFreeRange) {
        return;
      }

      const requiredMetrics =
        exercise.metrics
          ?.filter((metric: any) => metric.required && metric.input === 'manual')
          ?.map((metric: any) => metric.id) ?? [];

      if (requiredMetrics.length === 0) {
        return;
      }

      //   prescription.sets.forEach((set, index) => {
      //     const prescribedKeys = Object.keys(set.prescribed ?? {});
      //     const missingMetrics = requiredMetrics.filter(
      //       (metricId: string) => !prescribedKeys.includes(metricId)
      //     );

      //     if (missingMetrics.length > 0) {
      //       throw new ValidationError([
      //         `Exercise "${exercise.name}" set ${index + 1} is missing required metrics: ${missingMetrics.join(', ')}`,
      //       ]);
      //     }
      //   });
    });
  }

  private normalizeSession(session: any): WorkoutSession {
    if (!session) {
      return session;
    }

    const normalized: any = {
      ...session,
      _id: session._id?.toString?.() ?? session._id,
    };

    const normalizeDate = (value: any) => (value instanceof Date ? value : value ? new Date(value) : value);

    normalized.scheduledDate = normalizeDate(normalized.scheduledDate);
    normalized.actualStartTime = normalizeDate(normalized.actualStartTime);
    normalized.actualEndTime = normalizeDate(normalized.actualEndTime);
    normalized.createdAt = normalizeDate(normalized.createdAt);
    normalized.updatedAt = normalizeDate(normalized.updatedAt);

    if (normalized.progress) {
      normalized.progress = {
        ...normalized.progress,
        updatedAt: normalizeDate(normalized.progress.updatedAt),
      };
    }

    return normalized as WorkoutSession;
  }
}


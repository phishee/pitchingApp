import { inject, injectable } from 'inversify';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { DB_TYPES, WORKOUT_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutSession, WorkoutSessionStep, ExerciseSummary } from '@/models/WorkoutSession';
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

  async getWorkoutSessions(filter: { userId: string; organizationId?: string; status?: string; limit?: number }): Promise<{ sessions: WorkoutSession[]; total: number }> {
    const filters: any[] = [
      { field: 'athleteInfo.userId', operator: '$eq', value: filter.userId }
    ];

    if (filter.organizationId) {
      filters.push({ field: 'organizationId', operator: '$eq', value: filter.organizationId });
    }

    if (filter.status) {
      filters.push({ field: 'status', operator: '$eq', value: filter.status });
    }

    const options: any = {
      sort: { completedAt: -1, updatedAt: -1 }, // Most recent first
    };

    if (filter.limit) {
      options.limit = filter.limit;
    }

    const sessions = await this.mongoProvider.findWithFilters(this.sessionsCollection, filters, options);
    // We might want to get total count too, but for now let's just return what we have. 
    // If mongoProvider doesn't support count easily with find, we might skip total or do a separate count.
    // Assuming we just return the array length as total for now if pagination isn't strictly required by the provider interface yet.

    return {
      sessions: sessions.map(s => this.normalizeSession(s)),
      total: sessions.length // This is just a placeholder for total if we aren't doing full pagination with count
    };
  }

  async updateSessionProgress(
    sessionId: string,
    progress: Partial<WorkoutSession['progress']>
  ): Promise<WorkoutSession | null> {
    const updated = await this.mongoProvider.update(this.sessionsCollection, sessionId, {
      progress: {
        ...progress,
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

    // If RPE result is provided, ensure legacy sessionRPE is also set if missing
    if (updates.summary?.sessionRpe && !updates.summary.sessionRPE) {
      updates.summary.sessionRPE = updates.summary.sessionRpe.numeric;
    }

    // If exercises are being updated, recalculate their summaries
    if (updates.exercises) {
      // 1. Calculate new stats from the updated exercises
      const { updatedExercises, exercisesSummary, globalStats } = this.calculateExerciseSummaries(updates.exercises);
      updates.exercises = updatedExercises;

      // 2. Fetch existing session to preserve other summary fields (like sessionRPE)
      const existingSession = await this.mongoProvider.findById(this.sessionsCollection, sessionId);
      const existingSummary = existingSession?.summary || {};

      // 3. Merge: Existing Summary + New Global Stats + New Exercise Summaries + Any explicit updates to summary
      updates.summary = {
        ...existingSummary,
        ...updates.summary, // Allow client to update fields we don't calculate (like sessionRPE)
        ...globalStats,     // Force calculated stats to take precedence
        exercises: exercisesSummary
      } as any;
    } else if (updates.summary) {
      // If only updating summary (e.g. RPE), we should also fetch to merge if we want to be safe, 
      // but typically RPE update might be targeted. 
      // However, to be safe against overwrites if the client sends a partial summary:
      const existingSession = await this.mongoProvider.findById(this.sessionsCollection, sessionId);
      const existingSummary = existingSession?.summary || {};
      updates.summary = {
        ...existingSummary,
        ...updates.summary
      } as any;
    }

    // Calculate duration if session is completing
    if (updates.status === 'completed') {
      const existingSession = await this.mongoProvider.findById(this.sessionsCollection, sessionId);
      const startTime = existingSession?.actualStartTime ? new Date(existingSession.actualStartTime) : null;
      const endTime = updates.actualEndTime ? new Date(updates.actualEndTime) : new Date();

      if (startTime && endTime) {
        const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

        updates.summary = {
          ...(updates.summary || existingSession?.summary || {}),
          durationSeconds
        } as any;

        // Ensure actualEndTime is set if not provided
        if (!updates.actualEndTime) {
          updates.actualEndTime = endTime;
        }
      }
    }

    const updated = await this.mongoProvider.update(this.sessionsCollection, sessionId, {
      ...updates,
      updatedAt: new Date(),
    });

    // If the session is marked as completed, also complete the calendar event
    if (updates.status === 'completed') {
      const session = updated?.value ?? updated;

      if (session && session.calendarEventId) {
        await this.mongoProvider.update(this.eventsCollection, session.calendarEventId, {
          status: 'completed',
          updatedAt: new Date(),
        });
      } else {
        // Fallback: If we don't have the session from the update result, fetch it
        const fetchedSession = await this.mongoProvider.findById(this.sessionsCollection, sessionId);
        if (fetchedSession && fetchedSession.calendarEventId) {
          await this.mongoProvider.update(this.eventsCollection, fetchedSession.calendarEventId, {
            status: 'completed',
            updatedAt: new Date(),
          });
        }
      }
    }

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

  private calculateExerciseSummaries(exercises: any[]): { updatedExercises: any[], exercisesSummary: Record<string, ExerciseSummary>, globalStats: any } {
    const exercisesSummary: Record<string, ExerciseSummary> = {};

    const globalStats = {
      totalExercises: exercises.length,
      completedExercises: 0,
      totalSets: 0,
      completedSets: 0,
      extraSets: 0,
      compliancePercent: 0,
      totalVolumeLifted: 0,
      averageExerciseRPE: 0,
    };

    let totalRPE = 0;
    let rpeCount = 0;
    let totalSessionCompliance = 0;

    const updatedExercises = exercises.map((exercise) => {
      const sets = exercise.sets || [];
      // Only count originally prescribed sets for the total (denominator)
      const totalSets = sets.filter((s: any) => !s.isAdded).length;

      // Completed sets: Only count originally prescribed sets that are completed
      const completedSets = sets.filter((s: any) => !s.isAdded && s.status === 'completed').length;

      // Extra sets: Count added sets that are completed
      const extraSets = sets.filter((s: any) => s.isAdded && s.status === 'completed').length;

      const setCompliancePercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

      // Update global stats
      globalStats.totalSets += totalSets;
      globalStats.completedSets += completedSets;
      globalStats.extraSets += extraSets;

      // Exercise is "completed" if all ORIGINAL sets are done
      if (completedSets === totalSets && totalSets > 0) {
        globalStats.completedExercises += 1;
      }

      // RPE
      if (exercise.exerciseRpe?.numeric) {
        totalRPE += exercise.exerciseRpe.numeric;
        rpeCount++;
      }

      // Calculate metric-level compliance
      const metricStats: Record<string, {
        prescribed: number;
        performed: number;
        count: number;
        label?: string;
        unit?: string;
      }> = {};

      sets.forEach((set: any) => {
        // Process Prescribed (ONLY for original sets)
        if (set.prescribed && !set.isAdded) {
          Object.entries(set.prescribed).forEach(([key, value]: [string, any]) => {
            // Check if value is an object with 'value' property (complex metric) OR just a raw value
            if (typeof value === 'object' && value !== null && 'value' in value) {
              if (!metricStats[key]) {
                metricStats[key] = { prescribed: 0, performed: 0, count: 0, label: value.unit, unit: value.unit };
              }
              metricStats[key].prescribed += Number(value.value) || 0;
              if (!metricStats[key].unit && value.unit) metricStats[key].unit = value.unit;
            } else if (typeof value === 'number' || typeof value === 'string') {
              // Handle simple key-value pair (e.g. { reps: 10 })
              if (!metricStats[key]) {
                metricStats[key] = { prescribed: 0, performed: 0, count: 0, label: key, unit: '' };
              }
              metricStats[key].prescribed += Number(value) || 0;
            }
          });
        }

        // Process Performed (only if completed)
        if (set.status === 'completed' && set.performed) {
          Object.entries(set.performed).forEach(([key, value]: [string, any]) => {
            // Check if value is an object with 'value' property (complex metric) OR just a raw value
            if (typeof value === 'object' && value !== null && 'value' in value) {
              if (!metricStats[key]) {
                metricStats[key] = { prescribed: 0, performed: 0, count: 0 };
              }
              metricStats[key].performed += Number(value.value) || 0;
              metricStats[key].count += 1;
            } else if (typeof value === 'number' || typeof value === 'string') {
              // Handle simple key-value pair
              if (!metricStats[key]) {
                metricStats[key] = { prescribed: 0, performed: 0, count: 0 };
              }
              metricStats[key].performed += Number(value) || 0;
              metricStats[key].count += 1;
            }
          });
        }
      });

      const metricsSummary: Record<string, any> = {};
      let exercisePerformanceScore = 0;
      let totalMetricCompliance = 0;
      let metricCount = 0;

      Object.entries(metricStats).forEach(([key, stats]) => {
        let delta = stats.performed - stats.prescribed;

        // Exclude rest from delta/score (taking more rest shouldn't be "points")
        if (key === 'rest') {
          delta = 0;
        }

        exercisePerformanceScore += delta;

        // Calculate metric compliance (capped at 100%)
        const rawCompliance = stats.prescribed > 0 ? (stats.performed / stats.prescribed) * 100 : 0;
        const cappedCompliance = Math.min(rawCompliance, 100);

        // Add to total for average (exclude rest from compliance score too?)
        // Usually compliance tracks work done, so excluding rest makes sense.
        // Also exclude metrics with 0 prescription (e.g. optional weight) to avoid 0% compliance dragging down average.
        if (key !== 'rest' && stats.prescribed > 0) {
          totalMetricCompliance += cappedCompliance;
          metricCount++;
        }

        metricsSummary[key] = {
          metricId: key,
          label: key,
          unit: stats.unit,
          prescribedTotal: stats.prescribed,
          performedTotal: stats.performed,
          compliancePercent: Math.round(rawCompliance), // Keep raw for individual metric display
          avgPrescribed: totalSets > 0 ? stats.prescribed / totalSets : 0,
          avgPerformed: stats.count > 0 ? stats.performed / stats.count : 0,
          delta: delta,
        };
      });

      // Calculate overall exercise compliance
      // If we have metrics, use the average of their compliance.
      // If no metrics (e.g. simple checkbox exercise), fallback to set-based compliance.
      const exerciseCompliancePercent = metricCount > 0
        ? Math.round(totalMetricCompliance / metricCount)
        : setCompliancePercent;

      totalSessionCompliance += exerciseCompliancePercent;

      const exerciseSummary: ExerciseSummary = {
        totalSets,
        completedSets,
        extraSets,
        compliancePercent: exerciseCompliancePercent,
        metrics: metricsSummary,
        rpe: exercise.exerciseRpe,
        performanceScore: exercisePerformanceScore,
      };

      // Add to the global summary record
      if (exercise.exerciseId) {
        exercisesSummary[exercise.exerciseId] = exerciseSummary;
      }

      // Strip the redundant 'summary' field if it exists on the exercise object
      const { summary, ...rest } = exercise;
      return {
        ...rest,
      };
    });

    // Finalize global stats
    globalStats.compliancePercent = globalStats.totalExercises > 0
      ? Math.round(totalSessionCompliance / globalStats.totalExercises)
      : 0;

    globalStats.averageExerciseRPE = rpeCount > 0 ? totalRPE / rpeCount : 0;

    return { updatedExercises, exercisesSummary, globalStats };
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


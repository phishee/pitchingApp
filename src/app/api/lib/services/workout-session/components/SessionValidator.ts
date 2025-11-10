import { inject, injectable } from 'inversify';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { DB_TYPES } from '@/app/api/lib/symbols/Symbols';
import { ISessionValidator, ValidationResult } from '../interfaces/IWorkoutSessionService';

@injectable()
export class SessionValidator implements ISessionValidator {
  private readonly sessionsCollection = 'workout_sessions';
  private readonly eventsCollection = 'events';

  constructor(
    @inject(DB_TYPES.MongoDBProvider)
    private readonly mongoProvider: MongoDBProvider
  ) {}

  async validateCanStart(calendarEventId: string, athleteUserId: string): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check for existing active session
    const activeSession = await this.mongoProvider.findOne(this.sessionsCollection, {
      'athleteInfo.userId': athleteUserId,
      status: 'in_progress',
    });

    if (activeSession && activeSession.calendarEventId !== calendarEventId) {
      errors.push(
        `You already have an active workout session: "${activeSession.workout?.name ?? 'Current Workout'}". ` +
        'Please complete or abandon it before starting a new one.'
      );
    }

    // Verify event exists
    const event = await this.mongoProvider.findById(this.eventsCollection, calendarEventId);
    if (!event) {
      errors.push(`Calendar event not found: ${calendarEventId}`);
      return { valid: false, errors };
    }

    // Confirm event is a workout assignment
    if (event.sourceType !== 'workout_assignment') {
      errors.push(`This event is not a workout. Event type: ${event.sourceType ?? 'unknown'}`);
    }

    // Ensure athlete participates in event
    const participants = event.participants?.athletes ?? [];
    const isParticipant = participants.some((athlete: any) => athlete?.userId === athleteUserId);
    if (!isParticipant) {
      errors.push('You are not assigned to this workout.');
    }

    // Prevent starting a completed session for the same event
    const completedSession = await this.mongoProvider.findOne(this.sessionsCollection, {
      calendarEventId,
      status: 'completed',
    });

    if (completedSession) {
      const completedDate = completedSession.actualEndTime
        ? new Date(completedSession.actualEndTime).toLocaleString()
        : 'unknown date';
      errors.push(`This workout was already completed on ${completedDate}.`);
    }

    // Ensure event not cancelled
    if (event.status === 'cancelled') {
      errors.push('This workout has been cancelled.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


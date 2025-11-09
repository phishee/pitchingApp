import { inject, injectable } from 'inversify';
import { WorkoutSession } from '@/models/WorkoutSession';
import { DBProviderFactory } from '@/app/api/lib/factories/DBFactory';
import { DB_TYPES } from '@/app/api/lib/symbols/Symbols';

@injectable()
export class WorkoutSessionService {
  private readonly collectionName = 'workout_sessions';
  private readonly dbProvider;

  constructor(
    @inject(DB_TYPES.DBProviderFactory)
    private readonly dbFactory: DBProviderFactory
  ) {
    this.dbProvider = this.dbFactory.createDBProvider();
  }

  async createSession(calendarEventId: string): Promise<WorkoutSession | null> {
    // TODO: Implement workout session creation from calendar event
    return null;
  }
}


import { MongoDBProvider } from '../providers/mongoDb.provider';
import { DB_TYPES } from '../symbols/Symbols';
import { inject, injectable } from 'inversify';

@injectable()
export class IndexCreationService {
  constructor(
    @inject(DB_TYPES.MongoDBProvider)
    private readonly mongoProvider: MongoDBProvider
  ) {}

  /**
   * Create all necessary indexes for the refactored event and workout assignment system
   */
  async createAllIndexes(): Promise<void> {
    try {
      console.log('Creating MongoDB indexes...');

      // Events collection indexes
      await this.createEventIndexes();
      
      // Workout assignments collection indexes
      await this.createWorkoutAssignmentIndexes();

      console.log('All indexes created successfully');
    } catch (error) {
      console.error('Failed to create indexes:', error);
      throw error;
    }
  }

  /**
   * Create indexes for the events collection
   */
  private async createEventIndexes(): Promise<void> {
    const collection = this.mongoProvider.getCollection('events');

    // Compound index for group operations and time-based queries
    await collection.createIndex(
      { groupId: 1, startTime: 1 },
      { name: 'idx_groupId_startTime' }
    );

    // Compound index for source-based queries
    await collection.createIndex(
      { sourceId: 1, sourceType: 1 },
      { name: 'idx_sourceId_sourceType' }
    );

    // Compound index for athlete queries with time range
    await collection.createIndex(
      { 'participants.athletes.userId': 1, startTime: 1 },
      { name: 'idx_athletes_startTime' }
    );

    // Compound index for coach queries with time range
    await collection.createIndex(
      { 'participants.coaches.userId': 1, startTime: 1 },
      { name: 'idx_coaches_startTime' }
    );

    // Index for organization and team queries
    await collection.createIndex(
      { organizationId: 1, teamId: 1, startTime: 1 },
      { name: 'idx_org_team_startTime' }
    );

    // Index for event status queries
    await collection.createIndex(
      { status: 1, startTime: 1 },
      { name: 'idx_status_startTime' }
    );

    // Index for modified events tracking
    await collection.createIndex(
      { isModified: 1, groupId: 1 },
      { name: 'idx_modified_groupId' }
    );

    // Index for event type queries
    await collection.createIndex(
      { type: 1, startTime: 1 },
      { name: 'idx_type_startTime' }
    );

    // Index for visibility queries
    await collection.createIndex(
      { visibility: 1, organizationId: 1 },
      { name: 'idx_visibility_org' }
    );

    // Compound index for complex filtering
    await collection.createIndex(
      { 
        organizationId: 1, 
        teamId: 1, 
        type: 1, 
        status: 1, 
        startTime: 1 
      },
      { name: 'idx_complex_filter' }
    );

    console.log('Event indexes created successfully');
  }

  /**
   * Create indexes for the workout_assignments collection
   */
  private async createWorkoutAssignmentIndexes(): Promise<void> {
    const collection = this.mongoProvider.getCollection('workout_assignments');

    // Compound index for athlete queries with active status
    await collection.createIndex(
      { 'athleteInfo.userId': 1, active: 1 },
      { name: 'idx_athlete_active' }
    );

    // Compound index for coach queries
    await collection.createIndex(
      { 'coachInfo.userId': 1, active: 1 },
      { name: 'idx_coach_active' }
    );

    // Index for organization and team queries
    await collection.createIndex(
      { organizationId: 1, teamId: 1, active: 1 },
      { name: 'idx_org_team_active' }
    );

    // Index for workout queries
    await collection.createIndex(
      { workoutId: 1, active: 1 },
      { name: 'idx_workout_active' }
    );

    // Index for date range queries
    await collection.createIndex(
      { startDate: 1, endDate: 1 },
      { name: 'idx_date_range' }
    );

    // Index for session type queries
    await collection.createIndex(
      { sessionType: 1, active: 1 },
      { name: 'idx_session_type' }
    );

    // Compound index for complex filtering
    await collection.createIndex(
      { 
        organizationId: 1, 
        teamId: 1, 
        'athleteInfo.userId': 1, 
        active: 1 
      },
      { name: 'idx_complex_assignment_filter' }
    );

    console.log('Workout assignment indexes created successfully');
  }

  /**
   * Drop all indexes (useful for testing or reindexing)
   */
  async dropAllIndexes(): Promise<void> {
    try {
      console.log('Dropping all indexes...');

      const eventsCollection = this.mongoProvider.getCollection('events');
      const assignmentsCollection = this.mongoProvider.getCollection('workout_assignments');

      // Drop all indexes except _id
      await eventsCollection.dropIndexes();
      await assignmentsCollection.dropIndexes();

      console.log('All indexes dropped successfully');
    } catch (error) {
      console.error('Failed to drop indexes:', error);
      throw error;
    }
  }

  /**
   * List all indexes for debugging
   */
  async listAllIndexes(): Promise<void> {
    try {
      const eventsCollection = this.mongoProvider.getCollection('events');
      const assignmentsCollection = this.mongoProvider.getCollection('workout_assignments');

      const eventIndexes = await eventsCollection.listIndexes().toArray();
      const assignmentIndexes = await assignmentsCollection.listIndexes().toArray();

      console.log('Event indexes:');
      eventIndexes.forEach(index => {
        console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      });

      console.log('\nWorkout assignment indexes:');
      assignmentIndexes.forEach(index => {
        console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      });
    } catch (error) {
      console.error('Failed to list indexes:', error);
      throw error;
    }
  }
}

/**
 * Standalone function to create indexes (can be called from scripts)
 */
export async function createIndexes(): Promise<void> {
  const mongoProvider = new MongoDBProvider();
  const indexService = new IndexCreationService(mongoProvider);
  
  try {
    await indexService.createAllIndexes();
  } finally {
    await mongoProvider.disconnect();
  }
}

/**
 * Standalone function to drop indexes (can be called from scripts)
 */
export async function dropIndexes(): Promise<void> {
  const mongoProvider = new MongoDBProvider();
  const indexService = new IndexCreationService(mongoProvider);
  
  try {
    await indexService.dropAllIndexes();
  } finally {
    await mongoProvider.disconnect();
  }
}

import { Workout, WorkoutResponse, WorkoutQueryParams, WorkoutWithUser, WorkoutResponseWithUser } from '@/models/Workout';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';
import { DBProviderFactory } from '../factories/DBFactory';

@injectable()
export class WorkoutService {
    private workoutRepo;
    private workoutCollection = 'workouts';

    constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
        this.workoutRepo = this.dbFactory.createDBProvider();
    }

    // Get all workouts with complex querying (original method)
    async getWorkouts(params: WorkoutQueryParams): Promise<WorkoutResponse> {
        try {
            // Build MongoDB query
            const mongoQuery = this.buildMongoFilter(params);

            // Fetch from MongoDB
            const allWorkouts = await this.workoutRepo.findQuery(this.workoutCollection, mongoQuery);

            // Apply client-side filters for complex logic
            const filteredWorkouts = this.applyFilters(allWorkouts, params);

            // Sort workouts
            const sortedWorkouts = this.sortWorkouts(filteredWorkouts, params.sort || 'name', params.order || 'asc');

            // Calculate pagination
            const pagination = this.calculatePagination(sortedWorkouts, params);

            // Get paginated data
            const paginatedWorkouts = this.paginateResults(sortedWorkouts, pagination);

            // Get available filters
            const filters = this.getAvailableFilters(allWorkouts);

            return {
                data: paginatedWorkouts,
                pagination,
                filters,
                query: params
            };
        } catch (error) {
            console.error('Error fetching workouts from database:', error);
            throw new Error('Failed to fetch workouts');
        }
    }

    // Get all workouts with user information using populate
    async getWorkoutsWithUsers(params: WorkoutQueryParams): Promise<WorkoutResponseWithUser> {
        try {
            // Build MongoDB query
            const mongoQuery = this.buildMongoFilter(params);

            // Use findWithPopulate to get workouts with user information
            const allWorkouts = await this.workoutRepo.findWithPopulate(
                this.workoutCollection,
                mongoQuery,
                [
                    {
                        path: 'createdByUser',
                        from: 'users',
                        localField: 'createdBy.userId',
                        foreignField: 'userId',
                        select: ['userId', 'name', 'email', 'profileImageUrl'],
                        as: 'createdByUser'
                    },
                    {
                        path: 'updatedByUser',
                        from: 'users',
                        localField: 'updatedBy.userId',
                        foreignField: 'userId',
                        select: ['userId', 'name', 'email', 'profileImageUrl'],
                        as: 'updatedByUser'
                    }
                ]
            );

            // Apply client-side filters for complex logic
            const filteredWorkouts = this.applyFilters(allWorkouts, params);

            // Sort workouts
            const sortedWorkouts = this.sortWorkouts(filteredWorkouts, params.sort || 'name', params.order || 'asc');

            // Calculate pagination
            const pagination = this.calculatePagination(sortedWorkouts, params);

            // Get paginated data
            const paginatedWorkouts = this.paginateResults(sortedWorkouts, pagination);

            // Get available filters
            const filters = this.getAvailableFilters(allWorkouts);

            return {
                data: paginatedWorkouts as WorkoutWithUser[],
                pagination,
                filters,
                query: params
            };
        } catch (error) {
            console.error('Error fetching workouts with users from database:', error);
            throw new Error('Failed to fetch workouts with user information');
        }
    }

    // Build MongoDB filter
    private buildMongoFilter(params: WorkoutQueryParams): any {
        const filter: any = {};

        // Organization filter
        if (params.organizationId) {
            filter.organizationId = params.organizationId;
        }

        // Team filter
        if (params.teamId) {
            filter.teamIds = { $in: [params.teamId] };
        }

        // Created by filter
        if (params.createdBy) {
            filter['createdBy.userId'] = params.createdBy;
        }

        // Tags filter
        if (params.tags) {
            const requestedTags = params.tags.split(',').map(tag => tag.trim());
            filter.tags = { $all: requestedTags };
        }

        // Text search (name, description, tags)
        if (params.search || params.name) {
            const searchTerm = params.search || params.name;
            const searchRegex = new RegExp(this.escapeRegex(searchTerm), 'i');

            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } }
            ];
        }

        return filter;
    }

    // Add the missing helper methods
    private applyFilters(workouts: Workout[], params: WorkoutQueryParams): Workout[] {
        let filtered = [...workouts];

        // Text search
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filtered = filtered.filter(workout =>
                workout.name.toLowerCase().includes(searchTerm) ||
                workout.description.toLowerCase().includes(searchTerm) ||
                workout.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Name search
        if (params.name) {
            const nameTerm = params.name.toLowerCase();
            filtered = filtered.filter(workout =>
                workout.name.toLowerCase().includes(nameTerm)
            );
        }

        // Organization filter
        if (params.organizationId) {
            filtered = filtered.filter(workout => workout.organizationId === params.organizationId);
        }

        // Team filter
        if (params.teamId) {
            filtered = filtered.filter(workout => workout.teamIds.includes(params.teamId!));
        }

        // Created by filter
        if (params.createdBy) {
            filtered = filtered.filter(workout => workout.createdBy.userId === params.createdBy);
        }

        // Tags filter
        if (params.tags) {
            const requestedTags = params.tags.split(',').map(tag => tag.trim().toLowerCase());
            filtered = filtered.filter(workout =>
                requestedTags.every(tag =>
                    workout.tags.some(workoutTag =>
                        workoutTag.toLowerCase().includes(tag)
                    )
                )
            );
        }

        return filtered;
    }

    private sortWorkouts(workouts: Workout[], sortBy: string, order: 'asc' | 'desc'): Workout[] {
        return workouts.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'created':
                    comparison = a.id.localeCompare(b.id); // Using ID as proxy for created date
                    break;
                case 'updated':
                    comparison = a.id.localeCompare(b.id); // Using ID as proxy for updated date
                    break;
                default:
                    comparison = a.name.localeCompare(b.name);
            }

            return order === 'desc' ? -comparison : comparison;
        });
    }

    private calculatePagination(workouts: Workout[], params: WorkoutQueryParams) {
        const total = workouts.length;
        const limit = Math.min(Math.max(params.limit || 20, 1), 100);
        const page = Math.max(params.page || 1, 1);
        const totalPages = Math.ceil(total / limit);

        return {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            startIndex: (page - 1) * limit,
            endIndex: Math.min(page * limit, total)
        };
    }

    private paginateResults(workouts: Workout[], pagination: any): Workout[] {
        return workouts.slice(pagination.startIndex, pagination.endIndex);
    }

    private escapeRegex(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private getAvailableFilters(workouts: Workout[]) {
        const tags = [...new Set(workouts.flatMap(workout => workout.tags))];

        return {
            availableTags: tags.sort(),
            totalWorkouts: workouts.length
        };
    }

    // Get single workout by ID with organization validation
    async getWorkoutById(id: string, organizationId: string): Promise<Workout | null> {
        try {
            const workout = await this.workoutRepo.findQuery(
                this.workoutCollection,
                {
                    id: id,
                    organizationId: organizationId
                }
            ) as Workout[];

            return workout.length > 0 ? workout[0] : null;
        } catch (error) {
            console.error('Error fetching workout by ID:', error);
            throw new Error('Failed to fetch workout');
        }
    }

    // Add this method to the WorkoutService class
    // Create a new workout
    async createWorkout(workoutData: Omit<Workout, 'id'>): Promise<Workout> {
        try {
            // Validate required fields
            if (!workoutData.name || !workoutData.organizationId || !workoutData.createdBy) {
                throw new Error('Missing required fields: name, organizationId, or createdBy');
            }

            // Check if workout with same name exists in organization
            const existingWorkout = await this.workoutRepo.findQuery(
                this.workoutCollection,
                {
                    name: workoutData.name,
                    organizationId: workoutData.organizationId
                }
            );

            if (existingWorkout && existingWorkout.length > 0) {
                throw new Error('A workout with this name already exists in your organization');
            }

            // Create workout with generated ID
            const workout: Workout = {
                ...workoutData,
                id: this.generateWorkoutId(),
                updatedBy: workoutData.createdBy // Set updatedBy to same as createdBy for new workout
            };

            const createdWorkout = await this.workoutRepo.create(this.workoutCollection, workout);
            return createdWorkout;
        } catch (error) {
            console.error('Error creating workout:', error);
            throw error;
        }
    }

    // Helper method to generate workout ID
    private generateWorkoutId(): string {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `workout_${timestamp}_${randomStr}`;
    }

    // Add this method to the WorkoutService class
    // Delete a workout
    async deleteWorkout(id: string, organizationId: string): Promise<boolean> {
        try {
            // Check if workout exists and belongs to organization
            const existingWorkout = await this.workoutRepo.findQuery(
                this.workoutCollection,
                {
                    id: id,
                    organizationId: organizationId
                }
            );

            if (!existingWorkout || existingWorkout.length === 0) {
                throw new Error('Workout not found or does not belong to organization');
            }

            // Delete the workout
            const deleted = await this.workoutRepo.delete(this.workoutCollection, id);
            return deleted;
        } catch (error) {
            console.error('Error deleting workout:', error);
            throw error;
        }
    }

    // Add this method to the WorkoutService class
    // Update an existing workout
    async updateWorkout(id: string, organizationId: string, workoutData: Workout): Promise<Workout | null> {
        try {
            // Validate required fields
            if (!workoutData.name || !workoutData.organizationId || !workoutData.updatedBy) {
                throw new Error('Missing required fields: name, organizationId, or updatedBy');
            }

            // Ensure the organizationId matches the one in the URL parameter
            if (workoutData.organizationId !== organizationId) {
                throw new Error('Organization ID mismatch');
            }

            // Check if workout exists and belongs to organization
            const existingWorkout = await this.workoutRepo.findQuery(
                this.workoutCollection,
                {
                    id: id,
                    organizationId: organizationId
                }
            );

            if (!existingWorkout || existingWorkout.length === 0) {
                throw new Error('Workout not found or does not belong to organization');
            }

            // Get the MongoDB _id from the existing workout
            const mongoId = existingWorkout[0]._id;

            // Check if another workout with same name exists (excluding current one)
            const duplicateWorkout = await this.workoutRepo.findQuery(
                this.workoutCollection,
                {
                    name: workoutData.name,
                    organizationId: organizationId,
                    id: { $ne: id } // Exclude current workout
                }
            );

            if (duplicateWorkout && duplicateWorkout.length > 0) {
                throw new Error('A workout with this name already exists in your organization');
            }

            // Update the workout using the MongoDB _id
            const updatedWorkout = await this.workoutRepo.update(this.workoutCollection, mongoId, workoutData);
            return updatedWorkout;
        } catch (error) {
            console.error('Error updating workout:', error);
            throw error;
        }
    }
}
import { Exercise } from '@/models/Exercise';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';
import { DBProviderFactory } from '../factories/DBFactory';

// Query parameters interface
export interface ExerciseQueryParams {
  search?: string;
  name?: string;
  type?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'type' | 'created';
  order?: 'asc' | 'desc';
  owner?: string;
  hasVideo?: boolean;
  hasAnimation?: boolean;
  minMetrics?: number;
  ids?: string[];
}

// Response interface
export interface ExerciseResponse {
  data: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    availableTypes: string[];
    availableTags: string[];
    totalExercises: number;
  };
  query: ExerciseQueryParams;
}

@injectable()
export class ExerciseService {
  private exerciseRepo;
  private exerciseCollection = 'exercises';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.exerciseRepo = this.dbFactory.createDBProvider();
  }

  // Get all exercises with complex querying - MongoDB optimized
  async getExercises(params: ExerciseQueryParams): Promise<ExerciseResponse> {
    try {
      // Build MongoDB query
      const mongoQuery = this.buildMongoFilter(params);

      // Fetch from MongoDB
      const allExercises = await this.exerciseRepo.findQuery(this.exerciseCollection, mongoQuery);

      // Apply client-side filters for complex logic
      const filteredExercises = this.applyFilters(allExercises, params);

      // Sort exercises
      const sortedExercises = this.sortExercises(filteredExercises, params.sort || 'name', params.order || 'asc');

      // Calculate pagination
      const pagination = this.calculatePagination(sortedExercises, params);

      // Get paginated data
      const paginatedExercises = this.paginateResults(sortedExercises, pagination);

      // Get available filters
      const filters = this.getAvailableFilters(allExercises);

      return {
        data: paginatedExercises,
        pagination,
        filters,
        query: params
      };
    } catch (error) {
      console.error('Error fetching exercises from database:', error);
      throw new Error('Failed to fetch exercises');
    }
  }

  // Add MongoDB query builder
  private buildMongoFilter(params: ExerciseQueryParams): any {
    const filter: any = {};

    // Type filter
    if (params.type) {
      filter.exercise_type = params.type;
    }

    // IDs filter
    if (params.ids && params.ids.length > 0) {
      filter.id = { $in: params.ids };
    }

    // Owner filter
    if (params.owner) {
      filter.owner = params.owner;
    }

    // Media filters
    if (params.hasVideo !== undefined) {
      filter['instructions.video'] = { $exists: params.hasVideo };
    }

    if (params.hasAnimation !== undefined) {
      filter['instructions.animationPicture'] = { $exists: params.hasAnimation };
    }

    // Metrics filter
    if (params.minMetrics !== undefined) {
      filter.metrics = { $size: { $gte: params.minMetrics } };
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

    // Tags filter
    if (params.tags) {
      const requestedTags = params.tags.split(',').map(tag => tag.trim());
      filter.tags = { $all: requestedTags };
    }

    return filter;
  }

  // Add the missing helper methods
  private applyFilters(exercises: Exercise[], params: ExerciseQueryParams): Exercise[] {
    let filtered = [...exercises];

    // Text search
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.description.toLowerCase().includes(searchTerm) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Name search
    if (params.name) {
      const nameTerm = params.name.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(nameTerm)
      );
    }

    // Type filter
    if (params.type) {
      filtered = filtered.filter(exercise => exercise.exercise_type === params.type);
    }

    // Tags filter
    if (params.tags) {
      const requestedTags = params.tags.split(',').map(tag => tag.trim().toLowerCase());
      filtered = filtered.filter(exercise =>
        requestedTags.every(tag =>
          exercise.tags.some(exerciseTag =>
            exerciseTag.toLowerCase().includes(tag)
          )
        )
      );
    }

    // Owner filter
    if (params.owner) {
      filtered = filtered.filter(exercise => exercise.owner === params.owner);
    }

    // Media filters
    if (params.hasVideo !== undefined) {
      filtered = filtered.filter(exercise =>
        params.hasVideo ? !!exercise.instructions.video : !exercise.instructions.video
      );
    }

    if (params.hasAnimation !== undefined) {
      filtered = filtered.filter(exercise =>
        params.hasAnimation ? !!exercise.instructions.animationPicture : !exercise.instructions.animationPicture
      );
    }

    // Metrics filter
    if (params.minMetrics !== undefined) {
      filtered = filtered.filter(exercise => exercise.metrics.length >= params.minMetrics!);
    }

    return filtered;
  }

  private sortExercises(exercises: Exercise[], sortBy: string, order: 'asc' | 'desc'): Exercise[] {
    return exercises.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.exercise_type.localeCompare(b.exercise_type);
          break;
        case 'created':
          comparison = a.id.localeCompare(b.id);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  private calculatePagination(exercises: Exercise[], params: ExerciseQueryParams) {
    const total = exercises.length;
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

  private paginateResults(exercises: Exercise[], pagination: any): Exercise[] {
    return exercises.slice(pagination.startIndex, pagination.endIndex);
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Fix getAvailableFilters to work with MongoDB data
  private getAvailableFilters(exercises: Exercise[]) {
    const types = [...new Set(exercises.map(ex => ex.exercise_type))];
    const tags = [...new Set(exercises.flatMap(ex => ex.tags))];

    return {
      availableTypes: types.sort(),
      availableTags: tags.sort(),
      totalExercises: exercises.length
    };
  }

  // Get single exercise by ID
  async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      return await this.exerciseRepo.findQuery(this.exerciseCollection, { id }) as Exercise | null;
    } catch (error) {
      console.error('Error fetching exercise by ID:', error);
      throw new Error('Failed to fetch exercise');
    }
  }

  // Get exercises by type - MongoDB optimized
  async getExercisesByType(type: string): Promise<Exercise[]> {
    try {
      return await this.exerciseRepo.findQuery(
        this.exerciseCollection,
        { exercise_type: type }
      ) as Exercise[];
    } catch (error) {
      console.error('Error fetching exercises by type:', error);
      throw new Error('Failed to fetch exercises by type');
    }
  }

  // Get exercises by tags - MongoDB optimized
  async getExercisesByTags(tags: string[]): Promise<Exercise[]> {
    try {
      return await this.exerciseRepo.findQuery(
        this.exerciseCollection,
        { tags: { $all: tags } }
      ) as Exercise[];
    } catch (error) {
      console.error('Error fetching exercises by tags:', error);
      throw new Error('Failed to fetch exercises by tags');
    }
  }

  // Enhanced search with MongoDB text search
  async searchExercises(searchTerm: string): Promise<Exercise[]> {
    try {
      const searchRegex = new RegExp(this.escapeRegex(searchTerm), 'i');

      // Use MongoDB aggregation for scoring
      const pipeline = [
        {
          $match: {
            $or: [
              { name: searchRegex },
              { description: searchRegex },
              { tags: { $in: [searchRegex] } }
            ]
          }
        },
        {
          $addFields: {
            score: {
              $add: [
                { $cond: [{ $regexMatch: { input: '$name', regex: searchRegex } }, 10, 0] },
                { $cond: [{ $regexMatch: { input: '$description', regex: searchRegex } }, 3, 0] },
                { $cond: [{ $in: [searchRegex, '$tags'] }, 1, 0] }
              ]
            }
          }
        },
        { $sort: { score: -1 } }
      ];

      return await this.exerciseRepo.aggregate(this.exerciseCollection, pipeline) as Exercise[];
    } catch (error) {
      console.error('Error searching exercises:', error);
      throw new Error('Failed to search exercises');
    }
  }

  // Get available filters - optimized with aggregation
  //   async getAvailableFilters() {
  //     try {
  //       const pipeline = [
  //         {
  //           $group: {
  //             _id: null,
  //             types: { $addToSet: '$exercise_type' },
  //             tags: { $addToSet: '$tags' },
  //             total: { $sum: 1 }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             availableTypes: { $sortArray: { input: '$types', sortBy: 1 } },
  //             availableTags: { $sortArray: { input: { $reduce: { input: '$tags', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } }, sortBy: 1 } },
  //             totalExercises: '$total'
  //           }
  //         }
  //       ];

  //       const result = await this.exerciseRepo.aggregate(this.exerciseCollection, pipeline);
  //       return result[0] || { availableTypes: [], availableTags: [], totalExercises: 0 };
  //     } catch (error) {
  //       console.error('Error getting available filters:', error);
  //       return { availableTypes: [], availableTags: [], totalExercises: 0 };
  //     }
  //   }
}

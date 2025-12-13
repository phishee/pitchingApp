import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { EXERCISE_TYPES } from '@/app/api/lib/symbols/Symbols';
import { ExerciseService, ExerciseQueryParams } from '@/app/api/lib/services/exercise.service';

@injectable()
export class ExerciseController {
  constructor(
    @inject(EXERCISE_TYPES.ExerciseService) private exerciseService: ExerciseService
  ) { }

  async getExercises(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);

      // Parse query parameters
      const params: ExerciseQueryParams = {
        search: searchParams.get('search') || undefined,
        name: searchParams.get('name') || undefined,
        type: searchParams.get('type') || undefined,
        tags: searchParams.get('tags') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
        sort: (searchParams.get('sort') as 'name' | 'type' | 'created') || 'name',
        order: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
        owner: searchParams.get('owner') || undefined,
        hasVideo: searchParams.get('hasVideo') === 'true' ? true :
          searchParams.get('hasVideo') === 'false' ? false : undefined,
        hasAnimation: searchParams.get('hasAnimation') === 'true' ? true :
          searchParams.get('hasAnimation') === 'false' ? false : undefined,
        minMetrics: searchParams.get('minMetrics') ?
          parseInt(searchParams.get('minMetrics')!) : undefined,
        ids: searchParams.get('ids') ? searchParams.get('ids')!.split(',') : undefined,
      };

      // Validate parameters
      if (params.page! < 1) {
        return NextResponse.json(
          { error: 'Page must be greater than 0' },
          { status: 400 }
        );
      }

      if (params.limit! < 1 || params.limit! > 100) {
        return NextResponse.json(
          { error: 'Limit must be between 1 and 100' },
          { status: 400 }
        );
      }

      const response = await this.exerciseService.getExercises(params);
      return NextResponse.json(response);

    } catch (err: any) {
      console.error('Exercise API error:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getExerciseById(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const exercise = await this.exerciseService.getExerciseById(id);

      if (!exercise) {
        return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
      }

      return NextResponse.json(exercise);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getExercisesByType(req: NextRequest, { params }: { params: Promise<{ type: string }> }): Promise<NextResponse> {
    try {
      const { type } = await params;
      const exercises = await this.exerciseService.getExercisesByType(type);
      return NextResponse.json(exercises);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async searchExercises(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const searchTerm = searchParams.get('q');

      if (!searchTerm) {
        return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
      }

      const exercises = await this.exerciseService.searchExercises(searchTerm);
      return NextResponse.json(exercises);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { WORKOUT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutService } from '@/app/api/lib/services/workout.service';
import { WorkoutQueryParams } from '@/models/Workout';

@injectable()
export class WorkoutController {
  constructor(
    @inject(WORKOUT_TYPES.WorkoutService) private workoutService: WorkoutService
  ) {}

  async getWorkouts(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      
      // Parse query parameters
      const params: WorkoutQueryParams = {
        search: searchParams.get('search') || undefined,
        name: searchParams.get('name') || undefined,
        organizationId: searchParams.get('organizationId') || undefined,
        teamId: searchParams.get('teamId') || undefined,
        createdBy: searchParams.get('createdBy') || undefined,
        tags: searchParams.get('tags') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
        sort: (searchParams.get('sort') as 'name' | 'created' | 'updated') || 'name',
        order: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
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
      
      const response = await this.workoutService.getWorkouts(params);
      return NextResponse.json(response);
      
    } catch (err: any) {
      console.error('Workout API error:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getWorkoutsWithUsers(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      
      // Parse query parameters
      const params: WorkoutQueryParams = {
        search: searchParams.get('search') || undefined,
        name: searchParams.get('name') || undefined,
        organizationId: searchParams.get('organizationId') || undefined,
        teamId: searchParams.get('teamId') || undefined,
        createdBy: searchParams.get('createdBy') || undefined,
        tags: searchParams.get('tags') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
        sort: (searchParams.get('sort') as 'name' | 'created' | 'updated') || 'name',
        order: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
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
      
      const response = await this.workoutService.getWorkoutsWithUsers(params);
      return NextResponse.json(response);
      
    } catch (err: any) {
      console.error('Workout API error:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getWorkoutById(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const { searchParams } = new URL(req.url);
      const organizationId = searchParams.get('organizationId');
      
      // Validate required parameters
      if (!organizationId) {
        return NextResponse.json(
          { error: 'organizationId is required' },
          { status: 400 }
        );
      }
      
      const workout = await this.workoutService.getWorkoutById(id, organizationId);
      
      if (!workout) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
      }
      
      return NextResponse.json(workout);
    } catch (err: any) {
      console.error('Workout API error:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async createWorkout(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      
      // Validate required fields
      if (!body.name || !body.organizationId || !body.createdBy) {
        return NextResponse.json(
          { error: 'Missing required fields: name, organizationId, or createdBy' },
          { status: 400 }
        );
      }

      // Validate createdBy structure
      if (!body.createdBy.userId || !body.createdBy.memberId) {
        return NextResponse.json(
          { error: 'createdBy must contain userId and memberId' },
          { status: 400 }
        );
      }

      // Validate flow structure if provided
      if (body.flow) {
        if (!body.flow.exercises || !Array.isArray(body.flow.exercises)) {
          return NextResponse.json(
            { error: 'flow.exercises must be an array' },
            { status: 400 }
          );
        }
      }

      const workout = await this.workoutService.createWorkout(body);
      return NextResponse.json(workout, { status: 201 });
      
    } catch (err: any) {
      console.error('Workout creation error:', err);
      
      // Handle specific error messages
      if (err.message.includes('already exists')) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteWorkout(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const { searchParams } = new URL(req.url);
      const organizationId = searchParams.get('organizationId');
      
      // Validate required parameters
      if (!organizationId) {
        return NextResponse.json(
          { error: 'organizationId is required' },
          { status: 400 }
        );
      }

      const deleted = await this.workoutService.deleteWorkout(id, organizationId);
      
      if (!deleted) {
        return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: 'Workout deleted successfully',
        id: id 
      });
      
    } catch (err: any) {
      console.error('Workout deletion error:', err);
      
      // Handle specific error messages
      if (err.message.includes('not found') || err.message.includes('does not belong')) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateWorkout(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const { searchParams } = new URL(req.url);
      const organizationId = searchParams.get('organizationId');
      const body = await req.json();
      
      // Validate required parameters
      if (!organizationId) {
        return NextResponse.json(
          { error: 'organizationId is required' },
          { status: 400 }
        );
      }

      // Validate required fields in body
      if (!body.name || !body.organizationId || !body.updatedBy) {
        return NextResponse.json(
          { error: 'Missing required fields: name, organizationId, or updatedBy' },
          { status: 400 }
        );
      }

      // Validate updatedBy structure
      if (!body.updatedBy.userId || !body.updatedBy.memberId) {
        return NextResponse.json(
          { error: 'updatedBy must contain userId and memberId' },
          { status: 400 }
        );
      }

      // Validate flow structure if provided
      if (body.flow) {
        if (!body.flow.exercises || !Array.isArray(body.flow.exercises)) {
          return NextResponse.json(
            { error: 'flow.exercises must be an array' },
            { status: 400 }
          );
        }
      }

      const workout = await this.workoutService.updateWorkout(id, organizationId, body);
      
      if (!workout) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
      }
      
      return NextResponse.json(workout);
      
    } catch (err: any) {
      console.error('Workout update error:', err);
      
      // Handle specific error messages
      if (err.message.includes('not found') || err.message.includes('does not belong')) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      
      if (err.message.includes('already exists')) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      
      if (err.message.includes('Organization ID mismatch')) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
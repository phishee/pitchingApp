import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { WORKOUT_ASSIGNMENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutAssignmentController } from '../../lib/controllers/workoutAssignment.controller';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = container.get<WorkoutAssignmentController>(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentController);
    
    // Check if multiple athletes are provided
    if (body.athletes && Array.isArray(body.athletes) && body.athletes.length > 0) {
      // Multiple athletes scenario
      const { athletes, ...basePayload } = body;
      const result = await controller.createAssignmentsForMultipleAthletes(basePayload, athletes);
      return NextResponse.json(result, { status: 201 });
    } else {
      // Single athlete scenario - transform response format to match frontend expectations
      const result = await controller.createAssignment(body);
      return NextResponse.json({
        assignment: result.assignments[0], // Convert array to single object
        events: result.events,
        totalCreated: result.totalCreated
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Workout assignment creation failed:', error);
    
    if (error instanceof Error) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const teamId = searchParams.get('teamId');
    const athleteId = searchParams.get('athleteId');
    
    if (!organizationId || !teamId) {
      return NextResponse.json(
        { error: 'organizationId and teamId are required' },
        { status: 400 }
      );
    }
    
    const controller = container.get<WorkoutAssignmentController>(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentController);
    const result = await controller.getAssignments({
      organizationId,
      teamId,
      athleteId: athleteId || undefined
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch workout assignments:', error);
    
    if (error instanceof Error) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

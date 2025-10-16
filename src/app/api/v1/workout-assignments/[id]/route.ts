import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { WORKOUT_ASSIGNMENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutAssignmentController } from '@/app/api/lib/controllers/workoutAssignment.controller';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const controller = container.get<WorkoutAssignmentController>(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentController);
    const result = await controller.getAssignmentById(id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Workout assignment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch workout assignment:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const controller = container.get<WorkoutAssignmentController>(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentController);
    const result = await controller.updateAssignment(id, body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update workout assignment:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const controller = container.get<WorkoutAssignmentController>(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentController);
    
    // Validate required fields
    if (!body.updateStrategy) {
      return NextResponse.json(
        { error: 'updateStrategy is required' },
        { status: 400 }
      );
    }
    
    const result = await controller.updateAssignmentAndEvents(id, body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update assignment and events:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const controller = container.get<WorkoutAssignmentController>(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentController);
    await controller.deleteAssignment(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workout assignment:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

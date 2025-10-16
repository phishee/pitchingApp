import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { WORKOUT_ASSIGNMENT_TYPES } from '../symbols/Symbols';
import { WorkoutAssignmentService } from '../services/workoutAssignment.service';
import { WorkoutAssignmentController } from '../controllers/workoutAssignment.controller';

export const WorkoutAssignmentModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  // Bind services
  options.bind(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentService).to(WorkoutAssignmentService).inSingletonScope();
  
  // Bind controllers
  options.bind(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentController).to(WorkoutAssignmentController).inSingletonScope();
});

import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { WORKOUT_TYPES } from '../symbols/Symbols';
import { WorkoutService } from '../services/workout.service';
import { WorkoutController } from '../controllers/workout.controller';

export const WorkoutModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  // Bind services
  options.bind(WORKOUT_TYPES.WorkoutService).to(WorkoutService).inSingletonScope();
  
  // Bind controllers
  options.bind(WORKOUT_TYPES.WorkoutController).to(WorkoutController).inSingletonScope();
});
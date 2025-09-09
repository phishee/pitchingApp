import 'reflect-metadata';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { ExerciseService } from "@/app/api/lib/services/exercise.service";
import { EXERCISE_TYPES } from "@/app/api/lib/symbols/Symbols";
import { ExerciseController } from '../controllers/exercise.controller';

export const ExerciseModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  // Bind controller
  options.bind(EXERCISE_TYPES.ExerciseController).to(ExerciseController).inSingletonScope();
  
  // Bind service
  options.bind(EXERCISE_TYPES.ExerciseService).to(ExerciseService).inSingletonScope();
});

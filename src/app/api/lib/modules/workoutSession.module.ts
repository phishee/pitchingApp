import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { WORKOUT_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutSessionService } from '@/app/api/lib/services/workoutSession.service';
import { WorkoutSessionController } from '@/app/api/lib/controllers/workoutSession.controller';

export const WorkoutSessionModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options
    .bind(WORKOUT_SESSION_TYPES.WorkoutSessionService)
    .to(WorkoutSessionService)
    .inSingletonScope();

  options
    .bind(WORKOUT_SESSION_TYPES.WorkoutSessionController)
    .to(WorkoutSessionController)
    .inSingletonScope();
});


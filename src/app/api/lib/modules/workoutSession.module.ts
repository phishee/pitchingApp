import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { WORKOUT_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutSessionService } from '@/app/api/lib/services/workout-session/workoutSession.service';
import { WorkoutSessionController } from '@/app/api/lib/controllers/workoutSession.controller';
import { SessionValidator } from '@/app/api/lib/services/workout-session/components/SessionValidator';
import { SessionDataAggregator } from '@/app/api/lib/services/workout-session/components/SessionDataAggregator';
import { PrescriptionResolver } from '@/app/api/lib/services/workout-session/components/PrescriptionResolver';
import { SessionInitializer } from '@/app/api/lib/services/workout-session/components/SessionInitializer';
import { SessionEventBus } from '@/app/api/lib/services/workout-session/components/SessionEventBus';

export const WorkoutSessionModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind(WORKOUT_SESSION_TYPES.SessionValidator).to(SessionValidator).inSingletonScope();
  options.bind(WORKOUT_SESSION_TYPES.SessionDataAggregator).to(SessionDataAggregator).inSingletonScope();
  options.bind(WORKOUT_SESSION_TYPES.PrescriptionResolver).to(PrescriptionResolver).inSingletonScope();
  options.bind(WORKOUT_SESSION_TYPES.SessionInitializer).to(SessionInitializer).inSingletonScope();
  options.bind(WORKOUT_SESSION_TYPES.SessionEventBus).to(SessionEventBus).inSingletonScope();

  options.bind(WORKOUT_SESSION_TYPES.WorkoutSessionService).to(WorkoutSessionService).inSingletonScope();

  options.bind(WORKOUT_SESSION_TYPES.WorkoutSessionController).to(WorkoutSessionController).inSingletonScope();
});


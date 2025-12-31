import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { BULLPEN_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { BullpenSessionService } from '../services/bullpen-session/bullpenSession.service';
import { BullpenSessionController } from '../controllers/bullpenSession.controller';

export const BullpenSessionModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
    options.bind(BULLPEN_SESSION_TYPES.BullpenSessionService).to(BullpenSessionService).inSingletonScope();
    options.bind(BULLPEN_SESSION_TYPES.BullpenSessionController).to(BullpenSessionController).inSingletonScope();
});

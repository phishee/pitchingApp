// src/app/api/lib/modules/facility.module.ts

import 'reflect-metadata';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { FacilityService } from "@/app/api/lib/services/facility.service";
import { FACILITY_TYPES } from "@/app/api/lib/symbols/Symbols";
import { FacilityController } from '../controllers/facility.controller';

export const FacilityModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  // Bind controller using the symbol
  options.bind(FACILITY_TYPES.FacilityController).to(FacilityController).inSingletonScope();
  
  // Bind the FacilityService
  options.bind(FACILITY_TYPES.FacilityService).to(FacilityService).inSingletonScope();
});

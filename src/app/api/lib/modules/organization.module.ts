// src/app/api/lib/modules/organization.module.ts
import 'reflect-metadata';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { OrganizationService } from "@/app/api/lib/services/organization.service";
import { ORGANIZATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { OrganizationController } from '../controllers/organization.controller';

export const OrganizationModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind(ORGANIZATION_TYPES.OrganizationController).to(OrganizationController).inSingletonScope();
  options.bind(ORGANIZATION_TYPES.OrganizationService).to(OrganizationService).inSingletonScope();
});
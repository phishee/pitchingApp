// src/app/api/lib/modules/user.module.ts
import 'reflect-metadata';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { UserService } from "@/app/api/lib/services/user.service";
import { USER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { UserController } from '../controllers/user.controller';

export const UserModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  // Bind controller using the symbol
  options.bind(USER_TYPES.UserController).to(UserController).inSingletonScope();
  
  // Bind the UserService
  options.bind(USER_TYPES.UserService).to(UserService).inSingletonScope();
});
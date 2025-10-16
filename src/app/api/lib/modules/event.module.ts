import 'reflect-metadata';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { EventService } from "../services/event.service";
import { EVENT_TYPES } from "../symbols/Symbols";
import { EventController } from "../controllers/event.controller";

export const EventModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind(EVENT_TYPES.EventController).to(EventController).inSingletonScope();
  options.bind(EVENT_TYPES.EventService).to(EventService).inSingletonScope();
});
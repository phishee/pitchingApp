import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { EventManagementService } from "../services/eventManagement.service";
import { EventGeneratorService } from "../services/eventGenerator.service";
import { RecurrenceCalculatorService } from "../services/recurrenceCalculator.service";
import { EVENT_MANAGEMENT_TYPES } from "../symbols/Symbols";

export const eventManagementModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  // Bind services
  options.bind(EVENT_MANAGEMENT_TYPES.RecurrenceCalculatorService).to(RecurrenceCalculatorService).inSingletonScope();

  options.bind(EVENT_MANAGEMENT_TYPES.EventGeneratorService).to(EventGeneratorService).inSingletonScope();

  options.bind(EVENT_MANAGEMENT_TYPES.EventManagementService).to(EventManagementService).inSingletonScope();

  // Bind RecurrenceCalculatorService with string identifier for EventGeneratorService
  options.bind('RecurrenceCalculatorService').to(RecurrenceCalculatorService).inSingletonScope();
});

import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { QuestionnaireService } from '../services/questionnaire.service';
import { QuestionnaireController } from '../controllers/questionnaire.controller';
import { QuestionnaireAssignmentService } from '../services/questionnaireAssignment.service';
import { QuestionnaireAssignmentController } from '../controllers/questionnaireAssignment.controller';
import { QUESTIONNAIRE_TYPES, QUESTIONNAIRE_ASSIGNMENT_TYPES } from '../symbols/Symbols';

export const QuestionnaireModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
    // Questionnaire
    options.bind<QuestionnaireService>(QUESTIONNAIRE_TYPES.QuestionnaireService).to(QuestionnaireService).inSingletonScope();
    options.bind<QuestionnaireController>(QUESTIONNAIRE_TYPES.QuestionnaireController).to(QuestionnaireController).inSingletonScope();

    // Assignment
    options.bind<QuestionnaireAssignmentService>(QUESTIONNAIRE_ASSIGNMENT_TYPES.QuestionnaireAssignmentService).to(QuestionnaireAssignmentService).inSingletonScope();
    options.bind<QuestionnaireAssignmentController>(QUESTIONNAIRE_ASSIGNMENT_TYPES.QuestionnaireAssignmentController).to(QuestionnaireAssignmentController).inSingletonScope();
});

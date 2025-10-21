import { Container } from "inversify";
import { dbModule } from "./modules/db.module";
import { UserModule } from "./modules/user.module";
import { TeamModule } from "./modules/team.module";
import { TeamMemberModule } from "./modules/team-member.module";
import { OrganizationModule } from "./modules/organization.module";
import { ExerciseModule } from "./modules/exercise.module";
import { WorkoutModule } from './modules/workout.module';
import { EventModule } from './modules/event.module';
import { WorkoutAssignmentModule } from './modules/workoutAssignment.module';
import { eventManagementModule } from './modules/eventManagement.module';
import { FacilityModule } from './modules/facility.module';

const container = new Container();
container.load(dbModule);
container.load(UserModule);
container.load(TeamModule);
container.load(TeamMemberModule);
container.load(OrganizationModule);
container.load(ExerciseModule);
container.load(WorkoutModule);
container.load(EventModule);
container.load(WorkoutAssignmentModule);
container.load(eventManagementModule);
container.load(FacilityModule);

export default container;
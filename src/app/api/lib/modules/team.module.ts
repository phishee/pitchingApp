// src/app/api/lib/modules/team.module.ts

import 'reflect-metadata';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { TeamService } from "@/app/api/lib/services/team.service";
import { TEAM_INVITATION_TYPES, TEAM_JOIN_REQUEST_TYPES, TEAM_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamController } from '../controllers/team.controller';
import { TeamInvitationService } from '../services/team-invitation.service';
import { TeamInvitationController } from '../controllers/teamInvitation.controller';
import { TeamJoinRequestService } from '../services/team-join-request.service';
import { TeamJoinRequestController } from '../controllers/team-join-request.controller';

export const TeamModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  // Bind controller using the symbol
  options.bind(TEAM_TYPES.TeamController).to(TeamController).inSingletonScope();
  
  // Bind the TeamService
  options.bind(TEAM_TYPES.TeamService).to(TeamService).inSingletonScope();

  // Bind the TeamInvitationService
  options.bind(TEAM_INVITATION_TYPES.TeamInvitationService).to(TeamInvitationService).inSingletonScope();

  // Bind the TeamInvitationController
  options.bind(TEAM_INVITATION_TYPES.TeamInvitationController).to(TeamInvitationController).inSingletonScope();

  // Bind the TeamJoinRequestService
  options.bind(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestService).to(TeamJoinRequestService).inSingletonScope();

  // Bind the TeamJoinRequestController
  options.bind(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController).to(TeamJoinRequestController).inSingletonScope();
});
// src/app/api/lib/modules/team-member.module.ts
import 'reflect-metadata';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { TeamMemberService } from "@/app/api/lib/services/team-member.service";
import { TEAM_MEMBER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamMemberController } from '../controllers/team-member.controller';

export const TeamMemberModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind(TEAM_MEMBER_TYPES.TeamMemberController).to(TeamMemberController).inSingletonScope();
  options.bind(TEAM_MEMBER_TYPES.TeamMemberService).to(TeamMemberService).inSingletonScope();
});
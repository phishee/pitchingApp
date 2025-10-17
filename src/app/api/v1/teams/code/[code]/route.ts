// src/app/api/v1/teams/code/[code]/route.ts

import { NextRequest } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamController } from "@/app/api/lib/controllers/team.controller";

export const GET = withAuth(async (
  req: AuthenticatedRequest,
  context: { params: Promise<{ code: string }> }
) => {
  const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
  return teamController.getTeamByCode(req, context);
});
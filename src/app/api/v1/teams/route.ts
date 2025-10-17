// src/app/api/v1/teams/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamController } from "@/app/api/lib/controllers/team.controller";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
    const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
    return teamController.createTeam(req);
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
    return teamController.getTeams(req);
});
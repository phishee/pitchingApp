// src/app/api/v1/teams/[teamId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamController } from "@/app/api/lib/controllers/team.controller";

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ teamId: string }> }) => {
    const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
    return teamController.getTeamById(req, { params: params.then(teamParams => ({ id: teamParams.teamId })) });
});

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ teamId: string }> }) => {
    const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
    return teamController.updateTeam(req, { params: params.then(teamParams => ({ id: teamParams.teamId })) });
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ teamId: string }> }) => {
    const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
    return teamController.deleteTeam(req, { params: params.then(teamParams => ({ id: teamParams.teamId })) });
});
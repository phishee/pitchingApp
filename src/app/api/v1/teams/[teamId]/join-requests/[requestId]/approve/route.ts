// src/app/api/v1/teams/[teamId]/join-requests/[requestId]/approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_JOIN_REQUEST_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamJoinRequestController } from "@/app/api/lib/controllers/team-join-request.controller";

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ teamId: string; requestId: string }> }) => {
    // const { teamId, requestId } = await params;
    const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
    return joinRequestController.approveJoinRequest(req, { params });
});
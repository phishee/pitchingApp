// src/app/api/v1/teams/[teamId]/join-requests/[id]/reject/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_JOIN_REQUEST_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamJoinRequestController } from "@/app/api/lib/controllers/team-join-request.controller";

export async function POST(req: NextRequest, context: { params: { teamId: string; requestId: string } }) {
    const { params } = await context;
    const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
    return joinRequestController.rejectJoinRequest(req, { params: { teamId: params.teamId, id: params.requestId } });
}
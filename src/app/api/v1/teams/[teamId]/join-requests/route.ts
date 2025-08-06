// src/app/api/v1/teams/[teamId]/join-requests/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_JOIN_REQUEST_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamJoinRequestController } from "@/app/api/lib/controllers/team-join-request.controller";

export async function POST(req: NextRequest, context: { params: { teamId: string } }) {
    const { params } = await context;
    const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
    return joinRequestController.createJoinRequest(req, { params });
}

export async function GET(req: NextRequest, context: { params: { teamId: string } }) {
    const { params } = await context;
    const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
    return joinRequestController.getJoinRequestsByTeam(req, { params });
}
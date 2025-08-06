// src/app/api/v1/teams/[teamId]/join-requests/[requestId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_JOIN_REQUEST_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamJoinRequestController } from "@/app/api/lib/controllers/team-join-request.controller";

export async function GET(
  req: NextRequest,
  context: Promise<{ params: Promise<{ teamId: string; requestId: string }> }>
) {
  const { params } = await context;
  const { teamId, requestId } = await params;
  const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
  return joinRequestController.getJoinRequestById(req, { params: { teamId, id: requestId } });
}

export async function PUT(
  req: NextRequest,
  context: Promise<{ params: Promise<{ teamId: string; requestId: string }> }>
) {
  const { params } = await context;
  const { teamId, requestId } = await params;
  const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
  return joinRequestController.updateJoinRequest(req, { params: { teamId, id: requestId } });
}

export async function DELETE(
  req: NextRequest,
  context: Promise<{ params: Promise<{ teamId: string; requestId: string }> }>
) {
  const { params } = await context;
  const { teamId, requestId } = await params;
  const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
  return joinRequestController.deleteJoinRequest(req, { params: { teamId, id: requestId } });
}
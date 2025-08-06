import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_JOIN_REQUEST_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamJoinRequestController } from "@/app/api/lib/controllers/team-join-request.controller";

export async function GET(
  req: NextRequest,
  context: Promise<{ params: Promise<{ userId: string }> }>
) {
  const { params } = await context;
  const { userId } = await params;
  
  const teamJoinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
  return teamJoinRequestController.getJoinRequestsByUser(req, userId);
}
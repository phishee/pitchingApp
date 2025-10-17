import { NextRequest } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_JOIN_REQUEST_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamJoinRequestController } from "@/app/api/lib/controllers/team-join-request.controller";

export const GET = withAuth(async (
  req: AuthenticatedRequest,
  context: { params: Promise<{ userId: string }> }
) => {
  const teamJoinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
  return teamJoinRequestController.getJoinRequestsByUser(req, context);
});
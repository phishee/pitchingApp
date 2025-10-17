// src/app/api/v1/teams/[teamId]/join-requests/[requestId]/route.ts

import { NextRequest } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_JOIN_REQUEST_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamJoinRequestController } from "@/app/api/lib/controllers/team-join-request.controller";

export const GET = withAuth(async (
  req: AuthenticatedRequest,
  context: { params: Promise<{ teamId: string; requestId: string }> }
) => {
  const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
  const transformedContext = {
    params: context.params.then(params => ({ teamId: params.teamId, id: params.requestId }))
  };
  return joinRequestController.getJoinRequestById(req, transformedContext);
});

export const PUT = withAuth(async (
  req: AuthenticatedRequest,
  context: { params: Promise<{ teamId: string; requestId: string }> }
) => {
  const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
  const transformedContext = {
    params: context.params.then(params => ({ teamId: params.teamId, id: params.requestId }))
  };
  return joinRequestController.updateJoinRequest(req, transformedContext);
});

export const DELETE = withAuth(async (
  req: AuthenticatedRequest,
  context: { params: Promise<{ teamId: string; requestId: string }> }
) => {
  const joinRequestController = container.get<TeamJoinRequestController>(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestController);
  const transformedContext = {
    params: context.params.then(params => ({ teamId: params.teamId, id: params.requestId }))
  };
  return joinRequestController.deleteJoinRequest(req, transformedContext);
});
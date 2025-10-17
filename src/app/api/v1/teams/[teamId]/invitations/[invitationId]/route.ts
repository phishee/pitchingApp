// src/app/api/v1/teams/[teamId]/invitations/[invitationId]/route.ts

import { NextRequest } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_INVITATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamInvitationController } from "@/app/api/lib/controllers/teamInvitation.controller";

export const GET = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ teamId: string; invitationId: string }> }) => {
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.getInvitationById(req, context);
});

export const PUT = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ teamId: string; invitationId: string }> }) => {
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.updateInvitation(req, context);
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ teamId: string; invitationId: string }> }) => {
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.deleteInvitation(req, context);
});
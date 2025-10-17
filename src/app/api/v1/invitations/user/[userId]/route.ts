
import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_INVITATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamInvitationController } from "@/app/api/lib/controllers/teamInvitation.controller";

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ userId: string }> }) => {
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.getInvitationsByUser(req, { params });
});


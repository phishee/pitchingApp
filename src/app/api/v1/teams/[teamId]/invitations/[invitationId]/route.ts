// src/app/api/v1/teams/[teamId]/invitations/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_INVITATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamInvitationController } from "@/app/api/lib/controllers/teamInvitation.controller";

export async function GET(req: NextRequest, context: { params: { teamId: string; invitationId: string } }) {
    const { params } = await context;
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.getInvitationById(req, { params });
}

export async function PUT(req: NextRequest, context: { params: { teamId: string; id: string } }) {
    const { params } = await context;
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.updateInvitation(req, { params });
}

export async function DELETE(req: NextRequest, context: { params: { teamId: string; id: string } }) {
    const { params } = await context;
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.deleteInvitation(req, { params });
}
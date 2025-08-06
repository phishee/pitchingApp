// src/app/api/v1/teams/[teamId]/invitations/[id]/reject/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_INVITATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamInvitationController } from "@/app/api/lib/controllers/teamInvitation.controller";

export async function POST(req: NextRequest, context: { params: { teamId: string; invitationId: string } }) {
    const { params } = await context;
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.rejectInvitation(req, { params });
}
// src/app/api/v1/teams/[teamId]/invitations/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_INVITATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamInvitationController } from "@/app/api/lib/controllers/teamInvitation.controller";

export async function POST(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.createInvitation(req, { params });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
    const invitationController = container.get<TeamInvitationController>(TEAM_INVITATION_TYPES.TeamInvitationController);
    return invitationController.getInvitationsByTeam(req, { params });
}
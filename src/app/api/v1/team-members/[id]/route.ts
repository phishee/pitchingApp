// src/app/api/v1/team-members/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_MEMBER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamMemberController } from "@/app/api/lib/controllers/team-member.controller";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const teamMemberController = container.get<TeamMemberController>(TEAM_MEMBER_TYPES.TeamMemberController);
    return teamMemberController.getTeamMemberById(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const teamMemberController = container.get<TeamMemberController>(TEAM_MEMBER_TYPES.TeamMemberController);
    return teamMemberController.updateTeamMember(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const teamMemberController = container.get<TeamMemberController>(TEAM_MEMBER_TYPES.TeamMemberController);
    return teamMemberController.deleteTeamMember(req, context);
}
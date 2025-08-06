// src/app/api/v1/team-members/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_MEMBER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamMemberController } from "@/app/api/lib/controllers/team-member.controller";

export async function POST(req: NextRequest) {
    const teamMemberController = container.get<TeamMemberController>(TEAM_MEMBER_TYPES.TeamMemberController);
    return teamMemberController.createTeamMember(req);
}

export async function GET(req: NextRequest) {
    const teamMemberController = container.get<TeamMemberController>(TEAM_MEMBER_TYPES.TeamMemberController);
    return teamMemberController.getTeamMembers(req);
}
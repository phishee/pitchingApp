// src/app/api/v1/team-members/team/[teamId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { TEAM_MEMBER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamMemberController } from "@/app/api/lib/controllers/team-member.controller";

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ teamId: string }> }) => {
    const teamMemberController = container.get<TeamMemberController>(TEAM_MEMBER_TYPES.TeamMemberController);
    return teamMemberController.getTeamMembersByTeam(req, { params });
});
import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_MEMBER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamMemberController } from "@/app/api/lib/controllers/team-member.controller";

export async function GET(
  req: NextRequest,
  context: Promise<{ params: Promise<{ userId: string }> }>
) {
  const { params } = await context;
  const { userId } = await params;
  
  const teamMemberController = container.get<TeamMemberController>(TEAM_MEMBER_TYPES.TeamMemberController);
  return teamMemberController.getTeamMembersByUser(req, userId);
}
// src/app/api/v1/teams/code/[code]/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamController } from "@/app/api/lib/controllers/team.controller";

export async function GET(
  req: NextRequest,
  context: { params: { code: string } }
) {
  const { params } = await context;
  const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
  return teamController.getTeamByCode(req, { params });
}
// src/app/api/v1/teams/[teamId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { TEAM_TYPES } from "@/app/api/lib/symbols/Symbols";
import { TeamController } from "@/app/api/lib/controllers/team.controller";

export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
    const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
    return teamController.getTeamById(req, { params: { id: params.teamId } });
}

export async function PUT(req: NextRequest, { params }: { params: { teamId: string } }) {
    const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
    return teamController.updateTeam(req, { params: { id: params.teamId } });
}

export async function DELETE(req: NextRequest, { params }: { params: { teamId: string } }) {
    const teamController = container.get<TeamController>(TEAM_TYPES.TeamController);
    return teamController.deleteTeam(req, { params: { id: params.teamId } });
}
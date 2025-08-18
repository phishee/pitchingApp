// src/app/api/lib/controllers/team.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TEAM_TYPES } from '@/app/api/lib/symbols/Symbols';
import { TeamService } from '@/app/api/lib/services/team.service';

@injectable()
export class TeamController {
  constructor(
    @inject(TEAM_TYPES.TeamService) private teamService: TeamService
  ) {}

  async createTeam(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const team = await this.teamService.createTeam(body);
      return NextResponse.json(team, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeams(req: NextRequest): Promise<NextResponse> {
    try {
      const teams = await this.teamService.listTeams();
      return NextResponse.json(teams);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeamById(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const team = await this.teamService.getTeamById(id);
      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      return NextResponse.json(team);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateTeam(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const body = await req.json();
      const team = await this.teamService.updateTeam(id, body);
      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      return NextResponse.json(team);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteTeam(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const success = await this.teamService.deleteTeam(id);
      if (!success) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Team deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeamsByOrganization(req: NextRequest, { params }: { params: Promise<{ organizationId: string }> }): Promise<NextResponse> {
    try {
      const { organizationId } = await params;
      const teams = await this.teamService.getTeamsByOrganization(organizationId);
      return NextResponse.json(teams);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeamMembers(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const members = await this.teamService.getTeamMembers(id);
      return NextResponse.json(members);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeamByCode(req: NextRequest, { params }: { params: Promise<{ code: string }> }): Promise<NextResponse> {
    try {
      const { code } = await params;
      const team = await this.teamService.getTeamByCode(code);
      return NextResponse.json(team);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
// src/app/api/lib/controllers/team.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TEAM_TYPES } from '@/app/api/lib/symbols/Symbols';
import { TeamService } from '@/app/api/lib/services/team.service';

@injectable()
export class TeamController {
  constructor(
    @inject(TEAM_TYPES.TeamService) private teamService: TeamService
  ) { }

  async createTeam(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const team = await this.teamService.createTeam(body);
      return NextResponse.json(team, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeams(_req: NextRequest): Promise<NextResponse> {
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
  async getUserTeams(req: NextRequest): Promise<NextResponse> {
    try {
      // Extract user ID from the authenticated request (assuming middleware populates this)
      // Note: In a real implementation, you'd get this from the auth context/token
      // For now, we'll assume the route handler passes the userId or we extract it from headers/token
      // But since we don't have direct access to the user context here without middleware integration
      // We will rely on the route handler to pass the userId if needed, or extract from header if available

      // However, looking at other controllers, it seems we might need to rely on the route wrapper
      // Let's assume the route handler will pass the userId in the params or we get it from a header

      // WAIT: The plan said "Extract userId from the authenticated request".
      // Let's check how other controllers do it.
      // WorkoutSessionController uses `req.user?.uid`. Let's see if we can use that.
      // But `NextRequest` doesn't have `user`. We need `AuthenticatedRequest`.

      // Let's cast req to any for now to access user, or import AuthenticatedRequest
      const userId = (req as any).user?.uid;

      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const teams = await this.teamService.getTeamsByUser(userId);
      return NextResponse.json(teams);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
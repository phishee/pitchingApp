// src/app/api/lib/controllers/team-member.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TEAM_MEMBER_TYPES } from '@/app/api/lib/symbols/Symbols';
import { TeamMemberService } from '@/app/api/lib/services/team-member.service';

@injectable()
export class TeamMemberController {
  constructor(
    @inject(TEAM_MEMBER_TYPES.TeamMemberService) private teamMemberService: TeamMemberService
  ) {}

  async createTeamMember(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const teamMember = await this.teamMemberService.createTeamMember(body);
      return NextResponse.json(teamMember, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeamMembers(req: NextRequest): Promise<NextResponse> {
    try {
      const teamMembers = await this.teamMemberService.listTeamMembers();
      return NextResponse.json(teamMembers);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeamMemberById(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const teamMember = await this.teamMemberService.getTeamMemberById(params.id);
      if (!teamMember) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }
      return NextResponse.json(teamMember);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateTeamMember(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const body = await req.json();
      const teamMember = await this.teamMemberService.updateTeamMember(params.id, body);
      if (!teamMember) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }
      return NextResponse.json(teamMember);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteTeamMember(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const success = await this.teamMemberService.deleteTeamMember(params.id);
      if (!success) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Team member deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeamMembersByTeam(req: NextRequest, { params }: { params: { teamId: string } }): Promise<NextResponse> {
    try {
      const teamMembers = await this.teamMemberService.getTeamMembersByTeam(params.teamId);
      return NextResponse.json(teamMembers);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getTeamMembersByUser(req: NextRequest, userId: string): Promise<NextResponse> {
    try {
      const teamMembers = await this.teamMemberService.getTeamMembersByUser(userId);
      return NextResponse.json(teamMembers);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
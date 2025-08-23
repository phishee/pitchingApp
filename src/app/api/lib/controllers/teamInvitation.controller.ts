// src/app/api/lib/controllers/team-invitation.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TEAM_INVITATION_TYPES, TEAM_MEMBER_TYPES } from '@/app/api/lib/symbols/Symbols';
import { TeamInvitationService } from '@/app/api/lib/services/team-invitation.service';
import { TeamMemberService } from '../services/team-member.service';

@injectable()
export class TeamInvitationController {
  constructor(
    @inject(TEAM_INVITATION_TYPES.TeamInvitationService) private invitationService: TeamInvitationService,
    @inject(TEAM_MEMBER_TYPES.TeamMemberService) private teamMemberService: TeamMemberService
  ) {}

  async createInvitation(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }): Promise<NextResponse> {
    try {
      const { teamId } = await params;
      const body = await req.json();
      // Automatically set the teamId from the URL params
      const invitationData = { ...body, teamId };
      const invitation = await this.invitationService.createInvitation(invitationData);
      return NextResponse.json(invitation, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getInvitationsByTeam(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }): Promise<NextResponse> {
    try {
      const { teamId } = await params;
      const invitations = await this.invitationService.getInvitationsByTeam(teamId);
      return NextResponse.json(invitations);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getInvitationById(req: NextRequest, { params }: { params: Promise<{ teamId: string; invitationId: string }> }): Promise<NextResponse> {
    try {
      const { teamId, invitationId } = await params;
      const invitation = await this.invitationService.getInvitationById(invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      return NextResponse.json(invitation);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateInvitation(req: NextRequest, { params }: { params: Promise<{ teamId: string; invitationId: string }> }): Promise<NextResponse> {
    try {
      const { teamId, invitationId } = await params;
      const body = await req.json();
      const invitation = await this.invitationService.getInvitationById(invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      const updatedInvitation = await this.invitationService.updateInvitation(invitationId, body);
      return NextResponse.json(updatedInvitation);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteInvitation(req: NextRequest, { params }: { params: Promise<{ teamId: string; invitationId: string }> }): Promise<NextResponse> {
    try {
      const { teamId, invitationId } = await params;
      const invitation = await this.invitationService.getInvitationById(invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      const success = await this.invitationService.deleteInvitation(invitationId);
      return NextResponse.json({ message: 'Invitation deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async acceptInvitation(req: NextRequest, { params }: { params: Promise<{ teamId: string; invitationId: string }> }): Promise<NextResponse> {
    try {
      const { teamId, invitationId } = await params;
      
      // Update the invitation status to accepted
      const updatedInvitation = await this.invitationService.acceptInvitation(invitationId);
      if (!updatedInvitation) {
        return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
      }

      // Create team member
      const teamMember = await this.teamMemberService.createTeamMember({
        teamId: teamId,
        userId: updatedInvitation.invitedUserId || updatedInvitation.invitedEmail,
        role: updatedInvitation.role || 'athlete',
        status: 'active',
        joinedAt: new Date(),
      });

      if (!teamMember) {
        return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
      }

      return NextResponse.json(teamMember);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async rejectInvitation(req: NextRequest, { params }: { params: Promise<{ teamId: string; invitationId: string }> }): Promise<NextResponse> {
    try {
      const { teamId, invitationId } = await params;
      const invitation = await this.invitationService.getInvitationById(invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      const updatedInvitation = await this.invitationService.rejectInvitation(invitationId);
      return NextResponse.json(updatedInvitation);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getInvitationsByUser(req: NextRequest, { params }: { params: Promise<{ userId: string }> }): Promise<NextResponse> {
    try {
      const { userId } = await params;
      const invitations = await this.invitationService.getInvitationsByUser(userId);
      return NextResponse.json(invitations);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
// src/app/api/lib/controllers/team-invitation.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TEAM_INVITATION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { TeamInvitationService } from '@/app/api/lib/services/team-invitation.service';

@injectable()
export class TeamInvitationController {
  constructor(
    @inject(TEAM_INVITATION_TYPES.TeamInvitationService) private invitationService: TeamInvitationService
  ) {}

  async createInvitation(req: NextRequest, { params }: { params: { teamId: string } }): Promise<NextResponse> {
    try {
      const body = await req.json();
      // Automatically set the teamId from the URL params
      const invitationData = { ...body, teamId: params.teamId };
      const invitation = await this.invitationService.createInvitation(invitationData);
      return NextResponse.json(invitation, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getInvitationsByTeam(req: NextRequest, { params }: { params: { teamId: string } }): Promise<NextResponse> {
    try {
      const invitations = await this.invitationService.getInvitationsByTeam(params.teamId);
      return NextResponse.json(invitations);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getInvitationById(req: NextRequest, { params }: { params: { teamId: string; invitationId: string } }): Promise<NextResponse> {
    try {
      const invitation = await this.invitationService.getInvitationById(params.invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      return NextResponse.json(invitation);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateInvitation(req: NextRequest, { params }: { params: { teamId: string; invitationId: string } }): Promise<NextResponse> {
    try {
      const body = await req.json();
      const invitation = await this.invitationService.getInvitationById(params.invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      const updatedInvitation = await this.invitationService.updateInvitation(params.invitationId, body);
      return NextResponse.json(updatedInvitation);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteInvitation(req: NextRequest, { params }: { params: { teamId: string; invitationId: string } }): Promise<NextResponse> {
    try {
      const invitation = await this.invitationService.getInvitationById(params.invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      const success = await this.invitationService.deleteInvitation(params.invitationId);
      return NextResponse.json({ message: 'Invitation deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async acceptInvitation(req: NextRequest, { params }: { params: { teamId: string; invitationId: string } }): Promise<NextResponse> {
    try {
      const invitation = await this.invitationService.getInvitationById(params.invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      const updatedInvitation = await this.invitationService.acceptInvitation(params.invitationId);
      return NextResponse.json(updatedInvitation);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async rejectInvitation(req: NextRequest, { params }: { params: { teamId: string; invitationId: string } }): Promise<NextResponse> {
    try {
      const invitation = await this.invitationService.getInvitationById(params.invitationId);
      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      // Validate that the invitation belongs to the specified team
      if (invitation.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      const updatedInvitation = await this.invitationService.rejectInvitation(params.invitationId);
      return NextResponse.json(updatedInvitation);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
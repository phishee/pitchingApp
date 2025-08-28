// src/app/api/lib/controllers/team-join-request.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TEAM_JOIN_REQUEST_TYPES, TEAM_MEMBER_TYPES } from '@/app/api/lib/symbols/Symbols';
import { TeamJoinRequestService } from '@/app/api/lib/services/team-join-request.service';
import { TeamMemberService } from '../services/team-member.service';

@injectable()
export class TeamJoinRequestController {
  constructor(
    @inject(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestService) private joinRequestService: TeamJoinRequestService,
    @inject(TEAM_MEMBER_TYPES.TeamMemberService) private teamMemberService: TeamMemberService
  ) { }

  async createJoinRequest(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }): Promise<NextResponse> {
    try {
      const { teamId } = await params;
      const body = await req.json();
      // Automatically set the teamId from the URL params
      const joinRequestData = { ...body, teamId };
      const joinRequest = await this.joinRequestService.createJoinRequest(joinRequestData);
      return NextResponse.json(joinRequest, { status: 201 });
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async getJoinRequestsByTeam(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }): Promise<NextResponse> {
    try {
      const { teamId } = await params;
      const joinRequests = await this.joinRequestService.getJoinRequestsByTeam(teamId);
      return NextResponse.json(joinRequests);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async getJoinRequestById(req: NextRequest, { params }: { params: Promise<{ teamId: string; id: string }> }): Promise<NextResponse> {
    try {
      const { teamId, id } = await params;
      const joinRequest = await this.joinRequestService.getJoinRequestById(id);
      if (!joinRequest) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      // Validate that the join request belongs to the specified team
      if (joinRequest.teamId !== teamId) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      return NextResponse.json(joinRequest);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async updateJoinRequest(req: NextRequest, { params }: { params: Promise<{ teamId: string; id: string }> }): Promise<NextResponse> {
    try {
      const { teamId, id } = await params;
      const body = await req.json();
      const joinRequest = await this.joinRequestService.getJoinRequestById(id);
      if (!joinRequest) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      // Validate that the join request belongs to the specified team
      if (joinRequest.teamId !== teamId) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      const updatedJoinRequest = await this.joinRequestService.updateJoinRequest(id, body);
      return NextResponse.json(updatedJoinRequest);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async deleteJoinRequest(req: NextRequest, { params }: { params: Promise<{ teamId: string; id: string }> }): Promise<NextResponse> {
    try {
      const { teamId, id } = await params;
      const joinRequest = await this.joinRequestService.getJoinRequestById(id);
      if (!joinRequest) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      // Validate that the join request belongs to the specified team
      if (joinRequest.teamId !== teamId) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      await this.joinRequestService.deleteJoinRequest(id); // Remove unused 'success' variable
      return NextResponse.json({ message: 'Join request deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async approveJoinRequest(req: NextRequest, { params }: { params: Promise<{ teamId: string; requestId: string }> }): Promise<NextResponse> {
    try {
      const { teamId, requestId } = await params;
      const updatedJoinRequest = await this.joinRequestService.approveJoinRequest(requestId);
      if (!updatedJoinRequest) {
        return NextResponse.json({ error: 'Failed to approve join request' }, { status: 500 });
      }

      const teamMember = await this.teamMemberService.createTeamMember({
        teamId: teamId,
        userId: updatedJoinRequest.requestedBy,
        role: updatedJoinRequest.role || 'athlete',
        status: 'active',
        joinedAt: new Date(),
      });

      if (!teamMember) {
        return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
      }

      return NextResponse.json(teamMember);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async rejectJoinRequest(req: NextRequest, { params }: { params: Promise<{ teamId: string; requestId: string }> }): Promise<NextResponse> {
    try {
      const { requestId } = await params; // Remove unused 'teamId' variable
      const body = await req.json();

      const updatedJoinRequest = await this.joinRequestService.rejectJoinRequest(requestId, body);
      if (!updatedJoinRequest) {
        return NextResponse.json({ error: 'Failed to reject join request' }, { status: 500 });
      }

      return NextResponse.json(updatedJoinRequest);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getJoinRequestsByUser(req: NextRequest, context: { params: Promise<{ userId: string }> }): Promise<NextResponse> {
    try {
      const { userId } = await context.params;
      const joinRequests = await this.joinRequestService.getJoinRequestsByUser(userId);
      return NextResponse.json(joinRequests);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
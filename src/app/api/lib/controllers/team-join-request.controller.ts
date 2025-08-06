// src/app/api/lib/controllers/team-join-request.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TEAM_JOIN_REQUEST_TYPES } from '@/app/api/lib/symbols/Symbols';
import { TeamJoinRequestService } from '@/app/api/lib/services/team-join-request.service';

@injectable()
export class TeamJoinRequestController {
  constructor(
    @inject(TEAM_JOIN_REQUEST_TYPES.TeamJoinRequestService) private joinRequestService: TeamJoinRequestService
  ) {}

  async createJoinRequest(req: NextRequest, { params }: { params: { teamId: string } }): Promise<NextResponse> {
    try {
      const body = await req.json();
      // Automatically set the teamId from the URL params
      const joinRequestData = { ...body, teamId: params.teamId };
      const joinRequest = await this.joinRequestService.createJoinRequest(joinRequestData);
      return NextResponse.json(joinRequest, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getJoinRequestsByTeam(req: NextRequest, { params }: { params: { teamId: string } }): Promise<NextResponse> {
    try {
      const joinRequests = await this.joinRequestService.getJoinRequestsByTeam(params.teamId);
      return NextResponse.json(joinRequests);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getJoinRequestById(req: NextRequest, { params }: { params: { teamId: string; id: string } }): Promise<NextResponse> {
    try {
      const joinRequest = await this.joinRequestService.getJoinRequestById(params.id);
      if (!joinRequest) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      // Validate that the join request belongs to the specified team
      if (joinRequest.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      return NextResponse.json(joinRequest);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateJoinRequest(req: NextRequest, { params }: { params: { teamId: string; id: string } }): Promise<NextResponse> {
    try {
      const body = await req.json();
      const joinRequest = await this.joinRequestService.getJoinRequestById(params.id);
      if (!joinRequest) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      // Validate that the join request belongs to the specified team
      if (joinRequest.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      const updatedJoinRequest = await this.joinRequestService.updateJoinRequest(params.id, body);
      return NextResponse.json(updatedJoinRequest);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteJoinRequest(req: NextRequest, { params }: { params: { teamId: string; id: string } }): Promise<NextResponse> {
    try {
      const joinRequest = await this.joinRequestService.getJoinRequestById(params.id);
      if (!joinRequest) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      // Validate that the join request belongs to the specified team
      if (joinRequest.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      const success = await this.joinRequestService.deleteJoinRequest(params.id);
      return NextResponse.json({ message: 'Join request deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async approveJoinRequest(req: NextRequest, { params }: { params: { teamId: string; id: string } }): Promise<NextResponse> {
    try {
      const joinRequest = await this.joinRequestService.getJoinRequestById(params.id);
      if (!joinRequest) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      // Validate that the join request belongs to the specified team
      if (joinRequest.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      const updatedJoinRequest = await this.joinRequestService.approveJoinRequest(params.id);
      return NextResponse.json(updatedJoinRequest);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async rejectJoinRequest(req: NextRequest, { params }: { params: { teamId: string; id: string } }): Promise<NextResponse> {
    try {
      const joinRequest = await this.joinRequestService.getJoinRequestById(params.id);
      if (!joinRequest) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      // Validate that the join request belongs to the specified team
      if (joinRequest.teamId !== params.teamId) {
        return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
      }
      const updatedJoinRequest = await this.joinRequestService.rejectJoinRequest(params.id);
      return NextResponse.json(updatedJoinRequest);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getJoinRequestsByUser(req: NextRequest, userId: string): Promise<NextResponse> {
    try {
      const joinRequests = await this.joinRequestService.getJoinRequestsByUser(userId);
      return NextResponse.json(joinRequests);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  
}
// src/app/api/lib/controllers/organization.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { ORGANIZATION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { OrganizationService } from '@/app/api/lib/services/organization.service';

@injectable()
export class OrganizationController {
  constructor(
    @inject(ORGANIZATION_TYPES.OrganizationService) private organizationService: OrganizationService
  ) {}

  async createOrganization(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const organization = await this.organizationService.createOrganization(body);
      return NextResponse.json(organization, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getOrganizations(req: NextRequest): Promise<NextResponse> {
    try {
      const organizations = await this.organizationService.listOrganizations();
      return NextResponse.json(organizations);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getOrganizationById(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const organization = await this.organizationService.getOrganizationById(params.id);
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json(organization);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateOrganization(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const body = await req.json();
      const organization = await this.organizationService.updateOrganization(params.id, body);
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json(organization);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteOrganization(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const success = await this.organizationService.deleteOrganization(params.id);
      if (!success) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Organization deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getOrganizationsByCreator(req: NextRequest, { params }: { params: { createdBy: string } }): Promise<NextResponse> {
    try {
      const organizations = await this.organizationService.getOrganizationsByCreator(params.createdBy);
      return NextResponse.json(organizations);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getOrganizationTeams(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const teams = await this.organizationService.getOrganizationTeams(params.id);
      return NextResponse.json(teams);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getOrganizationMembers(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const members = await this.organizationService.getOrganizationMembers(params.id);
      return NextResponse.json(members);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateOrganizationLogo(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { logoUrl } = body;
      
      if (!logoUrl) {
        return NextResponse.json({ error: 'Logo URL is required' }, { status: 400 });
      }

      const organization = await this.organizationService.updateOrganizationLogo(params.id, logoUrl);
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json(organization);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
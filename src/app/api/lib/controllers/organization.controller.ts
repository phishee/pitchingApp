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
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async getOrganizations(_req: NextRequest): Promise<NextResponse> { // Fix: Prefix unused param with underscore
    try {
      const organizations = await this.organizationService.listOrganizations();
      return NextResponse.json(organizations);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async getOrganizationById(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const organization = await this.organizationService.getOrganizationById(id);
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json(organization);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async updateOrganization(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const body = await req.json();
      const organization = await this.organizationService.updateOrganization(id, body);
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json(organization);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async deleteOrganization(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const success = await this.organizationService.deleteOrganization(id);
      if (!success) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Organization deleted successfully' });
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async getOrganizationsByCreator(req: NextRequest, { params }: { params: Promise<{ createdBy: string }> }): Promise<NextResponse> {
    try {
      const { createdBy } = await params;
      const organizations = await this.organizationService.getOrganizationsByCreator(createdBy);
      return NextResponse.json(organizations);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async getOrganizationTeams(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const teams = await this.organizationService.getOrganizationTeams(id);
      return NextResponse.json(teams);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async getOrganizationMembers(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const members = await this.organizationService.getOrganizationMembers(id);
      return NextResponse.json(members);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  async updateOrganizationLogo(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const body = await req.json();
      const { logoUrl } = body;
      
      if (!logoUrl) {
        return NextResponse.json({ error: 'Logo URL is required' }, { status: 400 });
      }

      const organization = await this.organizationService.updateOrganizationLogo(id, logoUrl);
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      return NextResponse.json(organization);
    } catch (err: unknown) { // Fix: Replace 'any' with 'unknown'
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
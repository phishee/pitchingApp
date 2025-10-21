// src/app/api/lib/controllers/facility.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { FACILITY_TYPES } from '@/app/api/lib/symbols/Symbols';
import { FacilityService } from '@/app/api/lib/services/facility.service';
import { Facility } from '@/models/Facility';

@injectable()
export class FacilityController {
  constructor(
    @inject(FACILITY_TYPES.FacilityService) private facilityService: FacilityService
  ) {}

  async createFacility(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const facility = await this.facilityService.createFacility(body);
      return NextResponse.json(facility, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getFacilities(_req: NextRequest): Promise<NextResponse> { 
    try {
      const facilities = await this.facilityService.listFacilities();
      return NextResponse.json(facilities);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getFacilityById(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const facility = await this.facilityService.getFacilityById(id);
      if (!facility) {
        return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
      }
      return NextResponse.json(facility);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateFacility(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const body = await req.json();
      const facility = await this.facilityService.updateFacility(id, body);
      if (!facility) {
        return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
      }
      return NextResponse.json(facility);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteFacility(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const success = await this.facilityService.deleteFacility(id);
      if (!success) {
        return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Facility deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getFacilitiesByOrganization(req: NextRequest, { params }: { params: Promise<{ organizationId: string }> }): Promise<NextResponse> {
    try {
      const { organizationId } = await params;
      const facilities = await this.facilityService.getFacilitiesByOrganization(organizationId);
      return NextResponse.json(facilities);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getPublicFacilities(_req: NextRequest): Promise<NextResponse> {
    try {
      const facilities = await this.facilityService.getPublicFacilities();
      return NextResponse.json(facilities);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getBookableFacilities(_req: NextRequest): Promise<NextResponse> {
    try {
      const facilities = await this.facilityService.getBookableFacilities();
      return NextResponse.json(facilities);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}

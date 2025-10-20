// src/app/api/v1/facilities/type/[type]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { FACILITY_TYPES } from "@/app/api/lib/symbols/Symbols";
import { FacilityService } from "@/app/api/lib/services/facility.service";
import { Facility } from "@/models/Facility";

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ type: string }> }) => {
    const facilityService = container.get<FacilityService>(FACILITY_TYPES.FacilityService);
    const { type } = await params;
    
    // Validate facility type
    const validTypes: Facility['type'][] = ['field', 'gym', 'indoor_facility', 'other'];
    if (!validTypes.includes(type as Facility['type'])) {
        return NextResponse.json({ error: 'Invalid facility type' }, { status: 400 });
    }
    
    try {
        const facilities = await facilityService.getFacilitiesByType(type as Facility['type']);
        return NextResponse.json(facilities);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
});

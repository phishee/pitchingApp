// src/app/api/v1/facilities/amenities/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { FACILITY_TYPES } from "@/app/api/lib/symbols/Symbols";
import { FacilityService } from "@/app/api/lib/services/facility.service";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const facilityService = container.get<FacilityService>(FACILITY_TYPES.FacilityService);
    const { searchParams } = new URL(req.url);
    const amenitiesParam = searchParams.get('amenities');
    
    if (!amenitiesParam) {
        return NextResponse.json({ error: 'Amenities parameter is required' }, { status: 400 });
    }
    
    try {
        const amenities = amenitiesParam.split(',').map(amenity => amenity.trim());
        const facilities = await facilityService.getFacilitiesWithAmenities(amenities);
        return NextResponse.json(facilities);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
});

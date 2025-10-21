// src/app/api/v1/facilities/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { FACILITY_TYPES } from "@/app/api/lib/symbols/Symbols";
import { FacilityService } from "@/app/api/lib/services/facility.service";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const facilityService = container.get<FacilityService>(FACILITY_TYPES.FacilityService);
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('q');
    
    if (!searchTerm) {
        return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
    }
    
    try {
        const facilities = await facilityService.searchFacilities(searchTerm);
        return NextResponse.json(facilities);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
});

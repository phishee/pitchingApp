// src/app/api/v1/facilities/organization/[organizationId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { FACILITY_TYPES } from "@/app/api/lib/symbols/Symbols";
import { FacilityController } from "@/app/api/lib/controllers/facility.controller";

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ organizationId: string }> }) => {
    const facilityController = container.get<FacilityController>(FACILITY_TYPES.FacilityController);
    return facilityController.getFacilitiesByOrganization(req, { params });
});

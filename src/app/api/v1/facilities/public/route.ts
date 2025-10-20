// src/app/api/v1/facilities/public/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { FACILITY_TYPES } from "@/app/api/lib/symbols/Symbols";
import { FacilityController } from "@/app/api/lib/controllers/facility.controller";

export const GET = async (req: NextRequest) => {
    const facilityController = container.get<FacilityController>(FACILITY_TYPES.FacilityController);
    return facilityController.getPublicFacilities(req);
};

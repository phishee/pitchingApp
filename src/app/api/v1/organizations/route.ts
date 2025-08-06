// src/app/api/v1/organizations/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { ORGANIZATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { OrganizationController } from "@/app/api/lib/controllers/organization.controller";

export async function POST(req: NextRequest) {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.createOrganization(req);
}

export async function GET(req: NextRequest) {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.getOrganizations(req);
}
// src/app/api/v1/organizations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { ORGANIZATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { OrganizationController } from "@/app/api/lib/controllers/organization.controller";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.createOrganization(req);
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.getOrganizations(req);
});
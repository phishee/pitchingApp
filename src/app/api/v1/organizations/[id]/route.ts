// src/app/api/v1/organizations/[id]/route.ts

import { NextRequest } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { ORGANIZATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { OrganizationController } from "@/app/api/lib/controllers/organization.controller";

export const GET = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.getOrganizationById(req, context);
});

export const PUT = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.updateOrganization(req, context);
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.deleteOrganization(req, context);
});
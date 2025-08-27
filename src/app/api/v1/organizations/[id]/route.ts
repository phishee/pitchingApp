// src/app/api/v1/organizations/[id]/route.ts

import { NextRequest } from "next/server";
import container from "@/app/api/lib/container";
import { ORGANIZATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { OrganizationController } from "@/app/api/lib/controllers/organization.controller";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.getOrganizationById(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.updateOrganization(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.deleteOrganization(req, context);
}
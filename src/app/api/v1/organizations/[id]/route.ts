// src/app/api/v1/organizations/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { ORGANIZATION_TYPES } from "@/app/api/lib/symbols/Symbols";
import { OrganizationController } from "@/app/api/lib/controllers/organization.controller";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.getOrganizationById(req, { params });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.updateOrganization(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const organizationController = container.get<OrganizationController>(ORGANIZATION_TYPES.OrganizationController);
    return organizationController.deleteOrganization(req, { params });
}
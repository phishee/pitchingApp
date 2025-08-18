// src/app/api/v1/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { USER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { UserController } from "@/app/api/lib/controllers/user.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.getUserByUserId(req, { params });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.updateUser(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.deleteUser(req, { params });
}
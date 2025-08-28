// src/app/api/v1/users/[id]/route.ts

import { NextRequest } from "next/server";
import container from "@/app/api/lib/container";
import { USER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { UserController } from "@/app/api/lib/controllers/user.controller";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.getUserByUserId(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.updateUser(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.deleteUser(req, context);
}
// src/app/api/v1/users/[id]/route.ts

import { NextRequest } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { USER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { UserController } from "@/app/api/lib/controllers/user.controller";

export const GET = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.getUserByUserId(req, context);
});

export const PUT = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.updateUser(req, context);
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.deleteUser(req, context);
});
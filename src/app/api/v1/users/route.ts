import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { USER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { UserController } from "@/app/api/lib/controllers/user.controller";

export const POST = withAuth(async (req: AuthenticatedRequest) => {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.createUser(req);
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.getUsers(req);
});
import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { USER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { UserController } from "@/app/api/lib/controllers/user.controller";


export async function POST(req: NextRequest) {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.createUser(req);
}

export async function GET(req: NextRequest) {
    const userController = container.get<UserController>(USER_TYPES.UserController);
    return userController.getUsers(req);
}
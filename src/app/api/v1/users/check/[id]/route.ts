// src/app/api/v1/users/check/[id]/route.ts
// This route doesn't require authentication and is used to check if a user exists in the database
// during the onboarding process

import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { USER_TYPES } from "@/app/api/lib/symbols/Symbols";
import { UserService } from "@/app/api/lib/services/user.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userService = container.get<UserService>(USER_TYPES.UserService);
    
    const user = await userService.getUserByUserId(id);
    
    if (!user) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }
    
    return NextResponse.json({ exists: true, user });
  } catch (err: any) {
    console.error('Error checking user existence:', err);
    return NextResponse.json({ exists: false, error: err.message }, { status: 500 });
  }
}

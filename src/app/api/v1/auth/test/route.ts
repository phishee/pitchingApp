// src/app/api/v1/auth/test/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  return NextResponse.json({
    message: 'Authentication successful!',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      email_verified: req.user.email_verified,
    },
    timestamp: new Date().toISOString(),
  });
});

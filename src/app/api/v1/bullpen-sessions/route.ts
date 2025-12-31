import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';
import container from '@/app/api/lib/container';
import { BULLPEN_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { BullpenSessionController } from '@/app/api/lib/controllers/bullpenSession.controller';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const controller = container.get<BullpenSessionController>(BULLPEN_SESSION_TYPES.BullpenSessionController);
        const result = await controller.createSession(request);

        // Ensure we handle potential error responses from controller if it returns object with error
        if (result && (result as any).error) {
            return NextResponse.json(result, { status: (result as any).status || 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to create bullpen session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
});
export const GET = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const controller = container.get<BullpenSessionController>(BULLPEN_SESSION_TYPES.BullpenSessionController);
        const result = await controller.getSessions(request);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to get bullpen sessions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
});

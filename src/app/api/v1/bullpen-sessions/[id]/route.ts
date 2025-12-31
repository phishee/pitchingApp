import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';
import container from '@/app/api/lib/container';
import { BULLPEN_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { BullpenSessionController } from '@/app/api/lib/controllers/bullpenSession.controller';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export const GET = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const { id } = await params;
        const controller = container.get<BullpenSessionController>(BULLPEN_SESSION_TYPES.BullpenSessionController);
        const result = await controller.getSessionById(id);

        if (!result) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch bullpen session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
});

export const PATCH = withAuth(async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
        const { id } = await params;
        const controller = container.get<BullpenSessionController>(BULLPEN_SESSION_TYPES.BullpenSessionController);
        const result = await controller.updateSession(id, request);

        if (!result) {
            return NextResponse.json(
                { error: 'Session not found or update failed' },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to update bullpen session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
});

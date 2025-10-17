// src/app/api/v1/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';
import container from '@/app/api/lib/container';
import { EVENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { EventController } from '@/app/api/lib/controllers/event.controller';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.createEvents(req);
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.listEvents(req);
});
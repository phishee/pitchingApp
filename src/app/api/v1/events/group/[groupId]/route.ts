// src/app/api/v1/events/group/[groupId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';
import container from '@/app/api/lib/container';
import { EVENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { EventController } from '@/app/api/lib/controllers/event.controller';

export const PATCH = withAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ groupId: string }> }
) => {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.bulkUpdateEventGroup(req, { params });
});

export const DELETE = withAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ groupId: string }> }
) => {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.bulkDeleteEventGroup(req, { params });
});
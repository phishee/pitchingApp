// src/app/api/v1/events/group/[groupId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { EVENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { EventController } from '@/app/api/lib/controllers/event.controller';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.bulkUpdateEventGroup(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.bulkDeleteEventGroup(req, { params });
}
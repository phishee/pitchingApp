// src/app/api/v1/events/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { EVENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { EventController } from '@/app/api/lib/controllers/event.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.getEventById(req, { params });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.updateEvent(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.deleteEvent(req, { params });
}
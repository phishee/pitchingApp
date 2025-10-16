// src/app/api/v1/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { EVENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { EventController } from '@/app/api/lib/controllers/event.controller';

export async function POST(req: NextRequest) {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.createEvents(req);
}

export async function GET(req: NextRequest) {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.listEvents(req);
}
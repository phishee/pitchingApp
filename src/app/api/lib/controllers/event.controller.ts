// src/app/api/lib/controllers/event.controller.ts

import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { EVENT_TYPES } from '../symbols/Symbols';
import { EventService } from '../services/event.service';

@injectable()
export class EventController {
  constructor(
    @inject(EVENT_TYPES.EventService) private eventService: EventService
  ) {}

  /**
   * POST /api/v1/events - Create events
   */
  async createEvents(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      
      if (!body.events || !Array.isArray(body.events)) {
        return NextResponse.json(
          { error: 'Request must include "events" array' },
          { status: 400 }
        );
      }

      const result = await this.eventService.createEvents(body);
      return NextResponse.json(result, { status: 201 });
    } catch (err: any) {
      console.error('Error creating events:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to create events' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/v1/events - List events with filters
   */
  async listEvents(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);

      const organizationId = searchParams.get('organizationId');
      
      if (!organizationId) {
        return NextResponse.json(
          { error: 'organizationId is required' },
          { status: 400 }
        );
      }

      // ✅ CRITICAL: Convert date strings to Date objects BEFORE passing to service
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (searchParams.get('startDate')) {
        startDate = new Date(searchParams.get('startDate')!);
      }
      
      if (searchParams.get('endDate')) {
        endDate = new Date(searchParams.get('endDate')!);
      }

      const filter: any = {
        organizationId,
        teamId: searchParams.get('teamId') || undefined,
        types: searchParams.get('types')?.split(',') || undefined,
        statuses: searchParams.get('statuses')?.split(',') || undefined,
        athleteIds: searchParams.get('athleteIds')?.split(',') || undefined,
        athleteMemberIds: searchParams.get('athleteMemberIds')?.split(',') || undefined,
        coachIds: searchParams.get('coachIds')?.split(',') || undefined,
        coachMemberIds: searchParams.get('coachMemberIds')?.split(',') || undefined,
        bookingStatus: searchParams.get('bookingStatus') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        includeDetails: searchParams.get('includeDetails') !== 'false',
        startDate,  // ✅ Already Date objects
        endDate     // ✅ Already Date objects
      };

      // Handle sorting
      const sortField = searchParams.get('sort');
      const sortOrder = searchParams.get('order') === 'desc' ? -1 : 1;
      
      if (sortField) {
        filter.sort = { [sortField]: sortOrder };
      }

      const events = await this.eventService.listEventsWithFilters(filter);
      
      console.log(`[Controller] Found ${events.length} events`);
      
      return NextResponse.json(events);
    } catch (err: any) {
      console.error('Error listing events:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to list events' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/v1/events/:id - Get single event
   */
  async getEventById(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id } = await params;
      const event = await this.eventService.getEventById(id);

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(event);
    } catch (err: any) {
      console.error('Error getting event:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to get event' },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH /api/v1/events/:id - Update single event
   */
  async updateEvent(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id } = await params;
      const body = await req.json();

      const event = await this.eventService.updateEvent(id, body);

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(event);
    } catch (err: any) {
      console.error('Error updating event:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to update event' },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/v1/events/:id - Delete single event
   */
  async deleteEvent(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id } = await params;
      const success = await this.eventService.deleteEvent(id);

      if (!success) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (err: any) {
      console.error('Error deleting event:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to delete event' },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH /api/v1/events/group/:groupId - Bulk update event group
   */
  async bulkUpdateEventGroup(
    req: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
  ): Promise<NextResponse> {
    try {
      const { groupId } = await params;
      const body = await req.json();

      const count = await this.eventService.bulkUpdateEventGroup(groupId, body);

      return NextResponse.json({
        message: `Successfully updated ${count} events`,
        updatedCount: count
      });
    } catch (err: any) {
      console.error('Error bulk updating events:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to bulk update events' },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/v1/events/group/:groupId - Bulk delete event group
   */
  async bulkDeleteEventGroup(
    req: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
  ): Promise<NextResponse> {
    try {
      const { groupId } = await params;
      const count = await this.eventService.bulkDeleteEventGroup(groupId);

      return NextResponse.json({
        message: `Successfully deleted ${count} events`,
        deletedCount: count
      });
    } catch (err: any) {
      console.error('Error bulk deleting events:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to bulk delete events' },
        { status: 500 }
      );
    }
  }
}
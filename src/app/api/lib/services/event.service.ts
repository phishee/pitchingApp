import { Event, CreateEventRequest, CreateEventResponse, RepetitionConfig, DayOfWeek, UserInfo, EventTemplate } from '@/models/Calendar';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';
import { DBProviderFactory } from '../factories/DBFactory';

@injectable()
export class EventService {
    private eventRepo;
    private eventCollection = 'events';

    constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
        this.eventRepo = this.dbFactory.createDBProvider();
    }

    /**
     * Factory method to create events based on request type
     */
    async createEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
        try {
            switch (request.creationType) {
                case 'simple':
                    return await this.createSimpleEvent(request);
                
                case 'repeated-single-user':
                    return await this.createRepeatedEventSingleUser(request);
                
                case 'repeated-multiple-users':
                    return await this.createRepeatedEventMultipleUsers(request);
                
                default:
                    throw new Error('Invalid creation type');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    /**
     * Type 1: Create a simple single event
     * Frontend sends complete event object, backend just adds id (MongoDB) and timestamps
     */
    private async createSimpleEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
        if (request.creationType !== 'simple') {
            throw new Error('Invalid request type');
        }

        const eventToCreate: Omit<Event, 'id'> = {
            ...request.event,
            groupId: '', // No groupId for simple events
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const createdEvent = await this.eventRepo.insert(this.eventCollection, eventToCreate);
        
        return {
            success: true,
            events: [createdEvent],
            message: 'Event created successfully'
        };
    }

    /**
     * Type 2: Create repeated events for a single user
     * Frontend sends event template, backend generates multiple events with same groupId
     */
    private async createRepeatedEventSingleUser(request: CreateEventRequest): Promise<CreateEventResponse> {
        if (request.creationType !== 'repeated-single-user') {
            throw new Error('Invalid request type');
        }

        const { repetitionConfig, participant, eventTemplate } = request;
        
        // Generate unique groupId using timestamp
        const groupId = `group-${Date.now()}`;
        
        // Check if groupId already exists (unlikely but safety check)
        const existingGroup = await this.eventRepo.findQuery(
            this.eventCollection,
            { groupId }
        );
        
        if (existingGroup.length > 0) {
            throw new Error('GroupId collision detected. Please retry.');
        }

        // Generate event dates based on repetition config
        const eventDates = this.generateEventDates(repetitionConfig);
        
        // Cast eventTemplate to access optional participants (it's omitted in the type but may exist at runtime)
        const templateWithParticipants = eventTemplate as EventTemplate;
        
        // Create events by applying dates to the template
        const events: Omit<Event, 'id'>[] = eventDates.map((dateInfo, index) => ({
            ...eventTemplate,
            groupId,
            startTime: dateInfo.startTime,
            endTime: dateInfo.endTime,
            participants: {
                athletes: [participant],
                coaches: templateWithParticipants.participants?.coaches || [],
                required: [participant.userId],
                optional: templateWithParticipants.participants?.optional || []
            },
            sequenceNumber: index + 1,
            totalInSequence: eventDates.length,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        // Bulk insert events
        const createdEvents = await this.eventRepo.insertMany(this.eventCollection, events);
        
        return {
            success: true,
            events: createdEvents,
            message: `${createdEvents.length} events created successfully for user`
        };
    }

    /**
     * Type 3: Create repeated events for multiple users
     * Each user gets their own event series with unique groupId
     */
    private async createRepeatedEventMultipleUsers(request: CreateEventRequest): Promise<CreateEventResponse> {
        if (request.creationType !== 'repeated-multiple-users') {
            throw new Error('Invalid request type');
        }

        const { repetitionConfig, participants, eventTemplate } = request;
        
        // Generate event dates based on repetition config
        const eventDates = this.generateEventDates(repetitionConfig);
        
        // Cast eventTemplate to access optional participants
        const templateWithParticipants = eventTemplate as EventTemplate;
        
        const allEvents: Omit<Event, 'id'>[] = [];
        
        // For each participant, create their own set of events with unique groupId
        for (const participant of participants) {
            const groupId = `group-${Date.now()}-${participant.userId}`;
            
            // Create events for this participant
            const participantEvents: Omit<Event, 'id'>[] = eventDates.map((dateInfo, index) => ({
                ...eventTemplate,
                groupId,
                startTime: dateInfo.startTime,
                endTime: dateInfo.endTime,
                participants: {
                    athletes: [participant],
                    coaches: templateWithParticipants.participants?.coaches || [],
                    required: [participant.userId],
                    optional: templateWithParticipants.participants?.optional || []
                },
                sequenceNumber: index + 1,
                totalInSequence: eventDates.length,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            
            allEvents.push(...participantEvents);
            
            // Small delay to ensure unique timestamp for groupId
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Bulk insert all events
        const createdEvents = await this.eventRepo.insertMany(this.eventCollection, allEvents);
        
        return {
            success: true,
            events: createdEvents,
            message: `${createdEvents.length} events created successfully for ${participants.length} users`
        };
    }

    /**
     * Helper: Generate event dates and times based on repetition configuration
     */
    private generateEventDates(config: RepetitionConfig): { startTime: Date; endTime: Date }[] {
        const dates: { startTime: Date; endTime: Date }[] = [];
        const startDate = new Date(config.startDate);
        
        if (config.pattern === 'none') {
            // Just return the start date (time should already be in the template)
            dates.push({
                startTime: startDate,
                endTime: startDate
            });
            return dates;
        }

        if (config.pattern === 'daily') {
            const occurrences = config.occurrences || 1;
            const interval = config.interval || 1;
            
            for (let i = 0; i < occurrences; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + (i * interval));
                dates.push({
                    startTime: new Date(date),
                    endTime: new Date(date)
                });
            }
        } else if (config.pattern === 'weekly' || config.pattern === 'custom') {
            if (!config.daysOfWeek || config.daysOfWeek.length === 0) {
                throw new Error('daysOfWeek is required for weekly/custom patterns');
            }

            const numberOfWeeks = config.numberOfWeeks || 1;
            const interval = config.interval || 1;
            const dayMap: { [key in DayOfWeek]: number } = {
                sunday: 0,
                monday: 1,
                tuesday: 2,
                wednesday: 3,
                thursday: 4,
                friday: 5,
                saturday: 6
            };

            const generatedDates: Date[] = [];

            for (let week = 0; week < numberOfWeeks; week += interval) {
                for (const dayOfWeek of config.daysOfWeek) {
                    const targetDay = dayMap[dayOfWeek];
                    const date = new Date(startDate);
                    
                    // Calculate which week we're in
                    date.setDate(date.getDate() + (week * 7));
                    
                    // Find the next occurrence of the target day
                    const currentDay = date.getDay();
                    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
                    date.setDate(date.getDate() + daysUntilTarget);
                    
                    // Only add if the date is not before start date
                    if (date >= startDate) {
                        generatedDates.push(new Date(date));
                    }
                }
            }
            
            // Sort dates chronologically
            generatedDates.sort((a, b) => a.getTime() - b.getTime());
            
            // Apply time overrides if provided
            for (const date of generatedDates) {
                let startTime = new Date(date);
                let endTime = new Date(date);
                
                // Check if there's a time override for this day of week
                if (config.timeOverrides) {
                    const dayName = this.getDayName(date.getDay());
                    const override = config.timeOverrides.find(o => o.dayOfWeek === dayName);
                    
                    if (override) {
                        if (override.startTime) {
                            startTime = this.combineDateTime(date, override.startTime);
                        }
                        if (override.endTime) {
                            endTime = this.combineDateTime(date, override.endTime);
                        }
                    }
                }
                
                dates.push({ startTime, endTime });
            }
            
            // If endDate is specified, filter out dates after it
            if (config.endDate) {
                const endDate = new Date(config.endDate);
                const filtered = dates.filter(d => d.startTime <= endDate);
                return filtered;
            }
            
            // If occurrences is specified, limit to that number
            if (config.occurrences) {
                return dates.slice(0, config.occurrences);
            }
        }

        return dates;
    }

    /**
     * Helper: Get day name from day number
     */
    private getDayName(dayNumber: number): DayOfWeek {
        const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[dayNumber];
    }

    /**
     * Helper: Combine date and time string
     */
    private combineDateTime(date: Date, timeString: string): Date {
        const [hours, minutes] = timeString.split(':').map(Number);
        const combined = new Date(date);
        combined.setHours(hours, minutes, 0, 0);
        return combined;
    }

    /**
     * Get events by various filters
     */
    async getEvents(filter: {
        organizationId?: string;
        teamId?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        type?: string;
        status?: string;
    }): Promise<Event[]> {
        try {
            const query: any = {};
            
            if (filter.organizationId) {
                query.organizationId = filter.organizationId;
            }
            
            if (filter.teamId) {
                query.teamId = filter.teamId;
            }
            
            if (filter.userId) {
                query['participants.athletes.userId'] = filter.userId;
            }
            
            if (filter.type) {
                query.type = filter.type;
            }
            
            if (filter.status) {
                query.status = filter.status;
            }
            
            if (filter.startDate || filter.endDate) {
                query.startTime = {};
                if (filter.startDate) {
                    query.startTime.$gte = filter.startDate;
                }
                if (filter.endDate) {
                    query.startTime.$lte = filter.endDate;
                }
            }
            
            const events = await this.eventRepo.findQuery(this.eventCollection, query);
            return events;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw new Error('Failed to fetch events');
        }
    }

    /**
     * Get event by ID
     */
    async getEventById(id: string): Promise<Event | null> {
        try {
            return await this.eventRepo.findById(this.eventCollection, id);
        } catch (error) {
            console.error('Error fetching event:', error);
            throw new Error('Failed to fetch event');
        }
    }

    /**
     * Get events by groupId
     */
    async getEventsByGroupId(groupId: string): Promise<Event[]> {
        try {
            return await this.eventRepo.findQuery(this.eventCollection, { groupId });
        } catch (error) {
            console.error('Error fetching events by groupId:', error);
            throw new Error('Failed to fetch events by groupId');
        }
    }

    /**
     * Update event
     */
    async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
        try {
            return await this.eventRepo.update(this.eventCollection, id, {
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating event:', error);
            throw new Error('Failed to update event');
        }
    }

    /**
     * Delete event
     */
    async deleteEvent(id: string): Promise<boolean> {
        try {
            await this.eventRepo.deleteById(this.eventCollection, id);
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw new Error('Failed to delete event');
        }
    }

    /**
     * Delete events by groupId
     */
    async deleteEventsByGroupId(groupId: string): Promise<number> {
        try {
            const events = await this.getEventsByGroupId(groupId);
            for (const event of events) {
                await this.deleteEvent(event.id);
            }
            return events.length;
        } catch (error) {
            console.error('Error deleting events by groupId:', error);
            throw new Error('Failed to delete events by groupId');
        }
    }
}

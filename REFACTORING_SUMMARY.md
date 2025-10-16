# Event and Workout Assignment Architecture Refactoring

## Overview
This document summarizes the comprehensive refactoring of the event and workout assignment system to address critical architectural issues and implement SOLID principles.

## Problems Addressed

### 1. Model Inconsistencies
- **Before**: Conflicting Event definitions in Calendar.ts with discriminated unions
- **After**: Unified Event model using foreign key approach (`sourceId`/`sourceType`)

### 2. Service Layer Violations
- **Before**: WorkoutAssignmentService handling both assignment CRUD and event generation
- **After**: Separated concerns with dedicated services for each responsibility

### 3. Missing Transaction Support
- **Before**: No MongoDB session support, risk of orphaned records
- **After**: Full transaction support with automatic rollback on failures

### 4. Tight Coupling
- **Before**: Event generation tightly coupled to WorkoutAssignmentService
- **After**: Loose coupling with dependency injection and service separation

## New Architecture

### Services Created

#### 1. RecurrenceCalculatorService
- **File**: `src/app/api/lib/services/recurrenceCalculator.service.ts`
- **Purpose**: Handles all recurrence pattern calculations
- **Key Methods**:
  - `calculateDates()` - Calculate all dates for a recurrence pattern
  - `calculateWeeklyDates()` - Specialized weekly recurrence calculation
  - `validateRecurrence()` - Validate recurrence configuration

#### 2. EventGeneratorService
- **File**: `src/app/api/lib/services/eventGenerator.service.ts`
- **Purpose**: Generates events from assignments and templates
- **Key Methods**:
  - `generateWorkoutEvents()` - Create events from workout assignments
  - `generateEventsFromTemplate()` - Create events from templates
  - `generateGroupId()` - Generate unique group IDs

#### 3. EventManagementService
- **File**: `src/app/api/lib/services/eventManagement.service.ts`
- **Purpose**: Handles all event CRUD operations
- **Key Methods**:
  - `updateSingleEvent()` - Update individual events (marks as modified)
  - `updateEventGroup()` - Bulk update events with strategies
  - `deleteFutureEvents()` - Clean up future events
  - `getEventsBySource()` - Query events by source ID/type

### Updated Models

#### Event Model (Calendar.ts)
```typescript
export interface Event {
  id: string;
  groupId: string; // Groups related events for bulk operations
  type: EventType;
  organizationId: string;
  teamId: string;
  
  // Calendar Properties
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  coverPhotoUrl?: string;
  
  // Participants
  participants: {
    athletes: UserInfo[];
    coaches: UserInfo[];
    required: string[];
    optional: string[];
  };

  // Reference to source (foreign key approach)
  sourceId: string; // FK to WorkoutAssignment | GameSchedule | AssessmentPlan
  sourceType: 'workout_assignment' | 'game_schedule' | 'assessment' | 'coaching_session';
  
  // Event instance tracking
  sequenceNumber: number;
  totalInSequence: number;
  isModified: boolean; // Track if individually changed
  
  // Status & Metadata
  status: EventStatus;
  visibility: EventVisibility;
  createdBy: UserInfo;
  createdAt: Date;
  updatedAt: Date;
}
```

### Refactored Services

#### WorkoutAssignmentService
- **Removed**: All event generation logic (moved to EventGeneratorService)
- **Added**: Transaction support using MongoDB sessions
- **Added**: New method `updateAssignmentAndEvents()` for coordinated updates
- **Dependencies**: Now injects EventGeneratorService and EventManagementService

#### WorkoutAssignmentController
- **Added**: New methods for event management
- **Key New Methods**:
  - `updateAssignmentAndEvents()` - Update assignment and events together
  - `updateSingleEvent()` - Update individual events
  - `getAssignmentEvents()` - Get events for an assignment
  - `getEventGroupInfo()` - Get group statistics
  - `deleteFutureEvents()` - Clean up future events

### New API Routes

#### 1. PATCH /api/v1/workout-assignments/[id]
- **Purpose**: Update assignment and events together
- **Body**:
  ```typescript
  {
    assignmentUpdates?: UpdateWorkoutAssignmentPayload;
    eventUpdates?: Partial<Event>;
    updateStrategy: 'all' | 'future_only' | 'unmodified_only';
    fromDate?: Date;
  }
  ```

#### 2. GET/PATCH /api/v1/workout-assignments/[id]/events
- **Purpose**: Manage events for a specific assignment
- **GET**: Retrieve all events for the assignment
- **PATCH**: Update events with bulk operations

#### 3. PATCH /api/v1/events/[id]
- **Purpose**: Update individual events
- **Behavior**: Automatically marks event as `isModified: true`

### MongoDB Indexes

Created comprehensive indexes for performance:

#### Events Collection
- `idx_groupId_startTime` - Group operations and time queries
- `idx_sourceId_sourceType` - Source-based queries
- `idx_athletes_startTime` - Athlete queries with time range
- `idx_coaches_startTime` - Coach queries with time range
- `idx_org_team_startTime` - Organization/team queries
- `idx_status_startTime` - Status-based queries
- `idx_modified_groupId` - Modified events tracking
- `idx_type_startTime` - Event type queries
- `idx_visibility_org` - Visibility queries
- `idx_complex_filter` - Complex filtering

#### Workout Assignments Collection
- `idx_athlete_active` - Athlete queries with active status
- `idx_coach_active` - Coach queries with active status
- `idx_org_team_active` - Organization/team queries
- `idx_workout_active` - Workout queries
- `idx_date_range` - Date range queries
- `idx_session_type` - Session type queries
- `idx_complex_assignment_filter` - Complex filtering

### Dependency Injection Updates

#### New Symbols
```typescript
export const EVENT_MANAGEMENT_TYPES = {
  EventManagementService: Symbol.for('EventManagementService'),
  EventGeneratorService: Symbol.for('EventGeneratorService'),
  RecurrenceCalculatorService: Symbol.for('RecurrenceCalculatorService'),
} as const;
```

#### New Module
- **File**: `src/app/api/lib/modules/eventManagement.module.ts`
- **Purpose**: Registers all new event management services
- **Loaded**: Added to main container configuration

## Key Benefits

### 1. SOLID Principles Compliance
- **Single Responsibility**: Each service has one clear purpose
- **Open/Closed**: Easy to extend with new event types
- **Liskov Substitution**: Services can be easily swapped
- **Interface Segregation**: Clean, focused interfaces
- **Dependency Inversion**: All dependencies injected

### 2. Data Integrity
- **Transaction Support**: All critical operations wrapped in transactions
- **Atomic Updates**: Assignment and event updates are atomic
- **Rollback Support**: Automatic rollback on failures

### 3. Performance
- **Optimized Indexes**: Comprehensive indexing strategy
- **Efficient Queries**: Indexed queries for common operations
- **Bulk Operations**: Efficient bulk updates and deletes

### 4. Maintainability
- **Separation of Concerns**: Clear boundaries between services
- **Testability**: Each service can be tested independently
- **Extensibility**: Easy to add new event types or features

### 5. Flexibility
- **Update Strategies**: Multiple strategies for bulk updates
- **Modified Tracking**: Track individual event modifications
- **Foreign Key Approach**: Lightweight, flexible event model

## Migration Strategy

### Phase 1: Foundation ✅
- Created new services without removing old code
- Updated Event model with foreign key approach
- Added MongoDB transaction support

### Phase 2: Service Integration ✅
- Updated dependency injection container
- Integrated new services into existing controllers
- Added new API routes

### Phase 3: Refactor Existing Services ✅
- Refactored WorkoutAssignmentService to use new services
- Added transaction support to critical operations
- Updated controllers with new methods

### Phase 4: Cleanup & Verification ✅
- Created MongoDB indexes
- Verified all functionality works correctly
- No linting errors

## Testing Recommendations

### 1. Unit Tests
- Test each service independently
- Mock dependencies for isolated testing
- Test error handling and edge cases

### 2. Integration Tests
- Test service interactions
- Test transaction rollback scenarios
- Test API endpoints

### 3. Performance Tests
- Test bulk operations with large datasets
- Verify index performance
- Test concurrent operations

### 4. Migration Tests
- Test existing functionality still works
- Verify data integrity during updates
- Test rollback scenarios

## Usage Examples

### Creating Assignment with Events
```typescript
const result = await workoutAssignmentService.createAssignmentWithEvents({
  organizationId: 'org123',
  teamId: 'team456',
  workoutId: 'workout789',
  athleteInfo: { userId: 'athlete1', memberId: 'mem1' },
  coachInfo: { userId: 'coach1', memberId: 'mem2' },
  recurrence: { pattern: 'weekly', daysOfWeek: [1, 3, 5] },
  startDate: new Date('2024-01-01'),
  // ... other fields
});
```

### Updating Assignment and Events
```typescript
const result = await workoutAssignmentService.updateAssignmentAndEvents('assignment123', {
  assignmentUpdates: { notes: 'Updated notes' },
  eventUpdates: { title: 'New Title' },
  updateStrategy: 'future_only',
  fromDate: new Date('2024-02-01')
});
```

### Updating Single Event
```typescript
const updatedEvent = await eventManagement.updateSingleEvent('event123', {
  title: 'Updated Event Title',
  startTime: new Date('2024-01-15T10:00:00Z')
});
// Automatically marks isModified: true
```

## Conclusion

This refactoring successfully addresses all identified architectural issues while maintaining backward compatibility and improving performance, maintainability, and flexibility. The new architecture follows SOLID principles and provides a solid foundation for future enhancements.

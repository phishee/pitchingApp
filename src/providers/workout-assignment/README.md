# Workout Assignment Architecture

This directory contains the new clean architecture for workout assignment and calendar event creation.

## Architecture Overview

The workout assignment system follows a **detached step state** pattern where each wizard step manages its own isolated state, and an orchestrator combines them only when creating the final payload.

### Core Principles

1. **Isolated State**: Each step context manages its own data independently
2. **No Reactive Syncing**: No `useEffect` syncing between contexts
3. **Build Once, Submit Once**: Payload is built only when "Create" is clicked
4. **Backend Handles Recurrence**: Client sends config, backend expands occurrences

## Directory Structure

```
workout-assignment/
├── athlete-selection.context.tsx      # Step 1: Athlete selection state
├── workout-selection.context.tsx      # Step 2: Workout selection state
├── exercise-prescription.context.tsx  # Step 3: Exercise customization state
├── schedule-config.context.tsx        # Step 4: Schedule configuration state
├── assignment-orchestrator.context.tsx # Combines all contexts, handles submission
└── README.md                          # This file
```

## Data Flow

```
Step Contexts (isolated state) 
  → Orchestrator (builds payload on submit)
    → WorkoutAssignmentService (business logic)
      → API (creates assignment + events)
        → Backend (expands recurrence, creates events)
```

## Migration Notes

**Removed Files (replaced by this architecture):**
- `event-creation-context.tsx` - Old circular dependency architecture
- `work-assignment-hooks.ts` - Old hooks with state syncing issues

**Benefits of New Architecture:**
- No duplicate events bug
- No circular state updates
- Single source of truth per concern
- Easier to test and maintain
- Clear separation of concerns

## Usage Example

```tsx
import { AssignmentOrchestratorProvider } from '@/providers/workout-assignment/assignment-orchestrator.context';

function MyComponent() {
  return (
    <AssignmentOrchestratorProvider
      organizationId="org-123"
      teamId="team-456"
      currentUserId="user-789"
    >
      {/* Your wizard steps here */}
    </AssignmentOrchestratorProvider>
  );
}
```

## Validation

The orchestrator provides validation methods:
- `isValid()` - Check if all required data is present
- `getValidationErrors()` - Get array of validation error messages
- `getTotalEvents()` - Calculate total events that will be created

## Future Enhancements

- Support for multiple athletes in single assignment
- Batch assignment operations
- Assignment templates
- Recurring assignment patterns



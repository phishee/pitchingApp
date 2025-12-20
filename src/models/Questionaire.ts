import { UserInfo } from "./User";

export interface QuestionnaireTemplate {
    _id: string;

    // Ownership - null means system-level template
    organizationId: string | null;
    pictureIcon?: string;

    // Metadata
    name: string;                    // "Sleep Quality Check"
    description: string;             // "Daily sleep tracking questionnaire"
    category: 'wellness' | 'recovery' | 'readiness' | 'pain' | 'custom';
    tags: string[];

    // UI Customization
    icon?: string;          // Icon name from Lucide (e.g. "Moon", "Heart")
    colorTheme?: string;    // Color theme key (e.g. "indigo", "green")

    // Who should complete this
    targetRoles: ('athlete' | 'coach')[];  // Usually ['athlete']

    // Questions in order
    questions: Question[];

    // Estimated completion time in seconds
    estimatedDuration: number;

    // Status
    isActive: boolean;

    // Audit
    createdBy: UserInfo | null;      // null for system templates
    createdAt: Date;
    updatedAt: Date;
}

export type QuestionType =
    | 'single_choice'      // Radio buttons
    | 'multiple_choice'    // Checkboxes
    | 'numeric_scale'      // Slider (1-10, 1-5, etc.)
    | 'numeric_input'      // Free number entry
    | 'text_input'         // Free text
    | 'time_input';        // Time picker (HH:MM)

export interface ChoiceOption {
    id: string;            // "option_good"
    label: string;         // "Good"
    value: number;         // 3 (for analytics)
    color?: string;        // "#22C55E" (green)
    emoji?: string;        // "🟢"
}

export interface NumericScaleConfig {
    min: number;           // 1
    max: number;           // 10
    step: number;          // 1
    minLabel?: string;     // "Very Poor"
    maxLabel?: string;     // "Excellent"
}

export interface ConditionalRule {
    questionId: string;              // Which question to check
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_answered';
    value?: string | number | string[];  // Value to compare against
}

export interface Question {
    id: string;                      // Unique within template

    // Display
    text: string;                    // "How would you rate your sleep quality?"
    description?: string;            // Optional helper text

    // Type & configuration
    type: QuestionType;
    required: boolean;

    // Type-specific config
    options?: ChoiceOption[];        // For single_choice, multiple_choice
    scaleConfig?: NumericScaleConfig; // For numeric_scale
    placeholder?: string;            // For text_input, numeric_input

    // Conditional display
    condition?: ConditionalRule;     // Show only if condition met

    // Analytics
    metricKey?: string;              // "sleep_quality" - for trend tracking
}

export type RecurrencePattern =
    | 'daily'
    | 'weekly'              // Specific days
    | 'gameday_before'      // Day before game
    | 'gameday_after'       // Day after game
    | 'once';

export interface QuestionnaireAssignment {
    _id: string;

    // What & Where
    questionnaireTemplateId: string;
    organizationId: string;
    teamId: string;

    // Who should complete (derived from template, but can override)
    targetRoles: ('athlete' | 'coach')[];
    targetMembers?: string[]; // Specific member IDs

    // Schedule
    recurrence: {
        pattern: RecurrencePattern;
        daysOfWeek?: number[];         // 0=Sunday, 1=Monday, etc. (for 'weekly')
        startDate: Date;
        endDate?: Date;                // null = ongoing
    };

    // Time window
    expiresAtTime?: string;          // "23:59" - defaults to end of day

    // Backfill settings
    backfillAllowedDays: number;     // 7

    // Status
    isActive: boolean;

    // Audit
    assignedBy: UserInfo;
    createdAt: Date;
    updatedAt: Date;
}

export interface AnswerSnapshot {
    questionId: string;
    questionText: string;            // Snapshot at time of answer
    questionType: QuestionType;

    // The answer
    value: string | number | string[] | null;

    // For choice questions, include selected option details
    selectedOptions?: {
        id: string;
        label: string;
        value: number;
    }[];
}

export type ResultContext =
    | { type: 'standalone'; assignmentId: string }
    | { type: 'workout'; workoutSessionId: string; position: 'pre' | 'post' | 'mid' };

export interface QuestionnaireResult {
    _id: string;

    // Links
    questionnaireTemplateId: string;
    organizationId: string;
    teamId: string;

    // Who answered
    athleteInfo: UserInfo;

    // When this is for (the "scheduled" date, not submission time)
    scheduledDate: Date;             // "2025-01-15" - the day this was due

    // Context - standalone or workout
    context: ResultContext;

    // Answers with snapshots
    answers: AnswerSnapshot[];

    // Completion metadata
    submittedAt: Date;
    isLateSubmission: boolean;       // submittedAt > scheduledDate
    backfilledAt?: Date;             // If this was a backfill, when was it done

    // For workout reuse - if standalone result was copied to workout
    copiedToWorkoutSessionIds?: string[];

    createdAt: Date;
    updatedAt: Date;
}
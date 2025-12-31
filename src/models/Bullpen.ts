import { UserInfo } from "./User";

export interface BullpenSession {
    id: string;

    // Links
    workoutAssignmentId: string;
    organizationId: string;
    teamId: string;
    calendarEventId?: string;

    // Who
    athleteInfo: UserInfo;
    coachInfo?: UserInfo;

    // When
    startedAt: Date;
    completedAt?: Date;
    status: "in_progress" | "completed" | "abandoned";

    // Pitch log
    pitches: Pitch[];

    // Summary
    summary: BullpenSummary;

    // Ordered script for the session (if prescribed)
    script?: BullpenScriptItem[];

    // Session feedback
    rpe?: number;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface Pitch {
    id: string;
    number: number;

    pitchType: {
        id: string;
        label: string;
        value: string;
    };
    velocity?: number;
    targetZone: string;           // prescribed zone
    actualZone?: string;          // where it actually went
    compliance: boolean;          // targetZone === actualZone
    strike: boolean;
    intensity: string;

    note?: string;
    timestamp: Date;
}

export interface BullpenSummary {
    totalPitchPrescribed: number;
    totalPitchCompleted: number;
    compliance: number;           // percentage of pitches that hit target zone
    avgVelocity: number;
    topVelocity: number;
    strikePct: number;
}

export interface BullpenScriptItem {
    id: string;
    pitchType: string;
    targetZone: string;
}

export const TARGET_ZONES = [
    { id: "zone_0", label: "0 (Waste Pitch)", value: 0 },
    { id: "zone_1", label: "1 (Top Left)", value: 1 },
    { id: "zone_2", label: "2 (Top Middle)", value: 2 },
    { id: "zone_3", label: "3 (Top Right)", value: 3 },
    { id: "zone_4", label: "4 (Middle Left)", value: 4 },
    { id: "zone_5", label: "5 (Middle Middle)", value: 5 },
    { id: "zone_6", label: "6 (Middle Right)", value: 6 },
    { id: "zone_7", label: "7 (Bottom Left)", value: 7 },
    { id: "zone_8", label: "8 (Bottom Middle)", value: 8 },
    { id: "zone_9", label: "9 (Bottom Right)", value: 9 },
    { id: "zone_11", label: "11 (Top Left Corner)", value: 11 },
    { id: "zone_12", label: "12 (Top Right Corner)", value: 12 },
    { id: "zone_13", label: "13 (Bottom Left Corner)", value: 13 },
    { id: "zone_14", label: "14 (Bottom Right Corner)", value: 14 }
] as const;

export const PITCH_TYPES = [
    { id: "fastball_4seam", label: "4-Seam Fastball", value: "4-Seam" },
    { id: "fastball_2seam", label: "2-Seam Fastball", value: "2-Seam" },
    { id: "sinker", label: "Sinker", value: "SI" },
    { id: "cutter", label: "Cutter", value: "CT" },
    { id: "curveball", label: "Curveball", value: "CB" },
    { id: "slider", label: "Slider", value: "SL" },
    { id: "changeup", label: "Changeup", value: "CH" },
    { id: "splitter", label: "Splitter", value: "SP" },
    { id: "knuckleball", label: "Knuckleball", value: "KN" }
] as const;
import { UserInfo } from "./User";

export interface BullpenSession {
    id: string;

    // Links
    workoutAssignmentId: string;
    organizationId: string;
    teamId: string;

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
    pitchType: string;
    targetZone: string;
}

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
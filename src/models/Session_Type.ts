// Bullpen-specific
export interface BullpenConfig {
    bullpen_type: "standard" | "scripted" | "recovery";
    total_pitch_target: number;
    //   rounds?: BullpenRound[];
    max_pitches?: number;
    coaching_notes?: string;
}

// Throwing-specific
export interface ThrowingConfig {
    throwing_type: "catch_play" | "long_toss" | "arm_care";
    max_distance?: number;
    total_throw_target?: number;
    //   progression?: DistanceProgression[];
}

// Drill-specific  
export interface DrillConfig {
    drill_focus: "mechanics" | "footwork" | "arm_path" | "full_delivery";
    total_reps?: number;
    video_review?: boolean;
}

// Live BP specific
export interface LiveBPConfig {
    hitter_count: number;
    at_bats_per_hitter: number;
    pitch_limit?: number;
    track_results: boolean;  // track hits, outs, etc.
}

// Sim Game specific
export interface SimGameConfig {
    innings: number;
    pitches_per_inning: number;
    //   situations?: InningScenario[];
}

export type SessionType =
    | "workout"
    | "bullpen"
    | "throwing"
    | "drill"
    | "live_bp"
    | "recovery";



export type SessionConfig =
    | BullpenConfig
    | ThrowingConfig
    | DrillConfig
    | LiveBPConfig
    | SimGameConfig
    | null;
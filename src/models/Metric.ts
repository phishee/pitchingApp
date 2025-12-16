export type MetricValue = string | number | boolean;

export type MetricUnit =
  | "count"      // reps, pitch_count
  | "lbs" | "kg" // weight
  | "seconds" | "minutes" | "hours" // duration
  | "meters" | "feet" | "yards" | "inches" | "cm" // distance/height
  | "mph" | "m/s" | "km/h" // velocity
  | "min/mile" | "min/km" // pace
  | "rpm"        // spin rate
  | "reps/min" | "skips/min" // cadence
  | "degrees"    // angles
  | "bpm"        // heart rate
  | "watts"      // power
  | "power"      // generic power score
  | "newtons"    // force
  | "kcal"       // calories
  | "%"          // percentages
  | "string"     // text (like tempo "3-1-2-0")
  | "boolean";   // true/false


export type MetricInputType =
  | "number_stepper"    // +/- buttons (weight, reps)
  | "number_direct"     // Direct keyboard input
  | "slider"            // Range slider (RPE, accuracy %)
  | "time_picker"       // Specialized time input (duration)
  | "text"              // Free text (notes, tempo)
  | "tempo_picker"      // Specialized tempo input (3-1-2-0)
  | "scale"             // Visual scale 1-10 (RPE, perceived effort)
  | "boolean_toggle"    // Yes/No switch (completed)
  | "select";           // Dropdown (failure_reason)

export interface ExerciseMetric {
  id: string;
  unit: MetricUnit;
  input: "manual" | "formula";

  // Display
  label: string;                    // User-facing name
  description: string;              // Tooltip/help text

  // Manual metrics only
  required?: boolean;
  prescribable?: boolean;

  // UI Rendering hints
  inputType?: MetricInputType;      // How to render the input

  // Validation & Constraints
  min?: number;                     // Minimum allowed value
  max?: number;                     // Maximum allowed value
  step?: number;                    // Increment step (0.5, 1, 5, etc.)

  // Advanced UI hints
  quickIncrements?: number[];       // Quick add buttons [5, 10, 25, 45]
  defaultValue?: number | string;   // Pre-fill value
  placeholder?: string;             // Input placeholder

  // Select/dropdown options
  options?: Array<{
    value: string | number;
    label: string;
  }>;

  // Formula metrics only
  formula?: string;
}
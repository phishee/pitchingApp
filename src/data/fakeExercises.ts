import { Exercise } from '@/models/Exercise';
import { Workout } from '@/models/Workout';

export const fakeExercises: Exercise[] = [
  // STRENGTH EXERCISES
  {
    id: "ex_strength_bench_press",
    type: "exercise_template",
    version: "1.0",
    image: "https://plus.unsplash.com/premium_vector-1720626475274-3eb709dad6d3?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    name: "Bench Press",
    description: "Classic compound movement for chest development and upper body strength",
    exercise_type: "strength",
    tags: ["chest", "compound", "push", "barbell", "upper-body"],
    owner: "system",
    instructions: {
      text: [
        "Lie on bench with feet flat on ground",
        "Grip barbell slightly wider than shoulder width",
        "Lower bar to chest with control",
        "Press bar back up to starting position",
        "Keep core tight throughout movement"
      ],
      video: "https://example.com/bench-press-demo.mp4",
      animationPicture: "https://images.squarespace-cdn.com/content/v1/54f9e84de4b0d13f30bba4cb/1528488712624-CH2H2PZAK8FS8GZR8ABG/BenchPress.mov+%281%29.gif"
    },
    structure: "sets",
    settings: {
      sets_counting: true,
      reps_counting: true
    },
    metrics: [
      {
        id: "weight",
        unit: "lbs",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Weight",
        description: "Load used for the exercise"
      },
      {
        id: "reps",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Reps",
        description: "Number of repetitions"
      },
      {
        id: "sets",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Sets",
        description: "Number of sets"
      },
      {
        id: "total_volume",
        unit: "lbs",
        input: "formula",
        formula: "weight * reps * sets",
        label: "Total Volume",
        description: "Total weight lifted"
      }
    ],
    rpe: {
      type: "number",
      range: "1-10",
      description: "Rate of Perceived Exertion for overall exercise difficulty"
    }
  },
  {
    id: "ex_002",
    type: "exercise_template",
    version: "1.0",
    image: "https://plus.unsplash.com/premium_vector-1719528718728-bf180e32ca89?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    name: "Deadlift",
    description: "Fundamental movement for building posterior chain strength and power",
    exercise_type: "strength",
    tags: ["back", "compound", "pull", "barbell", "full-body"],
    owner: "system",
    instructions: {
      text: [
        "Stand with feet hip-width apart, bar over mid-foot",
        "Hinge at hips and bend knees to grip bar",
        "Keep chest up and back straight",
        "Drive through heels to stand up with bar",
        "Control the descent back to ground"
      ],
      video: "https://example.com/deadlift-demo.mp4",
      animationPicture: "https://images.squarespace-cdn.com/content/v1/54f9e84de4b0d13f30bba4cb/1528488693078-17PPTW8U88NE7T0ETCCW/Deadlift.mov+%281%29.gif"
    },
    structure: "sets",
    settings: {
      sets_counting: true,
      reps_counting: true
    },
    metrics: [
      {
        id: "weight",
        unit: "lbs",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Weight",
        description: "Load used for the exercise"
      },
      {
        id: "reps",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Reps",
        description: "Number of repetitions"
      },
      {
        id: "sets",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Sets",
        description: "Number of sets"
      },
      {
        id: "total_volume",
        unit: "lbs",
        input: "formula",
        formula: "weight * reps * sets",
        label: "Total Volume",
        description: "Total weight lifted"
      },
      {
        id: "intensity_percentage",
        unit: "%",
        input: "formula",
        formula: "(weight / max_weight) * 100",
        label: "Intensity",
        description: "Percentage of 1RM"
      }
    ],
    rpe: {
      type: "number",
      range: "1-10",
      description: "Rate of Perceived Exertion for overall exercise difficulty"
    }
  },

  // CARDIO EXERCISES
  {
    id: "ex_003",
    type: "exercise_template",
    version: "1.0",
    image: "https://plus.unsplash.com/premium_vector-1721666604203-6636925f271d?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    name: "Jump Rope",
    description: "High-intensity cardio exercise that improves coordination and endurance",
    exercise_type: "cardio",
    tags: ["cardio", "coordination", "endurance", "full-body", "equipment"],
    owner: "system",
    instructions: {
      text: [
        "Hold rope handles at hip level",
        "Keep elbows close to body",
        "Jump on balls of feet, not too high",
        "Maintain consistent rhythm",
        "Start slow and increase speed gradually"
      ],
      video: "https://example.com/jump-rope-demo.mp4"
    },
    structure: "sets",
    settings: {
      sets_counting: true,
      reps_counting: false
    },
    metrics: [
      {
        id: "duration",
        unit: "seconds",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Duration",
        description: "Time spent jumping"
      },
      {
        id: "sets",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Sets",
        description: "Number of sets"
      },
      {
        id: "skips",
        unit: "count",
        input: "manual",
        required: false,
        prescribable: false,
        label: "Skips",
        description: "Total number of skips"
      },
      {
        id: "skips_per_minute",
        unit: "skips/min",
        input: "formula",
        formula: "(skips / duration) * 60",
        label: "Skips/Min",
        description: "Average skips per minute"
      }
    ],
    rpe: {
      type: "number",
      range: "1-10",
      description: "Rate of Perceived Exertion for overall exercise difficulty"
    }
  },
  {
    id: "ex_004",
    type: "exercise_template",
    version: "1.0",
    image: "https://plus.unsplash.com/premium_vector-1711644446506-f538e96d0f9b?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    name: "Burpees",
    description: "Full-body conditioning exercise combining strength and cardio",
    exercise_type: "cardio",
    tags: ["cardio", "full-body", "conditioning", "no-equipment", "high-intensity"],
    owner: "system",
    instructions: {
      text: [
        "Start in standing position",
        "Drop into squat position and place hands on ground",
        "Kick feet back into plank position",
        "Perform push-up (optional)",
        "Jump feet back to squat position",
        "Explosively jump up with arms overhead"
      ],
      video: "https://example.com/burpees-demo.mp4"
    },
    structure: "sets",
    settings: {
      sets_counting: true,
      reps_counting: true
    },
    metrics: [
      {
        id: "reps",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Reps",
        description: "Number of repetitions"
      },
      {
        id: "sets",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Sets",
        description: "Number of sets"
      },
      {
        id: "duration",
        unit: "seconds",
        input: "manual",
        required: false,
        prescribable: false,
        label: "Duration",
        description: "Time taken to complete reps"
      },
      {
        id: "total_reps",
        unit: "count",
        input: "formula",
        formula: "reps * sets",
        label: "Total Reps",
        description: "Total repetitions completed"
      },
      {
        id: "reps_per_minute",
        unit: "reps/min",
        input: "formula",
        formula: "(total_reps / duration) * 60",
        label: "Reps/Min",
        description: "Average reps per minute"
      }
    ],
    rpe: {
      type: "number",
      range: "1-10",
      description: "Rate of Perceived Exertion for overall exercise difficulty"
    }
  },

  // BASEBALL EXERCISES
  {
    id: "ex_005",
    type: "exercise_template",
    version: "1.0",
    image: "https://plus.unsplash.com/premium_vector-1729766149737-ae872ee432d6?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    name: "Medicine Ball Rotational Throw",
    description: "Sport-specific exercise for developing rotational power and core strength",
    exercise_type: "baseball",
    tags: ["baseball", "rotational", "power", "core", "sport-specific"],
    owner: "system",
    instructions: {
      text: [
        "Stand sideways to wall with feet shoulder-width apart",
        "Hold medicine ball at chest level",
        "Rotate hips and shoulders away from wall",
        "Explosively rotate toward wall and throw ball",
        "Catch ball and repeat on opposite side",
        "Focus on hip-shoulder separation"
      ],
      video: "https://example.com/medicine-ball-rotational-demo.mp4"
    },
    structure: "sets",
    settings: {
      sets_counting: true,
      reps_counting: true
    },
    metrics: [
      {
        id: "reps",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Reps",
        description: "Number of repetitions"
      },
      {
        id: "sets",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Sets",
        description: "Number of sets"
      },
      {
        id: "ball_weight",
        unit: "lbs",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Ball Weight",
        description: "Weight of the medicine ball"
      },
      {
        id: "total_reps",
        unit: "count",
        input: "formula",
        formula: "reps * sets",
        label: "Total Reps",
        description: "Total repetitions completed"
      },
      {
        id: "power_score",
        unit: "power",
        input: "formula",
        formula: "ball_weight * total_reps * 0.1",
        label: "Power Score",
        description: "Calculated power output score"
      }
    ],
    rpe: {
      type: "number",
      range: "1-10",
      description: "Rate of Perceived Exertion for overall exercise difficulty"
    }
  },
  {
    id: "ex_006",
    type: "exercise_template",
    version: "1.0",
    image: "https://plus.unsplash.com/premium_vector-1720978065972-63172dc3da2b?q=80&w=1349&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    name: "Single-Arm Dumbbell Row",
    description: "Unilateral exercise for building back strength and improving throwing mechanics",
    exercise_type: "baseball",
    tags: ["baseball", "back", "unilateral", "strength", "throwing"],
    owner: "system",
    instructions: {
      text: [
        "Place knee and hand on bench for support",
        "Hold dumbbell in opposite hand",
        "Keep back straight and core engaged",
        "Pull dumbbell toward hip, elbow close to body",
        "Squeeze shoulder blade at top of movement",
        "Control the descent back to starting position"
      ],
      video: "https://example.com/single-arm-row-demo.mp4"
    },
    structure: "sets",
    settings: {
      sets_counting: true,
      reps_counting: true
    },
    metrics: [
      {
        id: "weight",
        unit: "lbs",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Weight",
        description: "Load used for the exercise"
      },
      {
        id: "reps",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Reps",
        description: "Number of repetitions"
      },
      {
        id: "sets",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Sets",
        description: "Number of sets"
      },
      {
        id: "total_volume",
        unit: "lbs",
        input: "formula",
        formula: "weight * reps * sets",
        label: "Total Volume",
        description: "Total weight lifted"
      },
      {
        id: "work_per_side",
        unit: "lbs",
        input: "formula",
        formula: "total_volume / 2",
        label: "Work Per Side",
        description: "Volume per arm"
      }
    ],
    rpe: {
      type: "number",
      range: "1-10",
      description: "Rate of Perceived Exertion for overall exercise difficulty"
    }
  },
  {
    id: "ex_throwing",
    type: "exercise_template",
    version: "1.0",
    image: "https://example.com/throwing-icon.png",
    photoCover: "https://images.unsplash.com/photo-1531752148124-118ba196fc7b?w=800",
    name: "Throwing",
    description: "Arm warm-up and conditioning through catch play and long toss",
    exercise_type: "baseball",
    tags: ["baseball", "throwing", "arm_care", "warmup", "long_toss"],
    owner: "system",
    instructions: {
      text: [
        "Start at short distance with easy throws",
        "Progress distance gradually based on arm feel",
        "Use arc on longer throws if needed",
        "Focus on clean mechanics and footwork",
        "Stop if any arm discomfort"
      ],
      video: "https://example.com/throwing-demo.mp4",
      animationPicture: "https://example.com/throwing-animation.gif"
    },
    structure: "sets",
    settings: {
      sets_counting: true,
      reps_counting: false
    },
    metrics: [
      {
        id: "distance",
        unit: "feet",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Distance",
        description: "Throwing distance in feet"
      },
      {
        id: "throw_count",
        unit: "count",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Throw Count",
        description: "Number of throws at this distance"
      },
      {
        id: "throw_type",
        unit: "enum",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Throw Type",
        description: "Style of throw",
        options: [
          { id: "catch_play", label: "Catch Play", value: "CP" },
          { id: "long_toss_arc", label: "Long Toss (Arc)", value: "LT-A" },
          { id: "long_toss_flat", label: "Long Toss (Flat)", value: "LT-F" },
          { id: "pull_down", label: "Pull Down", value: "PD" }
        ]
      },
      {
        id: "intensity",
        unit: "enum",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Intensity",
        description: "Effort level",
        options: [
          { id: "light", label: "Light (50-70%)", value: 60 },
          { id: "moderate", label: "Moderate (70-85%)", value: 77 },
          { id: "high", label: "High (85-100%)", value: 92 }
        ]
      },
      {
        id: "arm_feel",
        unit: "enum",
        input: "manual",
        required: true,
        prescribable: false,
        label: "Arm Feel",
        description: "How the arm feels during/after throwing",
        options: [
          { id: "fresh", label: "Fresh", value: 1 },
          { id: "normal", label: "Normal", value: 2 },
          { id: "fatigued", label: "Fatigued", value: 3 },
          { id: "sore", label: "Sore", value: 4 }
        ]
      },
      {
        id: "total_throws",
        unit: "count",
        input: "formula",
        formula: "sum(throw_count)",
        label: "Total Throws",
        description: "Total throws in session"
      }
    ],
    rpe: {
      type: "number",
      range: "1-10",
      description: "Overall arm exertion level"
    }
  },
  {
    id: "ex_pitching",
    type: "exercise_template",
    version: "1.0",
    image: "https://example.com/pitching-icon.png",
    photoCover: "https://images.unsplash.com/photo-1531752148124-118ba196fc7b?w=800",
    name: "Pitching",
    description: "Mound pitching session with velocity, command, and pitch type tracking",
    exercise_type: "baseball",
    tags: ["baseball", "pitching", "bullpen", "velocity", "command", "mound"],
    owner: "system",
    instructions: {
      text: [
        "Complete throwing warm-up before starting",
        "Start with fastballs to establish command",
        "Work through pitch arsenal systematically",
        "Focus on hitting target zones consistently",
        "Monitor arm feel and stop if any discomfort"
      ],
      video: "https://example.com/pitching-demo.mp4",
      animationPicture: "https://example.com/pitching-animation.gif"
    },
    structure: "sets",
    settings: {
      sets_counting: true,
      reps_counting: false
    },
    metrics: [
      {
        id: "pitch_type",
        unit: "enum",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Pitch Type",
        description: "Type of pitch thrown",
        options: [
          { id: "fastball_4seam", label: "4-Seam Fastball", value: "4-Seam" },
          { id: "fastball_2seam", label: "2-Seam Fastball", value: "2-Seam" },
          { id: "sinker", label: "Sinker", value: "SI" },
          { id: "cutter", label: "Cutter", value: "CT" },
          { id: "curveball", label: "Curveball", value: "CB" },
          { id: "slider", label: "Slider", value: "SL" },
          { id: "changeup", label: "Changeup", value: "CH" },
          { id: "splitter", label: "Splitter", value: "SP" },
          { id: "knuckleball", label: "Knuckleball", value: "KN" }
        ]
      },
      {
        id: "velocity",
        unit: "mph",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Velocity",
        description: "Pitch speed in miles per hour"
      },
      {
        id: "target_zone",
        unit: "enum",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Target Zone",
        description: "Intended location in strike zone grid",
        options: [
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
        ]
      },
      {
        id: "strike",
        unit: "boolean",
        input: "manual",
        required: true,
        prescribable: false,
        label: "Strike",
        description: "Whether the pitch was a strike"
      },
      {
        id: "intensity",
        unit: "enum",
        input: "manual",
        required: true,
        prescribable: true,
        label: "Intensity",
        description: "Effort level of the pitch",
        options: [
          { id: "light", label: "Light (50-70%)", value: 60 },
          { id: "moderate", label: "Moderate (70-85%)", value: 77 },
          { id: "game_intensity", label: "Game Intensity (85-100%)", value: 92 }
        ]
      },
      {
        id: "avg_velocity",
        unit: "mph",
        input: "formula",
        formula: "avg(velocity)",
        label: "Avg Velocity",
        description: "Average pitch speed across session"
      },
      {
        id: "max_velocity",
        unit: "mph",
        input: "formula",
        formula: "max(velocity)",
        label: "Max Velocity",
        description: "Highest pitch speed in session"
      },
      {
        id: "strike_pct",
        unit: "%",
        input: "formula",
        formula: "(count(strike=true) / count(*)) * 100",
        label: "Strike %",
        description: "Percentage of pitches that were strikes"
      }
    ],
    rpe: {
      type: "number",
      range: "1-10",
      description: "Overall arm exertion and fatigue level"
    }
  }
];

export const fakeWorkouts: Workout[] = [
  {
    id: "workout_upper_body_strength",
    organizationId: "org_123",
    teamIds: ["team_45", "team_46"],
    createdBy: {
      userId: "u001",
      memberId: "m001"
    },
    updatedBy: {
      userId: "u001",
      memberId: "m001"
    },
    name: "Upper Body Strength Day",
    description: "Bench press focus + core work for baseball players",
    coverImage: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    flow: {
      questionnaires: ["fatigue_check", "sleep_quality"],
      warmup: ["dynamic_stretch", "band_pull_aparts", "arm_circles"],
      exercises: [
        {
          exercise_id: "ex_001",
          sets: [
            { setNumber: 1, metrics: { reps: 10, rest: 60 } },
            { setNumber: 2, metrics: { reps: 10, rest: 60 } },
            { setNumber: 3, metrics: { reps: 10, rest: 60 } }
          ]
        }, // Bench Press
        {
          exercise_id: "ex_005",
          sets: [
            { setNumber: 1, metrics: { reps: 8, rest: 90 } },
            { setNumber: 2, metrics: { reps: 8, rest: 90 } },
            { setNumber: 3, metrics: { reps: 8, rest: 90 } }
          ]
        }, // Medicine Ball Rotational Throw
        {
          exercise_id: "ex_006",
          sets: [
            { setNumber: 1, metrics: { reps: 12, rest: 60 } },
            { setNumber: 2, metrics: { reps: 12, rest: 60 } },
            { setNumber: 3, metrics: { reps: 12, rest: 60 } }
          ]
        }  // Single-Arm Dumbbell Row
      ]
    },
    tags: ["strength", "baseball", "upper_body"]
  },
  {
    id: "workout_cardio_conditioning",
    organizationId: "org_123",
    teamIds: ["team_45"],
    createdBy: {
      userId: "u002",
      memberId: "m002"
    },
    updatedBy: {
      userId: "u002",
      memberId: "m002"
    },
    name: "Cardio Conditioning Session",
    description: "High-intensity cardio to improve endurance and coordination",
    coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    flow: {
      questionnaires: ["energy_level", "hydration_status"],
      warmup: ["light_jogging", "dynamic_stretching", "jump_rope_basics"],
      exercises: [
        {
          exercise_id: "ex_003",
          sets: [
            { setNumber: 1, metrics: { duration: 300, rest: 60 } }
          ]
        }, // Jump Rope
        {
          exercise_id: "ex_004",
          sets: [
            { setNumber: 1, metrics: { reps: 15, rest: 60 } },
            { setNumber: 2, metrics: { reps: 15, rest: 60 } },
            { setNumber: 3, metrics: { reps: 15, rest: 60 } }
          ]
        }, // Burpees
        {
          exercise_id: "ex_005",
          sets: [
            { setNumber: 1, metrics: { reps: 8, rest: 90 } },
            { setNumber: 2, metrics: { reps: 8, rest: 90 } },
            { setNumber: 3, metrics: { reps: 8, rest: 90 } }
          ]
        }  // Medicine Ball Rotational Throw
      ]
    },
    tags: ["cardio", "conditioning", "baseball", "endurance"]
  },
  {
    id: "workout_full_body_power",
    organizationId: "org_123",
    teamIds: ["team_46"],
    createdBy: {
      userId: "u001",
      memberId: "m001"
    },
    updatedBy: {
      userId: "u001",
      memberId: "m001"
    },
    name: "Full Body Power Development",
    description: "Compound movements for overall strength and power",
    coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
    flow: {
      questionnaires: ["muscle_soreness", "recovery_status"],
      warmup: ["mobility_drills", "light_cardio", "dynamic_movements"],
      exercises: [
        {
          exercise_id: "ex_002",
          sets: [
            { setNumber: 1, metrics: { reps: 8, rest: 120 } },
            { setNumber: 2, metrics: { reps: 8, rest: 120 } },
            { setNumber: 3, metrics: { reps: 8, rest: 120 } },
            { setNumber: 4, metrics: { reps: 8, rest: 120 } }
          ]
        }, // Deadlift
        {
          exercise_id: "ex_001",
          sets: [
            { setNumber: 1, metrics: { reps: 10, rest: 60 } },
            { setNumber: 2, metrics: { reps: 10, rest: 60 } },
            { setNumber: 3, metrics: { reps: 10, rest: 60 } }
          ]
        }, // Bench Press
        {
          exercise_id: "ex_006",
          sets: [
            { setNumber: 1, metrics: { reps: 12, rest: 60 } },
            { setNumber: 2, metrics: { reps: 12, rest: 60 } },
            { setNumber: 3, metrics: { reps: 12, rest: 60 } }
          ]
        }, // Single-Arm Dumbbell Row
        {
          exercise_id: "ex_004",
          sets: [
            { setNumber: 1, metrics: { reps: 15, rest: 60 } },
            { setNumber: 2, metrics: { reps: 15, rest: 60 } },
            { setNumber: 3, metrics: { reps: 15, rest: 60 } }
          ]
        }  // Burpees
      ]
    },
    tags: ["strength", "power", "compound", "full_body"]
  },
  {
    id: "workout_mobility_flexibility",
    organizationId: "org_123",
    teamIds: ["team_45", "team_46"],
    createdBy: {
      userId: "u003",
      memberId: "m003"
    },
    updatedBy: {
      userId: "u003",
      memberId: "m003"
    },
    name: "Mobility & Flexibility",
    description: "Improve range of motion and prevent injuries with targeted stretching",
    coverImage: "https://plus.unsplash.com/premium_photo-1661286671331-89722c552690?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    flow: {
      questionnaires: ["mobility_assessment", "pain_level"],
      warmup: ["light_walking", "gentle_arm_swings"],
      exercises: [
        {
          exercise_id: "ex_003",
          sets: [
            { setNumber: 1, metrics: { duration: 180, rest: 60 } }
          ]
        }, // Jump Rope (modified for mobility)
        {
          exercise_id: "ex_004",
          sets: [
            { setNumber: 1, metrics: { reps: 8, rest: 90 } },
            { setNumber: 2, metrics: { reps: 8, rest: 90 } }
          ]
        }, // Burpees (modified for flexibility)
        {
          exercise_id: "ex_005",
          sets: [
            { setNumber: 1, metrics: { reps: 6, rest: 120 } },
            { setNumber: 2, metrics: { reps: 6, rest: 120 } }
          ]
        }  // Medicine Ball Rotational Throw
      ]
    },
    tags: ["mobility", "flexibility", "recovery", "injury_prevention"]
  },
  {
    id: "workout_speed_agility",
    organizationId: "org_123",
    teamIds: ["team_46"],
    createdBy: {
      userId: "u002",
      memberId: "m002"
    },
    updatedBy: {
      userId: "u002",
      memberId: "m002"
    },
    name: "Speed & Agility Training",
    description: "Enhance quick movements and reaction time for baseball performance",
    coverImage: "https://images.unsplash.com/photo-1696536823512-79d724454616?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    flow: {
      questionnaires: ["energy_level", "coordination_check"],
      warmup: ["dynamic_stretching", "light_jogging", "ladder_drills"],
      exercises: [
        {
          exercise_id: "ex_003",
          sets: [
            { setNumber: 1, metrics: { duration: 240, rest: 60 } }
          ]
        }, // Jump Rope
        {
          exercise_id: "ex_005",
          sets: [
            { setNumber: 1, metrics: { reps: 8, rest: 90 } },
            { setNumber: 2, metrics: { reps: 8, rest: 90 } },
            { setNumber: 3, metrics: { reps: 8, rest: 90 } }
          ]
        }, // Medicine Ball Rotational Throw
        {
          exercise_id: "ex_006",
          sets: [
            { setNumber: 1, metrics: { reps: 12, rest: 60 } },
            { setNumber: 2, metrics: { reps: 12, rest: 60 } },
            { setNumber: 3, metrics: { reps: 12, rest: 60 } }
          ]
        }  // Single-Arm Dumbbell Row
      ]
    },
    tags: ["speed", "agility", "baseball", "coordination", "reaction_time"]
  },
  {
    id: "workout_recovery_regeneration",
    organizationId: "org_123",
    teamIds: ["team_45", "team_46"],
    createdBy: {
      userId: "u001",
      memberId: "m001"
    },
    updatedBy: {
      userId: "u001",
      memberId: "m001"
    },
    name: "Recovery & Regeneration",
    description: "Active recovery session to promote healing and reduce muscle soreness",
    coverImage: "https://plus.unsplash.com/premium_photo-1661923103649-0223557b8589?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    flow: {
      questionnaires: ["soreness_level", "sleep_quality", "stress_level"],
      warmup: ["gentle_mobility", "breathing_exercises"],
      exercises: [
        {
          exercise_id: "ex_003",
          sets: [
            { setNumber: 1, metrics: { duration: 120, rest: 90 } }
          ]
        }, // Jump Rope (low intensity)
        {
          exercise_id: "ex_004",
          sets: [
            { setNumber: 1, metrics: { reps: 5, rest: 120 } },
            { setNumber: 2, metrics: { reps: 5, rest: 120 } }
          ]
        }, // Burpees (modified for recovery)
        {
          exercise_id: "ex_005",
          sets: [
            { setNumber: 1, metrics: { reps: 4, rest: 150 } },
            { setNumber: 2, metrics: { reps: 4, rest: 150 } }
          ]
        }  // Medicine Ball Rotational Throw
      ]
    },
    tags: ["recovery", "regeneration", "wellness", "stress_relief", "active_recovery"]
  }
];

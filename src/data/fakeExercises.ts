// import { Exercise } from '@/models/Exercise';
// import { Workout } from '@/models/Workout';

// export const fakeExercises: Exercise[] = [
//   // STRENGTH EXERCISES
//   {
//     id: "ex_strength_bench_press",
//     type: "exercise_template",
//     version: "1.0",
//     image: "https://plus.unsplash.com/premium_vector-1720626475274-3eb709dad6d3?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
//     name: "Bench Press",
//     description: "Classic compound movement for chest development and upper body strength",
//     exercise_type: "strength",
//     tags: ["chest", "compound", "push", "barbell", "upper-body"],
//     owner: "system",
//     instructions: {
//       text: [
//         "Lie on bench with feet flat on ground",
//         "Grip barbell slightly wider than shoulder width",
//         "Lower bar to chest with control",
//         "Press bar back up to starting position",
//         "Keep core tight throughout movement"
//       ],
//       video: "https://example.com/bench-press-demo.mp4",
//       animationPicture: "https://images.squarespace-cdn.com/content/v1/54f9e84de4b0d13f30bba4cb/1528488712624-CH2H2PZAK8FS8GZR8ABG/BenchPress.mov+%281%29.gif"
//     },
//     structure: "sets",
//     settings: {
//       sets_counting: true,
//       reps_counting: true
//     },
//     metrics: [
//       { 
//         id: "weight", 
//         unit: "lbs", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "reps", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "sets", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "total_volume", 
//         unit: "lbs", 
//         input: "formula", 
//         formula: "weight * reps * sets" 
//       }
//     ],
//     rpe: {
//       type: "number",
//       range: "1-10",
//       description: "Rate of Perceived Exertion for overall exercise difficulty"
//     }
//   },
//   {
//     id: "ex_002",
//     type: "exercise_template",
//     version: "1.0",
//     image: "https://plus.unsplash.com/premium_vector-1719528718728-bf180e32ca89?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
//     name: "Deadlift",
//     description: "Fundamental movement for building posterior chain strength and power",
//     exercise_type: "strength",
//     tags: ["back", "compound", "pull", "barbell", "full-body"],
//     owner: "system",
//     instructions: {
//       text: [
//         "Stand with feet hip-width apart, bar over mid-foot",
//         "Hinge at hips and bend knees to grip bar",
//         "Keep chest up and back straight",
//         "Drive through heels to stand up with bar",
//         "Control the descent back to ground"
//       ],
//       video: "https://example.com/deadlift-demo.mp4",
//       animationPicture: "https://images.squarespace-cdn.com/content/v1/54f9e84de4b0d13f30bba4cb/1528488693078-17PPTW8U88NE7T0ETCCW/Deadlift.mov+%281%29.gif"
//     },
//     structure: "sets",
//     settings: {
//       sets_counting: true,
//       reps_counting: true
//     },
//     metrics: [
//       { 
//         id: "weight", 
//         unit: "lbs", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "reps", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "sets", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "total_volume", 
//         unit: "lbs", 
//         input: "formula", 
//         formula: "weight * reps * sets" 
//       },
//       { 
//         id: "intensity_percentage", 
//         unit: "%", 
//         input: "formula", 
//         formula: "(weight / max_weight) * 100" 
//       }
//     ],
//     rpe: {
//       type: "number",
//       range: "1-10",
//       description: "Rate of Perceived Exertion for overall exercise difficulty"
//     }
//   },

//   // CARDIO EXERCISES
//   {
//     id: "ex_003",
//     type: "exercise_template",
//     version: "1.0",
//     image: "https://plus.unsplash.com/premium_vector-1721666604203-6636925f271d?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
//     name: "Jump Rope",
//     description: "High-intensity cardio exercise that improves coordination and endurance",
//     exercise_type: "cardio",
//     tags: ["cardio", "coordination", "endurance", "full-body", "equipment"],
//     owner: "system",
//     instructions: {
//       text: [
//         "Hold rope handles at hip level",
//         "Keep elbows close to body",
//         "Jump on balls of feet, not too high",
//         "Maintain consistent rhythm",
//         "Start slow and increase speed gradually"
//       ],
//       video: "https://example.com/jump-rope-demo.mp4"
//     },
//     structure: "sets",
//     settings: {
//       sets_counting: true,
//       reps_counting: false
//     },
//     metrics: [
//       { 
//         id: "duration", 
//         unit: "seconds", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "sets", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "skips", 
//         unit: "count", 
//         input: "manual", 
//         required: false, 
//         prescribable: false 
//       },
//       { 
//         id: "total_time", 
//         unit: "seconds", 
//         input: "formula", 
//         formula: "duration * sets" 
//       },
//       { 
//         id: "skips_per_minute", 
//         unit: "skips/min", 
//         input: "formula", 
//         formula: "(skips / duration) * 60" 
//       }
//     ],
//     rpe: {
//       type: "number",
//       range: "1-10",
//       description: "Rate of Perceived Exertion for overall exercise difficulty"
//     }
//   },
//   {
//     id: "ex_004",
//     type: "exercise_template",
//     version: "1.0",
//     image: "https://plus.unsplash.com/premium_vector-1711644446506-f538e96d0f9b?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
//     name: "Burpees",
//     description: "Full-body conditioning exercise combining strength and cardio",
//     exercise_type: "cardio",
//     tags: ["cardio", "full-body", "conditioning", "no-equipment", "high-intensity"],
//     owner: "system",
//     instructions: {
//       text: [
//         "Start in standing position",
//         "Drop into squat position and place hands on ground",
//         "Kick feet back into plank position",
//         "Perform push-up (optional)",
//         "Jump feet back to squat position",
//         "Explosively jump up with arms overhead"
//       ],
//       video: "https://example.com/burpees-demo.mp4"
//     },
//     structure: "sets",
//     settings: {
//       sets_counting: true,
//       reps_counting: true
//     },
//     metrics: [
//       { 
//         id: "reps", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "sets", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "duration", 
//         unit: "seconds", 
//         input: "manual", 
//         required: false, 
//         prescribable: false 
//       },
//       { 
//         id: "total_reps", 
//         unit: "count", 
//         input: "formula", 
//         formula: "reps * sets" 
//       },
//       { 
//         id: "reps_per_minute", 
//         unit: "reps/min", 
//         input: "formula", 
//         formula: "(total_reps / duration) * 60" 
//       }
//     ],
//     rpe: {
//       type: "number",
//       range: "1-10",
//       description: "Rate of Perceived Exertion for overall exercise difficulty"
//     }
//   },

//   // BASEBALL EXERCISES
//   {
//     id: "ex_005",
//     type: "exercise_template",
//     version: "1.0",
//     image: "https://plus.unsplash.com/premium_vector-1729766149737-ae872ee432d6?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
//     name: "Medicine Ball Rotational Throw",
//     description: "Sport-specific exercise for developing rotational power and core strength",
//     exercise_type: "baseball",
//     tags: ["baseball", "rotational", "power", "core", "sport-specific"],
//     owner: "system",
//     instructions: {
//       text: [
//         "Stand sideways to wall with feet shoulder-width apart",
//         "Hold medicine ball at chest level",
//         "Rotate hips and shoulders away from wall",
//         "Explosively rotate toward wall and throw ball",
//         "Catch ball and repeat on opposite side",
//         "Focus on hip-shoulder separation"
//       ],
//       video: "https://example.com/medicine-ball-rotational-demo.mp4"
//     },
//     structure: "sets",
//     settings: {
//       sets_counting: true,
//       reps_counting: true
//     },
//     metrics: [
//       { 
//         id: "reps", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "sets", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "ball_weight", 
//         unit: "lbs", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "total_reps", 
//         unit: "count", 
//         input: "formula", 
//         formula: "reps * sets" 
//       },
//       { 
//         id: "power_score", 
//         unit: "power", 
//         input: "formula", 
//         formula: "ball_weight * total_reps * 0.1" 
//       }
//     ],
//     rpe: {
//       type: "number",
//       range: "1-10",
//       description: "Rate of Perceived Exertion for overall exercise difficulty"
//     }
//   },
//   {
//     id: "ex_006",
//     type: "exercise_template",
//     version: "1.0",
//     image: "https://plus.unsplash.com/premium_vector-1720978065972-63172dc3da2b?q=80&w=1349&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     photoCover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
//     name: "Single-Arm Dumbbell Row",
//     description: "Unilateral exercise for building back strength and improving throwing mechanics",
//     exercise_type: "baseball",
//     tags: ["baseball", "back", "unilateral", "strength", "throwing"],
//     owner: "system",
//     instructions: {
//       text: [
//         "Place knee and hand on bench for support",
//         "Hold dumbbell in opposite hand",
//         "Keep back straight and core engaged",
//         "Pull dumbbell toward hip, elbow close to body",
//         "Squeeze shoulder blade at top of movement",
//         "Control the descent back to starting position"
//       ],
//       video: "https://example.com/single-arm-row-demo.mp4"
//     },
//     structure: "sets",
//     settings: {
//       sets_counting: true,
//       reps_counting: true
//     },
//     metrics: [
//       { 
//         id: "weight", 
//         unit: "lbs", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "reps", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "sets", 
//         unit: "count", 
//         input: "manual", 
//         required: true, 
//         prescribable: true 
//       },
//       { 
//         id: "total_volume", 
//         unit: "lbs", 
//         input: "formula", 
//         formula: "weight * reps * sets" 
//       },
//       { 
//         id: "work_per_side", 
//         unit: "lbs", 
//         input: "formula", 
//         formula: "total_volume / 2" 
//       }
//     ],
//     rpe: {
//       type: "number",
//       range: "1-10",
//       description: "Rate of Perceived Exertion for overall exercise difficulty"
//     }
//   }
// ];

// export const fakeWorkouts: Workout[] = [
//   {
//     id: "workout_upper_body_strength",
//     organizationId: "org_123",
//     teamIds: ["team_45", "team_46"],
//     createdBy: { 
//       userId: "u001", 
//       memberId: "m001" 
//     },
//     updatedBy: { 
//       userId: "u001", 
//       memberId: "m001" 
//     },
//     name: "Upper Body Strength Day",
//     description: "Bench press focus + core work for baseball players",
//     coverImage: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     flow: {
//       questionnaires: ["fatigue_check", "sleep_quality"],
//       warmup: ["dynamic_stretch", "band_pull_aparts", "arm_circles"],
//       exercises: [
//         { 
//           exercise_id: "ex_001",
//           default_Metrics: {
//             sets: 3,
//             reps: 10,
//             rest: 60
//           }
//         }, // Bench Press
//         { 
//           exercise_id: "ex_005",
//           default_Metrics: {
//             sets: 3,
//             reps: 8,
//             rest: 90
//           }
//         }, // Medicine Ball Rotational Throw
//         { 
//           exercise_id: "ex_006",
//           default_Metrics: {
//             sets: 3,
//             reps: 12,
//             rest: 60
//           }
//         }  // Single-Arm Dumbbell Row
//       ]
//     },
//     tags: ["strength", "baseball", "upper_body"]
//   },
//   {
//     id: "workout_cardio_conditioning",
//     organizationId: "org_123",
//     teamIds: ["team_45"],
//     createdBy: { 
//       userId: "u002", 
//       memberId: "m002" 
//     },
//     updatedBy: { 
//       userId: "u002", 
//       memberId: "m002" 
//     },
//     name: "Cardio Conditioning Session",
//     description: "High-intensity cardio to improve endurance and coordination",
//     coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     flow: {
//       questionnaires: ["energy_level", "hydration_status"],
//       warmup: ["light_jogging", "dynamic_stretching", "jump_rope_basics"],
//       exercises: [
//         { 
//           exercise_id: "ex_003",
//           default_Metrics: {
//             duration: 300,
//             rest: 60
//           }
//         }, // Jump Rope
//         { 
//           exercise_id: "ex_004",
//           default_Metrics: {
//             sets: 3,
//             reps: 15,
//             rest: 60
//           }
//         }, // Burpees
//         { 
//           exercise_id: "ex_005",
//           default_Metrics: {
//             sets: 3,
//             reps: 8,
//             rest: 90
//           }
//         }  // Medicine Ball Rotational Throw
//       ]
//     },
//     tags: ["cardio", "conditioning", "baseball", "endurance"]
//   },
//   {
//     id: "workout_full_body_power",
//     organizationId: "org_123",
//     teamIds: ["team_46"],
//     createdBy: { 
//       userId: "u001", 
//       memberId: "m001" 
//     },
//     updatedBy: { 
//       userId: "u001", 
//       memberId: "m001" 
//     },
//     name: "Full Body Power Development",
//     description: "Compound movements for overall strength and power",
//     coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
//     flow: {
//       questionnaires: ["muscle_soreness", "recovery_status"],
//       warmup: ["mobility_drills", "light_cardio", "dynamic_movements"],
//       exercises: [
//         { 
//           exercise_id: "ex_002",
//           default_Metrics: {
//             sets: 4,
//             reps: 8,
//             rest: 120
//           }
//         }, // Deadlift
//         { 
//           exercise_id: "ex_001",
//           default_Metrics: {
//             sets: 3,
//             reps: 10,
//             rest: 60
//           }
//         }, // Bench Press
//         { 
//           exercise_id: "ex_006",
//           default_Metrics: {
//             sets: 3,
//             reps: 12,
//             rest: 60
//           }
//         }, // Single-Arm Dumbbell Row
//         { 
//           exercise_id: "ex_004",
//           default_Metrics: {
//             sets: 3,
//             reps: 15,
//             rest: 60
//           }
//         }  // Burpees
//       ]
//     },
//     tags: ["strength", "power", "compound", "full_body"]
//   },
//   {
//     id: "workout_mobility_flexibility",
//     organizationId: "org_123",
//     teamIds: ["team_45", "team_46"],
//     createdBy: { 
//       userId: "u003", 
//       memberId: "m003" 
//     },
//     updatedBy: { 
//       userId: "u003", 
//       memberId: "m003" 
//     },
//     name: "Mobility & Flexibility",
//     description: "Improve range of motion and prevent injuries with targeted stretching",
//     coverImage: "https://plus.unsplash.com/premium_photo-1661286671331-89722c552690?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     flow: {
//       questionnaires: ["mobility_assessment", "pain_level"],
//       warmup: ["light_walking", "gentle_arm_swings"],
//       exercises: [
//         { 
//           exercise_id: "ex_003",
//           default_Metrics: {
//             duration: 180,
//             rest: 60
//           }
//         }, // Jump Rope (modified for mobility)
//         { 
//           exercise_id: "ex_004",
//           default_Metrics: {
//             sets: 2,
//             reps: 8,
//             rest: 90
//           }
//         }, // Burpees (modified for flexibility)
//         { 
//           exercise_id: "ex_005",
//           default_Metrics: {
//             sets: 2,
//             reps: 6,
//             rest: 120
//           }
//         }  // Medicine Ball Rotational Throw
//       ]
//     },
//     tags: ["mobility", "flexibility", "recovery", "injury_prevention"]
//   },
//   {
//     id: "workout_speed_agility",
//     organizationId: "org_123",
//     teamIds: ["team_46"],
//     createdBy: { 
//       userId: "u002", 
//       memberId: "m002" 
//     },
//     updatedBy: { 
//       userId: "u002", 
//       memberId: "m002" 
//     },
//     name: "Speed & Agility Training",
//     description: "Enhance quick movements and reaction time for baseball performance",
//     coverImage: "https://images.unsplash.com/photo-1696536823512-79d724454616?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     flow: {
//       questionnaires: ["energy_level", "coordination_check"],
//       warmup: ["dynamic_stretching", "light_jogging", "ladder_drills"],
//       exercises: [
//         { 
//           exercise_id: "ex_003",
//           default_Metrics: {
//             duration: 240,
//             rest: 60
//           }
//         }, // Jump Rope
//         { 
//           exercise_id: "ex_005",
//           default_Metrics: {
//             sets: 3,
//             reps: 8,
//             rest: 90
//           }
//         }, // Medicine Ball Rotational Throw
//         { 
//           exercise_id: "ex_006",
//           default_Metrics: {
//             sets: 3,
//             reps: 12,
//             rest: 60
//           }
//         }  // Single-Arm Dumbbell Row
//       ]
//     },
//     tags: ["speed", "agility", "baseball", "coordination", "reaction_time"]
//   },
//   {
//     id: "workout_recovery_regeneration",
//     organizationId: "org_123",
//     teamIds: ["team_45", "team_46"],
//     createdBy: { 
//       userId: "u001", 
//       memberId: "m001" 
//     },
//     updatedBy: { 
//       userId: "u001", 
//       memberId: "m001" 
//     },
//     name: "Recovery & Regeneration",
//     description: "Active recovery session to promote healing and reduce muscle soreness",
//     coverImage: "https://plus.unsplash.com/premium_photo-1661923103649-0223557b8589?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     flow: {
//       questionnaires: ["soreness_level", "sleep_quality", "stress_level"],
//       warmup: ["gentle_mobility", "breathing_exercises"],
//       exercises: [
//         { 
//           exercise_id: "ex_003",
//           default_Metrics: {
//             duration: 120,
//             rest: 90
//           }
//         }, // Jump Rope (low intensity)
//         { 
//           exercise_id: "ex_004",
//           default_Metrics: {
//             sets: 2,
//             reps: 5,
//             rest: 120
//           }
//         }, // Burpees (modified for recovery)
//         { 
//           exercise_id: "ex_005",
//           default_Metrics: {
//             sets: 2,
//             reps: 4,
//             rest: 150
//           }
//         }  // Medicine Ball Rotational Throw
//       ]
//     },
//     tags: ["recovery", "regeneration", "wellness", "stress_relief", "active_recovery"]
//   }
// ];

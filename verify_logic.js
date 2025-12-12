
class PrescriptionResolver {
    resolvePrescriptions(assignment, workout, exercises) {
        const workoutExercises = workout.flow?.exercises ?? [];

        return workoutExercises.map((workoutExercise) => {
            const exercise = exercises.find((item) => {
                const exerciseId = item?.id?.toString?.() ?? item?.id;
                return exerciseId === workoutExercise.exercise_id;
            });

            if (!exercise) {
                throw new Error(`Exercise not found: ${workoutExercise.exercise_id}`);
            }

            const exerciseId = exercise.id;
            const assignmentPrescription = assignment.prescriptions?.[exerciseId];

            // 1. Determine Global/Base Metrics (Legacy/Fallback)
            const globalMetrics =
                assignmentPrescription?.prescribedMetrics ??
                workoutExercise.default_Metrics ??
                {};

            // Remove 'sets' from the global metrics to avoid polluting the individual set prescription
            const { sets: _sets, ...baseMetrics } = globalMetrics;

            const setCount = this.getSetCount(exercise, assignmentPrescription);

            const sets = Array.from({ length: setCount }, (_, index) => {
                const setNumber = index + 1;

                // 2. Check for Assignment-level Per-Set Override
                const assignmentSetOverride = assignmentPrescription?.prescribedMetrics_sets?.find(
                    (s) => s.setNumber === setNumber
                );

                if (assignmentSetOverride) {
                    return {
                        setNumber,
                        prescribed: assignmentSetOverride.metrics,
                    };
                }

                // 3. Check for Workout-level Per-Set Default
                const workoutSetDefault = workoutExercise.default_Metrics_sets?.find(
                    (s) => s.setNumber === setNumber
                );

                if (workoutSetDefault) {
                    return {
                        setNumber,
                        prescribed: workoutSetDefault.metrics,
                    };
                }

                // 4. Fallback to Global Base Metrics
                return {
                    setNumber,
                    prescribed: baseMetrics,
                };
            });

            return {
                exerciseId,
                sets,
            };
        });
    }

    getSetCount(exercise, assignmentPrescription) {
        // 1. Check if assignment has a specific set count override in prescribedMetrics
        const prescribedSets = assignmentPrescription?.prescribedMetrics?.sets;
        if (prescribedSets !== undefined && prescribedSets !== null) {
            const parsedSets = Number(prescribedSets);
            if (!isNaN(parsedSets) && parsedSets > 0) {
                return parsedSets;
            }
        }

        // 2. Fallback to exercise default settings
        const prefersSets = exercise.settings?.sets_counting;
        return prefersSets ? 3 : 1;
    }
}

// ==========================================
// TEST CASES
// ==========================================

const resolver = new PrescriptionResolver();

const mockExercise = { id: 'ex1', settings: { sets_counting: true } };
const mockExercises = [mockExercise];

// Case 1: Global Metrics Only (Legacy)
console.log('--- Case 1: Global Metrics Only ---');
const case1 = resolver.resolvePrescriptions(
    { prescriptions: {} },
    {
        flow: {
            exercises: [{
                exercise_id: 'ex1',
                default_Metrics: { weight: 100, sets: 3 }
            }]
        }
    },
    mockExercises
);
console.log(JSON.stringify(case1[0].sets, null, 2));

// Case 2: Workout-level Per-Set Defaults
console.log('\n--- Case 2: Workout-level Per-Set Defaults ---');
const case2 = resolver.resolvePrescriptions(
    { prescriptions: {} },
    {
        flow: {
            exercises: [{
                exercise_id: 'ex1',
                default_Metrics: { weight: 100, sets: 3 },
                default_Metrics_sets: [
                    { setNumber: 2, metrics: { weight: 110 } }
                ]
            }]
        }
    },
    mockExercises
);
console.log(JSON.stringify(case2[0].sets, null, 2));

// Case 3: Assignment-level Per-Set Override
console.log('\n--- Case 3: Assignment-level Per-Set Override ---');
const case3 = resolver.resolvePrescriptions(
    {
        prescriptions: {
            'ex1': {
                prescribedMetrics: { weight: 100, sets: 3 },
                prescribedMetrics_sets: [
                    { setNumber: 3, metrics: { weight: 120 } }
                ]
            }
        }
    },
    {
        flow: {
            exercises: [{
                exercise_id: 'ex1',
                default_Metrics: { weight: 90, sets: 3 }
            }]
        }
    },
    mockExercises
);
console.log(JSON.stringify(case3[0].sets, null, 2));

// Case 4: Priority Check (Assignment > Workout > Global)
console.log('\n--- Case 4: Priority Check ---');
const case4 = resolver.resolvePrescriptions(
    {
        prescriptions: {
            'ex1': {
                prescribedMetrics: { weight: 100, sets: 3 },
                prescribedMetrics_sets: [
                    { setNumber: 1, metrics: { weight: 150 } } // Should override everything
                ]
            }
        }
    },
    {
        flow: {
            exercises: [{
                exercise_id: 'ex1',
                default_Metrics: { weight: 90, sets: 3 },
                default_Metrics_sets: [
                    { setNumber: 1, metrics: { weight: 140 } }, // Should be ignored
                    { setNumber: 2, metrics: { weight: 140 } }  // Should be used
                ]
            }]
        }
    },
    mockExercises
);
console.log(JSON.stringify(case4[0].sets, null, 2));

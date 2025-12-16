import { WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet } from '@/models/WorkoutSession';

export class SupersetSequencer {
    /**
     * Determines the next step in the workout session, handling superset logic.
     * Returns the ID of the next exercise to navigate to, or null if the workout is finished.
     */
    static getNextStep(
        session: WorkoutSession,
        currentExerciseId: string
    ): { exerciseId: string; setNumber?: number } | null {
        const exercises = session.exercises;
        const currentExerciseIndex = exercises.findIndex((e) => e.exerciseId === currentExerciseId);

        if (currentExerciseIndex === -1) return null;

        const currentExercise = exercises[currentExerciseIndex];
        const supersetId = currentExercise.supersetId;

        // 1. If not in a superset, just go to the next exercise in the list
        if (!supersetId) {
            // Check if current exercise is fully complete? 
            // Usually we just move to the next exercise when the user clicks "Next Exercise"
            // But if we are calling this after a SET completion, we might want to stay on the same exercise.

            // Logic: 
            // If we are just finishing a set, we stay here unless it was the last set.
            // But the caller (UI) usually handles "Next Set" vs "Next Exercise" for standard linear workouts.
            // The SupersetSequencer is specifically for "Auto-Switching".

            // So if not in superset, we return null to imply "Standard Behavior" (Stay here or manual next).
            return null;
        }

        // 2. We are in a superset. Find all exercises in this group.
        const supersetGroup = exercises.filter((e) => e.supersetId === supersetId);

        // Sort them by their order in the main exercises list to ensure consistent rotation
        // (Assuming they appear in order in the session.exercises array)
        // We can rely on the main array order.

        // 3. Determine the "Global Set Number" we are currently working on.
        // We look at the current exercise's sets to see what we just finished.
        // But wait, the UI calls this *after* marking a set as complete.
        // So we need to look for the *next* pending set across the group.

        // Let's iterate through the superset group in a loop (A -> B -> C -> A -> B -> C)
        // starting from the *next* exercise after the current one.

        const groupIndices = supersetGroup.map(e => exercises.findIndex(ex => ex.exerciseId === e.exerciseId));
        const currentGroupIndex = supersetGroup.findIndex(e => e.exerciseId === currentExerciseId);

        // We want to check:
        // 1. Next exercise in group, Set X (Current Set Number)
        // 2. Next exercise in group, Set X
        // ...
        // 3. First exercise in group, Set X+1

        // Actually, a simpler way:
        // Just find the *first* pending set in the entire superset group, 
        // searching in the order of (Set 1 of A, Set 1 of B, Set 2 of A, Set 2 of B...).

        // Let's determine the maximum number of sets in the group to know how many rounds we have.
        const maxSets = Math.max(...supersetGroup.map(e => e.sets.length));

        for (let setNum = 1; setNum <= maxSets; setNum++) {
            for (const exercise of supersetGroup) {
                const set = exercise.sets.find(s => s.setNumber === setNum);

                // If this set exists and is NOT completed, this is our target.
                if (set && set.status !== 'completed') {
                    // Found the next pending set!

                    // If it's the same exercise we are currently on, we stay here (return null or current).
                    // If it's a different exercise, we switch.
                    if (exercise.exerciseId === currentExerciseId) {
                        return null; // Stay here
                    }
                    return { exerciseId: exercise.exerciseId, setNumber: setNum };
                }
            }
        }

        // 4. If all sets in the superset are complete, move to the exercise *after* the superset block.
        // Find the last exercise index in the superset group
        const lastExerciseInGroupIndex = Math.max(...groupIndices);
        const nextExercise = exercises[lastExerciseInGroupIndex + 1];

        if (nextExercise) {
            return { exerciseId: nextExercise.exerciseId };
        }

        return null; // Workout complete
    }
}

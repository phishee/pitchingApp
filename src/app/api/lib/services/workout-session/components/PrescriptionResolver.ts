import { injectable } from 'inversify';
import { IPrescriptionResolver, ResolvedPrescription } from '../interfaces/IWorkoutSessionService';

@injectable()
export class PrescriptionResolver implements IPrescriptionResolver {
  resolvePrescriptions(
    assignment: any,
    workout: any,
    exercises: any[]
  ): ResolvedPrescription[] {
    const workoutExercises = workout.flow?.exercises ?? [];

    return workoutExercises.map((workoutExercise: any) => {
      const exercise = exercises.find((item: any) => {
        const exerciseId = item?.id?.toString?.() ?? item?.id;
        return exerciseId === workoutExercise.exercise_id;
      });

      if (!exercise) {
        throw new Error(`Exercise not found: ${workoutExercise.exercise_id}`);
      }

      const exerciseId = exercise.id?.toString?.() ?? exercise.id;

      const assignmentPrescription = assignment.prescriptions?.[exerciseId];
      const prescribedMetrics = assignmentPrescription?.prescribedMetrics;
      const isPerSet = Array.isArray(prescribedMetrics);


      // 1. Determine Global/Base Metrics (Legacy/Fallback)
      // If isPerSet, we don't have a global override from assignment (it's all per-set), so use workout default.
      const globalMetrics =
        (!isPerSet ? prescribedMetrics : undefined) ??
        workoutExercise.default_Metrics ??
        {};

      // Remove 'sets' from the global metrics to avoid polluting the individual set prescription
      const { sets: _sets, ...baseMetrics } = globalMetrics;

      const setCount = this.getSetCount(exercise, assignmentPrescription, isPerSet, prescribedMetrics);

      const sets = Array.from({ length: setCount }, (_, index) => {
        const setNumber = index + 1;

        // 2. Check for Assignment-level Per-Set Override
        let assignmentSetOverride;
        if (isPerSet) {
          assignmentSetOverride = prescribedMetrics.find((s: any) => s.setNumber === setNumber);
        } else {
          // Legacy check
          assignmentSetOverride = assignmentPrescription?.prescribedMetrics_sets?.find(
            (s: any) => s.setNumber === setNumber
          );
        }

        if (assignmentSetOverride) {
          return {
            setNumber,
            prescribed: assignmentSetOverride.metrics,
          };
        }

        // 3. Check for Workout-level Per-Set Default
        const workoutSetDefault = workoutExercise.default_Metrics_sets?.find(
          (s: any) => s.setNumber === setNumber
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

  private getSetCount(exercise: any, assignmentPrescription: any, isPerSet: boolean, prescribedMetrics: any): number {
    // 1. If per-set array provided, use its length
    if (isPerSet && Array.isArray(prescribedMetrics)) {
      return prescribedMetrics.length;
    }

    // 2. Check if assignment has a specific set count override in prescribedMetrics (Global object)
    const prescribedSets = prescribedMetrics?.sets;
    if (prescribedSets !== undefined && prescribedSets !== null) {
      const parsedSets = Number(prescribedSets);
      if (!isNaN(parsedSets) && parsedSets > 0) {
        return parsedSets;
      }
    }

    // 3. Fallback to exercise default settings
    const prefersSets = exercise.settings?.sets_counting;
    return prefersSets ? 3 : 1;
  }
}


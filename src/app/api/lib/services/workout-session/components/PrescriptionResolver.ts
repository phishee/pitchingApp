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

      const exerciseId = exercise.id;
      const assignmentPrescription = assignment.prescriptions?.[exerciseId];

      const prescribedMetrics =
        assignmentPrescription?.prescribedMetrics ??
        workoutExercise.default_Metrics ??
        {};

      const setCount = this.getSetCount(exercise, assignmentPrescription);

      // Remove 'sets' from the metrics that go into each individual set
      const { sets: _sets, ...metricsPerSet } = prescribedMetrics;

      const sets = Array.from({ length: setCount }, (_, index) => ({
        setNumber: index + 1,
        prescribed: metricsPerSet,
      }));

      return {
        exerciseId,
        sets,
      };
    });
  }

  private getSetCount(exercise: any, assignmentPrescription: any): number {
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


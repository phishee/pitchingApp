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

      const setCount = this.getSetCount(exercise);

      const sets = Array.from({ length: setCount }, (_, index) => ({
        setNumber: index + 1,
        prescribed: prescribedMetrics,
      }));

      return {
        exerciseId,
        sets,
      };
    });
  }

  private getSetCount(exercise: any): number {
    const prefersSets = exercise.settings?.sets_counting;
    return prefersSets ? 3 : 1;
  }
}


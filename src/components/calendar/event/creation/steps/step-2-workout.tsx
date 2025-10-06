// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Dumbbell, Check, AlertCircle } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { WorkoutStepProps } from '../work-assignment-types';

// export function Step2SelectWorkout({
//   assignmentData,
//   onAssignmentDataChange,
//   availableWorkouts,
//   isLoadingWorkouts
// }: WorkoutStepProps) {
//   const handleWorkoutSelect = (workout: any) => {
//     onAssignmentDataChange({ selectedWorkout: workout });
//   };

//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-base">
//             <Dumbbell className="h-4 w-4" />
//             Select Workout
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {isLoadingWorkouts ? (
//             <div className="flex items-center justify-center py-8">
//               <div className="text-sm text-muted-foreground">Loading workouts...</div>
//             </div>
//           ) : availableWorkouts.length === 0 ? (
//             <div className="text-center py-8">
//               <Dumbbell className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
//               <p className="text-muted-foreground mb-4">No workouts available</p>
//               <Button variant="outline">Create a Workout</Button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {availableWorkouts.map((workout) => (
//                 <div
//                   key={workout.id}
//                   onClick={() => handleWorkoutSelect(workout)}
//                   className={cn(
//                     "p-4 border rounded-lg cursor-pointer transition-all",
//                     assignmentData.selectedWorkout?.id === workout.id
//                       ? "bg-primary/5 border-primary ring-2 ring-primary"
//                       : "hover:bg-muted/50 hover:border-muted-foreground/30"
//                   )}
//                 >
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex-1">
//                       <h4 className="font-medium">{workout.name}</h4>
//                       <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
//                         {workout.description}
//                       </p>
//                     </div>
//                     {assignmentData.selectedWorkout?.id === workout.id && (
//                       <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
//                     )}
//                   </div>
//                   <div className="flex flex-wrap gap-2 mt-3">
//                     <Badge variant="outline" className="text-xs">
//                       {workout.flow.exercises.length} exercises
//                     </Badge>
//                     {workout.tags.slice(0, 2).map(tag => (
//                       <Badge key={tag} variant="secondary" className="text-xs">
//                         {tag}
//                       </Badge>
//                     ))}
//                     {workout.tags.length > 2 && (
//                       <Badge variant="secondary" className="text-xs">
//                         +{workout.tags.length - 2}
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Validation Message */}
//       {!assignmentData.selectedWorkout && (
//         <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-900 dark:text-amber-200 text-sm">
//           <AlertCircle className="h-4 w-4 flex-shrink-0" />
//           <p>Please select a workout to continue</p>
//         </div>
//       )}
//     </div>
//   );
// }

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkoutStepProps } from '../work-assignment-types';
import { useWorkoutEventCreation } from '@/providers/event-creation-context';
import { Workout } from '@/models';

export function Step2SelectWorkout({
  assignmentData,
  onAssignmentDataChange,
  availableWorkouts,
  isLoadingWorkouts
}: WorkoutStepProps) {
  const { 
    workoutDetails, 
    setWorkoutAndPrescriptions,
    updateWorkoutDetails 
  } = useWorkoutEventCreation();

  const handleWorkoutSelect = (workout: Workout) => {
    // Update the context with the selected workout and initialize exercise prescriptions
    setWorkoutAndPrescriptions(workout.id, workout.flow.exercises);
    
    // Also update the assignment data for backward compatibility
    onAssignmentDataChange({ selectedWorkout: workout });
  };

  // Get the currently selected workout from context
  const selectedWorkoutId = workoutDetails?.workoutId;
  const selectedWorkout = availableWorkouts.find(w => w.id === selectedWorkoutId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-4 w-4" />
            Select Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingWorkouts ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading workouts...</div>
            </div>
          ) : availableWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No workouts available</p>
              <Button variant="outline">Create a Workout</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => handleWorkoutSelect(workout)}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    selectedWorkoutId === workout.id
                      ? "bg-primary/5 border-primary ring-2 ring-primary"
                      : "hover:bg-muted/50 hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{workout.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {workout.description}
                      </p>
                    </div>
                    {selectedWorkoutId === workout.id && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {workout.flow.exercises.length} exercises
                    </Badge>
                    {workout.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {workout.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{workout.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show selected workout details */}
      {selectedWorkout && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Dumbbell className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-primary">{selectedWorkout.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedWorkout.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedWorkout.flow.exercises.length} exercises
                  </Badge>
                  {selectedWorkout.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Message */}
      {!selectedWorkoutId && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-900 dark:text-amber-200 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>Please select a workout to continue</p>
        </div>
      )}
    </div>
  );
}

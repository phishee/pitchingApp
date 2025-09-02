import React from 'react';
import { Users } from 'lucide-react';
import { WorkoutStatCard } from './components/WorkoutStatCard';

interface WorkoutOverviewTabProps {
  workout: any;
}

export function WorkoutOverviewTab({ workout }: WorkoutOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Workout Structure */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Workout Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WorkoutStatCard 
            value={workout.flow.exercises.length} 
            label="Total Exercises" 
            color="blue" 
          />
          <WorkoutStatCard 
            value={workout.flow.questionnaires.length} 
            label="Questionnaires" 
            color="green" 
          />
          <WorkoutStatCard 
            value={workout.flow.warmup.length} 
            label="Warmup Items" 
            color="purple" 
          />
        </div>
      </div>

      {/* Team Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Assignment</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Assigned Teams</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {workout.teamIds.map((teamId: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
              >
                {teamId}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Creator Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Workout Information</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Created By</div>
              <div className="font-medium text-gray-900">{workout.createdBy.userId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="font-medium text-gray-900">{workout.updatedBy.userId}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



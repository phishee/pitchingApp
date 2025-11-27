import React from 'react';
import { Users, User } from 'lucide-react';
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
            value={workout.flow?.exercises?.length || 0}
            label="Total Exercises"
            color="blue"
          />
          <WorkoutStatCard
            value={workout.flow?.questionnaires?.length || 0}
            label="Questionnaires"
            color="green"
          />
          <WorkoutStatCard
            value={workout.flow?.warmup?.length || 0}
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
            {(workout.teamIds || []).map((teamId: string, index: number) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Created By */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Created By</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {workout.createdByUser?.profileImageUrl ? (
                    <img
                      src={workout.createdByUser.profileImageUrl}
                      alt={workout.createdByUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {workout.createdByUser?.name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {workout.createdByUser?.email || workout.createdBy.userId}
                  </div>
                </div>
              </div>
            </div>

            {/* Last Updated By */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Last Updated By</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {workout.updatedByUser?.profileImageUrl ? (
                    <img
                      src={workout.updatedByUser.profileImageUrl}
                      alt={workout.updatedByUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {workout.updatedByUser?.name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {workout.updatedByUser?.email || workout.updatedBy.userId}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



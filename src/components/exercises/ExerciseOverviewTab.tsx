import React from 'react';

interface ExerciseOverviewTabProps {
  exercise: any;
}

export function ExerciseOverviewTab({ exercise }: ExerciseOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Exercise Structure */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{exercise.structure}</div>
            <div className="text-sm text-gray-600">Structure Type</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {exercise.settings?.sets_counting ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600">Sets Counting</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {exercise.settings?.reps_counting ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600">Reps Counting</div>
          </div>
        </div>
      </div>

      {/* RPE Information */}
      {exercise.rpe && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate of Perceived Exertion</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-orange-600">{exercise.rpe.range}</div>
              <div>
                <div className="font-medium text-gray-900">{exercise.rpe.type}</div>
                <div className="text-sm text-gray-600">{exercise.rpe.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise Information</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Owner</div>
              <div className="font-medium text-gray-900 capitalize">{exercise.owner}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Type</div>
              <div className="font-medium text-gray-900">{exercise.type}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from './components/EmptyState';

export function WorkoutHistoryTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Workout History</h3>
      <EmptyState
        icon={BarChart3}
        title="No workout history yet"
        description="This workout hasn't been completed by any athletes"
      />
    </div>
  );
}
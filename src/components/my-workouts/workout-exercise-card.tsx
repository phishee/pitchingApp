import React from 'react';
import Image from 'next/image';
import { Exercise } from '@/models/Exercise';
import { MetricValue } from '@/models/Metric';

interface WorkoutExerciseCardProps {
  exercise: Exercise | undefined;
  sets: Array<{ setNumber: number; metrics: Record<string, MetricValue> }> | undefined;
}

export function WorkoutExerciseCard({ exercise, sets }: WorkoutExerciseCardProps) {
  // Get exercise image - prefer image, then photoCover, then default
  const imageUrl = exercise?.image || exercise?.photoCover || '/assets/images/default_profile.png';
  const exerciseName = exercise?.name || 'Unknown Exercise';

  // Helper to format metric value
  const formatMetric = (value: MetricValue, unit?: string): string => {
    if (value === undefined || value === null) return '';
    return unit ? `${value} ${unit}` : `${value}`;
  };

  // Determine display text based on metrics
  let displayText = '';

  if (sets && sets.length > 0) {
    // Use first set metrics for display
    const displayMetrics = sets[0].metrics;

    const parts: string[] = [];

    // 1. Sets
    const setsCount = sets.length;

    if (setsCount > 1) {
      parts.push(`${setsCount} Sets`);
    }

    // 2. Primary Metric (Reps, Duration, Distance, etc.)
    // Check for reps
    if (displayMetrics.reps !== undefined) {
      parts.push(formatMetric(displayMetrics.reps, 'Reps'));
    } else if (displayMetrics.reps_min !== undefined && displayMetrics.reps_max !== undefined) {
      parts.push(`${displayMetrics.reps_min}-${displayMetrics.reps_max} Reps`);
    }
    // Check for duration
    else if (displayMetrics.duration !== undefined) {
      // Simple heuristic for unit if not provided (could be improved with metadata)
      parts.push(formatMetric(displayMetrics.duration, 's'));
    }
    // Check for distance
    else if (displayMetrics.distance !== undefined) {
      parts.push(formatMetric(displayMetrics.distance, 'ft'));
    }
    // Check for pitch count
    else if (displayMetrics.pitch_count !== undefined) {
      parts.push(formatMetric(displayMetrics.pitch_count, 'Pitches'));
    }
    // Check for weight
    else if (displayMetrics.weight !== undefined) {
      parts.push(formatMetric(displayMetrics.weight, 'lbs'));
    }

    if (parts.length > 0) {
      displayText = parts.join(' x ');
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-4">
        {/* Left: Exercise Image */}
        <div className="relative w-16 h-16 rounded-full border border-purple-600 overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl}
            alt={exerciseName}
            fill
            className="object-cover"
            sizes="40px"
            onError={(e) => {
              // Fallback to default image on error
              (e.target as HTMLImageElement).src = '/assets/images/default_profile.png';
            }}
          />
        </div>

        {/* Right: Exercise Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 mb-1 truncate">
            {exerciseName}
          </h3>
          {displayText && (
            <p className="text-sm text-purple-500 font-medium">
              {displayText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


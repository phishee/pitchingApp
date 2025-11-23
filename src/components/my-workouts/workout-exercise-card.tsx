import React from 'react';
import Image from 'next/image';
import { Exercise } from '@/models/Exercise';
import { MetricValue } from '@/models/Metric';

interface WorkoutExerciseCardProps {
  exercise: Exercise | undefined;
  metrics: Record<string, MetricValue> | undefined;
}

export function WorkoutExerciseCard({ exercise, metrics }: WorkoutExerciseCardProps) {
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

  if (metrics) {
    const parts: string[] = [];

    // 1. Sets (only if > 1)
    const sets = Number(metrics.sets);
    if (!isNaN(sets) && sets > 1) {
      parts.push(`${sets} Sets`);
    }

    // 2. Primary Metric (Reps, Duration, Distance, etc.)
    // Check for reps
    if (metrics.reps !== undefined) {
      parts.push(formatMetric(metrics.reps, 'Reps'));
    } else if (metrics.reps_min !== undefined && metrics.reps_max !== undefined) {
      parts.push(`${metrics.reps_min}-${metrics.reps_max} Reps`);
    }
    // Check for duration
    else if (metrics.duration !== undefined) {
      // Simple heuristic for unit if not provided (could be improved with metadata)
      parts.push(formatMetric(metrics.duration, 's'));
    }
    // Check for distance
    else if (metrics.distance !== undefined) {
      parts.push(formatMetric(metrics.distance, 'ft'));
    }
    // Check for pitch count
    else if (metrics.pitch_count !== undefined) {
      parts.push(formatMetric(metrics.pitch_count, 'Pitches'));
    }
    // Check for weight
    else if (metrics.weight !== undefined) {
      parts.push(formatMetric(metrics.weight, 'lbs'));
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


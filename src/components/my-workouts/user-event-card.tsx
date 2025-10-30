'use client';

import React from 'react';
import Image from 'next/image';
import { EnrichedEvent } from '@/providers/user-event-context';
import { Play, Check } from 'lucide-react';

interface UserEventCardProps {
  enrichedEvent: EnrichedEvent;
  onClick?: () => void;
}

export function UserEventCard({ enrichedEvent, onClick }: UserEventCardProps) {
  const { event, exerciseCount, estimatedDuration, workout } = enrichedEvent;

  // Determine if workout is completed
  const isCompleted = event.status === 'completed';

  // Get image URL - prefer cover photo from event, fallback to workout cover image
  const imageUrl = event.coverPhotoUrl || workout?.coverImage || '/assets/images/default_profile.png';

  // Format exercise count and duration
  const subtitle = exerciseCount && estimatedDuration
    ? `${exerciseCount} exercises • ${estimatedDuration} min`
    : estimatedDuration
    ? `${estimatedDuration} min`
    : '';

  // Get event type icon/text for assessments vs workouts
  const isAssessment = event.type === 'assessment';
  const eventTypeLabel = isAssessment ? 'Assessment' : 'Workout';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.99] cursor-pointer"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Left: Image Thumbnail */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="80px"
            onError={(e) => {
              // Fallback to default image on error
              (e.target as HTMLImageElement).src = '/assets/images/default_profile.png';
            }}
          />
        </div>

        {/* Middle: Event Details */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Event type badge for assessments */}
          {isAssessment && (
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mb-1">
              {eventTypeLabel}
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-gray-900 truncate mb-1">
            {event.title}
          </h3>

          {/* Subtitle with exercise count and duration */}
          {subtitle && (
            <p className="text-sm text-gray-600 truncate">
              {subtitle}
            </p>
          )}

          {/* Description (optional, only if no subtitle) */}
          {!subtitle && event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        {/* Right: Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className={`
            flex items-center justify-center
            w-12 h-12 rounded-full
            transition-all duration-200
            flex-shrink-0
            ${
              isCompleted
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }
          `}
        >
          {isCompleted ? (
            <Check className="w-6 h-6" strokeWidth={3} />
          ) : (
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          )}
        </button>
      </div>
    </div>
  );
}

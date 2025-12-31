'use client';

import React from 'react';
import Image from 'next/image';
import { EnrichedEvent } from '@/providers/user-event-context';
import { Play, Check, Clock, XCircle, SkipForward, AlertTriangle } from 'lucide-react';

interface UserEventCardProps {
  enrichedEvent: EnrichedEvent;
  onClick?: () => void;
}

// Removed useAppTheme import

export function UserEventCard({ enrichedEvent, onClick }: UserEventCardProps) {
  const { event, exerciseCount, estimatedDuration, workout } = enrichedEvent;
  // Removed useAppTheme hook

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
      className="bg-white dark:bg-zinc-900 rounded-4xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.99] cursor-pointer"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Left: Image Thumbnail */}
        <div className="relative w-15 h-15 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="60px"
            onError={(e) => {
              // Fallback to default image on error
              (e.target as HTMLImageElement).src = '/assets/images/default_profile.png';
            }}
          />
        </div>

        {/* Middle: Event Details */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Event type badge for assessments */}
          {(isAssessment || event.type === 'bullpen') && (
            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${event.type === 'bullpen'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              }`}>
              {event.type === 'bullpen' ? 'Bullpen' : eventTypeLabel}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
            {event.title}
          </h3>

          {/* Subtitle with exercise count and duration */}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}

          {/* Description (optional, only if no subtitle) */}
          {!subtitle && event.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        {/* Right: Action Button */}
        {(() => {
          switch (event.status) {
            case 'completed':
              return (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-status-completed text-status-completed-foreground flex-shrink-0">
                  <Check className="w-6 h-6" strokeWidth={3} />
                </div>
              );
            case 'in_progress':
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                  }}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-status-inprogress text-status-inprogress-foreground flex-shrink-0 animate-pulse"
                >
                  <Clock className="w-6 h-6" strokeWidth={2.5} />
                </button>
              );
            case 'abandoned':
              return (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-status-abandoned text-status-abandoned-foreground flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                </div>
              );
            case 'cancelled':
              return (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-status-cancelled text-status-cancelled-foreground flex-shrink-0">
                  <XCircle className="w-6 h-6" strokeWidth={2.5} />
                </div>
              );
            case 'skipped':
              return (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-status-skipped text-status-skipped-foreground flex-shrink-0">
                  <SkipForward className="w-6 h-6" strokeWidth={2.5} />
                </div>
              );
            default:
              // Scheduled or unknown
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                  }}
                  className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 flex-shrink-0 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Play className="w-6 h-6 ml-1" fill="currentColor" />
                </button>
              );
          }
        })()}
      </div>
    </div>
  );
}

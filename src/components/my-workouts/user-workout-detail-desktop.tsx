'use client';

import React from 'react';

export function UserWorkoutDetailDesktop() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 mx-auto">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          This feature is only available on mobile devices
        </h2>
        <p className="text-gray-600">
          Please access this page from your mobile device to view and start your workout.
        </p>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { Play, Image as ImageIcon, FileText, Video } from 'lucide-react';
import { Exercise } from '@/models';
import Image from 'next/image';

interface ExerciseInstructionsTabProps {
  exercise: Exercise;
}

export function ExerciseInstructionsTab({ exercise }: ExerciseInstructionsTabProps) {
  const [activeView, setActiveView] = useState<'text' | 'image' | 'video'>('text');

  const hasText = exercise.instructions?.text?.length > 0;
  const hasImage = exercise?.instructions?.animationPicture;
  const hasVideo = exercise.instructions?.video;

  // Determine initial view based on available content
  React.useEffect(() => {
    if (activeView === 'text' && !hasText) {
      if (hasImage) setActiveView('image');
      else if (hasVideo) setActiveView('video');
    }
  }, [activeView, hasText, hasImage, hasVideo]);

  const tabs = [
    { id: 'text', label: 'Text', icon: FileText, available: hasText },
    { id: 'image', label: 'Image', icon: ImageIcon, available: hasImage },
    { id: 'video', label: 'Video', icon: Video, available: hasVideo },
  ].filter(tab => tab.available);

  if (tabs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No instructions available</p>
        <p className="text-sm">Instructions for this exercise haven't been added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle Buttons */}
      {tabs.length > 1 && (
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as 'text' | 'image' | 'video')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeView === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeView === 'text' && hasText && (
        <div className="space-y-3">
          {exercise.instructions?.text?.map((step: string, index: number) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      )}

      {activeView === 'image' && hasImage && (
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <div className="aspect-video relative">
            <Image
              src={exercise?.instructions?.animationPicture}
              alt={`${exercise.name} animation`}
              className="w-full h-full object-cover"
              width={100}
              height={100}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 p-4">
            Visual demonstration of the exercise movement
          </p>
        </div>
      )}

      {activeView === 'video' && hasVideo && (
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">{exercise.instructions.video}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Click the play button on the exercise image to view the demonstration
          </p>
        </div>
      )}
    </div>
  );
}
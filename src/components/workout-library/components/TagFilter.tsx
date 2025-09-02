import React from 'react';
import { Button } from '@/components/ui/button';
import { formatTagName } from '@/lib/workoutLibraryUtils';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
  isVisible: boolean;
}

export function TagFilter({ tags, selectedTags, onTagToggle, onClearAll, isVisible }: TagFilterProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {formatTagName(tag)}
          </button>
        ))}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="text-xs text-gray-500">
          {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
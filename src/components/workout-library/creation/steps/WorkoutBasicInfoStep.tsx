import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { formatTagName } from '@/lib/workoutLibraryUtils';
import { WorkoutImagePicker } from '../../WorkoutImagePicker';
import { useWorkoutMetadata } from '@/providers/workout-context';

const availableTags = [
  'strength', 'cardio', 'power', 'baseball', 'mobility', 'speed', 'recovery', 'endurance'
];

export function WorkoutBasicInfoStep() {
  const { workoutMetadata, updateName, updateDescription, updateTags, updateCoverImage } = useWorkoutMetadata();
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag && !workoutMetadata.tags.includes(newTag)) {
      updateTags([...workoutMetadata.tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateTags(workoutMetadata.tags.filter((tag: string) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Workout Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Name *
            </label>
            <Input
              placeholder="Enter workout name"
              value={workoutMetadata.name}
              onChange={(e) => updateName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              placeholder="Describe the workout, its goals, and target audience"
              value={workoutMetadata.description}
              onChange={(e) => updateDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <WorkoutImagePicker
              value={workoutMetadata.coverImage}
              onChange={(imageUrl) => updateCoverImage(imageUrl)}
              searchQuery={workoutMetadata.name || "workout"}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {workoutMetadata.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {formatTagName(tag)}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .filter(tag => !workoutMetadata.tags.includes(tag))
                  .map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        updateTags([...workoutMetadata.tags, tag]);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {formatTagName(tag)}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
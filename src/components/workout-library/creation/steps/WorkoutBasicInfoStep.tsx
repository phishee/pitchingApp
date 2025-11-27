import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutImagePicker } from '../../WorkoutImagePicker';
import { useWorkoutMetadata } from '@/providers/workout-context';
import { TagPicker } from '@/components/ui/tag-picker';

export function WorkoutBasicInfoStep() {
  const { workoutMetadata, updateName, updateDescription, updateTags, updateCoverImage } = useWorkoutMetadata();

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
            <TagPicker
              selectedTags={workoutMetadata.tags}
              onTagsChange={updateTags}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
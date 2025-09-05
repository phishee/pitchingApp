import React from 'react';
import { ImagePicker } from '@/components/common/ImagePicker';

interface WorkoutImagePickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function WorkoutImagePicker({ value, onChange, className }: WorkoutImagePickerProps) {
  return (
    <ImagePicker
      value={value}
      onChange={onChange}
      multiple={false}
      placeholder="Select a workout cover image"
      className={className}
      unsplashSearchQuery="MaleChest Workout"
      unsplashOrientation="landscape"
    //   unsplashColor="blue"
    />
  );
}
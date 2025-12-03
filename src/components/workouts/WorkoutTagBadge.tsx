import React from 'react';
import { Tag } from '@/components/ui/tag';

interface WorkoutTagBadgeProps {
  tag: string;
  variant?: 'primary' | 'secondary';
}

export function WorkoutTagBadge({ tag, variant = 'secondary' }: WorkoutTagBadgeProps) {
  return (
    <Tag
      value={tag}
      variant={variant}
    />
  );
}
import React from 'react';

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-500">
      <Icon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  );
}
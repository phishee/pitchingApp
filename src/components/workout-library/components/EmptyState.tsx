import React from 'react';

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-16 text-gray-500">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-xl font-medium text-gray-600 mb-2">{title}</p>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
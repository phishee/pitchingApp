import React from 'react';
import { Eye, Bookmark, BarChart3, Calendar } from 'lucide-react';

interface ExerciseTabsProps {
  selectedTab: string;
  onTabChange: (tabId: string) => void;
}

export function ExerciseTabs({ selectedTab, onTabChange }: ExerciseTabsProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'instructions', label: 'Instructions', icon: Bookmark },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: Calendar },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
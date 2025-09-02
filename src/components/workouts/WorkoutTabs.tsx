import React from 'react';
import { Eye, FileText, Target, Calendar } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface WorkoutTabsProps {
  selectedTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'flow', label: 'Workout Flow', icon: FileText },
  { id: 'exercises', label: 'Exercises', icon: Target },
  { id: 'history', label: 'History', icon: Calendar },
];

export function WorkoutTabs({ selectedTab, onTabChange, children }: WorkoutTabsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6">
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

      {/* Tab Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}



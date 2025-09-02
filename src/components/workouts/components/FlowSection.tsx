import React from 'react';
import { FileText, Zap } from 'lucide-react';
import { formatTagName } from '@/lib/workoutUtils';

interface FlowSectionProps {
  type: 'questionnaires' | 'warmup';
  items: string[];
  title: string;
}

export function FlowSection({ type, items, title }: FlowSectionProps) {
  if (items.length === 0) return null;

  const getIcon = () => {
    switch (type) {
      case 'questionnaires':
        return FileText;
      case 'warmup':
        return Zap;
      default:
        return FileText;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'questionnaires':
        return {
          container: 'bg-blue-50 border-blue-100',
          icon: 'text-blue-600',
          text: 'text-blue-900'
        };
      case 'warmup':
        return {
          container: 'bg-green-50 border-green-100',
          icon: 'text-green-600',
          text: 'text-green-900'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-100',
          icon: 'text-gray-600',
          text: 'text-gray-900'
        };
    }
  };

  const Icon = getIcon();
  const styles = getStyles();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className={`flex items-center gap-3 p-3 ${styles.container} rounded-lg border`}>
            <Icon className={`w-4 h-4 ${styles.icon}`} />
            <span className={`${styles.text} capitalize`}>{formatTagName(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
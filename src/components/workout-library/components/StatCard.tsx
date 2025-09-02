import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          card: 'bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          valueColor: 'text-blue-900',
          labelColor: 'text-blue-700'
        };
      case 'green':
        return {
          card: 'bg-green-50 border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          valueColor: 'text-green-900',
          labelColor: 'text-green-700'
        };
      case 'purple':
        return {
          card: 'bg-purple-50 border-purple-200',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          valueColor: 'text-purple-900',
          labelColor: 'text-purple-700'
        };
      case 'orange':
        return {
          card: 'bg-orange-50 border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          valueColor: 'text-orange-900',
          labelColor: 'text-orange-700'
        };
      default:
        return {
          card: 'bg-gray-50 border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          valueColor: 'text-gray-900',
          labelColor: 'text-gray-700'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Card className={colors.card}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${colors.iconBg} rounded-lg`}>
            <Icon className={`w-5 h-5 ${colors.iconColor}`} />
          </div>
          <div>
            <div className={`text-2xl font-bold ${colors.valueColor}`}>{value}</div>
            <div className={`text-sm ${colors.labelColor}`}>{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
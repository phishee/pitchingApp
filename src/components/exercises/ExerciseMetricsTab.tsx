import React from 'react';
import { Calculator, Activity } from 'lucide-react';

// Types
interface Metric {
  id: string;
  unit: string;
  input: 'manual' | 'formula';
  required?: boolean;
  prescribable?: boolean;
  formula?: string;
}

interface RPE {
  type: string;
  range: string;
  description: string;
}

interface Exercise {
  metrics?: Metric[];
  rpe?: RPE;
}

interface ExerciseMetricsTabProps {
  exercise: Exercise;
}

// Utility functions
const getMetricIcon = (metric: Metric) => {
  if (metric.input === 'formula') return Calculator;
  if (metric.required) return Activity;
  return Activity;
};

const getMetricColor = (metric: Metric) => {
  if (metric.input === 'formula') return 'text-purple-600 bg-purple-100';
  if (metric.required) return 'text-blue-600 bg-blue-100';
  return 'text-gray-600 bg-gray-100';
};

// Badge Component
interface MetricBadgeProps {
  type: 'calculated' | 'required' | 'prescribable';
  children: React.ReactNode;
}

function MetricBadge({ type, children }: MetricBadgeProps) {
  const getBadgeStyles = () => {
    switch (type) {
      case 'calculated':
        return 'bg-purple-100 text-purple-700';
      case 'required':
        return 'bg-blue-100 text-blue-700';
      case 'prescribable':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`px-2 py-1 ${getBadgeStyles()} text-xs rounded-full font-medium`}>
      {children}
    </span>
  );
}

// Metric Header Component
interface MetricHeaderProps {
  metric: Metric;
}

function MetricHeader({ metric }: MetricHeaderProps) {
  const MetricIcon = getMetricIcon(metric);
  const metricColor = getMetricColor(metric);

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${metricColor.split(' ')[1]}`}>
          <MetricIcon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 capitalize">
            {metric.id.replace(/_/g, ' ')}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{metric.unit}</span>
            {metric.input === 'formula' && (
              <MetricBadge type="calculated">Calculated</MetricBadge>
            )}
            {metric.required && (
              <MetricBadge type="required">Required</MetricBadge>
            )}
            {metric.prescribable && (
              <MetricBadge type="prescribable">Prescribable</MetricBadge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Formula Display Component
interface FormulaDisplayProps {
  formula: string;
}

function FormulaDisplay({ formula }: FormulaDisplayProps) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-900">Formula</span>
      </div>
      <div className="font-mono text-sm text-purple-800 bg-white px-3 py-2 rounded border">
        {formula}
      </div>
    </div>
  );
}

// Input Type Info Component
interface InputTypeInfoProps {
  input: 'manual' | 'formula';
}

function InputTypeInfo({ input }: InputTypeInfoProps) {
  return (
    <div className="text-sm text-gray-600">
      <span className="font-medium">Input:</span> {input === 'manual' ? 'Manual Entry' : 'Automatically Calculated'}
    </div>
  );
}

// Individual Metric Card Component
interface MetricCardProps {
  metric: Metric;
  index: number;
}

function MetricCard({ metric, index }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <MetricHeader metric={metric} />
      
      {metric.input === 'formula' && metric.formula && (
        <FormulaDisplay formula={metric.formula} />
      )}
      
      <InputTypeInfo input={metric.input} />
    </div>
  );
}

// RPE Scale Display Component
interface RPEScaleDisplayProps {
  range: string;
}

function RPEScaleDisplay({ range }: RPEScaleDisplayProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-orange-200">
      <div className="text-3xl font-bold text-orange-600 text-center">
        {range}
      </div>
      <div className="text-sm text-gray-600 text-center">Scale Range</div>
    </div>
  );
}

// RPE Description Component
interface RPEDescriptionProps {
  description: string;
}

function RPEDescription({ description }: RPEDescriptionProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-orange-200">
      <div className="text-sm text-gray-600 mb-2">Description</div>
      <div className="text-sm text-gray-800">{description}</div>
    </div>
  );
}

// RPE Section Component
interface RPESectionProps {
  rpe: RPE;
}

function RPESection({ rpe }: RPESectionProps) {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-100">
          <Activity className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Rate of Perceived Exertion (RPE)</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{rpe.type}</span>
            <MetricBadge type="prescribable">Subjective</MetricBadge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RPEScaleDisplay range={rpe.range} />
        <RPEDescription description={rpe.description} />
      </div>
    </div>
  );
}

// Summary Stat Component
interface SummaryStatProps {
  value: number;
  label: string;
  color: 'blue' | 'green' | 'purple';
}

function SummaryStat({ value, label, color }: SummaryStatProps) {
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'purple':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${getColorClass()}`}>
        {value}
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

// Metrics Summary Component
interface MetricsSummaryProps {
  metrics: Metric[];
}

function MetricsSummary({ metrics }: MetricsSummaryProps) {
  const requiredCount = metrics?.filter(m => m.required).length || 0;
  const prescribableCount = metrics?.filter(m => m.prescribable).length || 0;
  const calculatedCount = metrics?.filter(m => m.input === 'formula').length || 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">Metrics Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <SummaryStat value={requiredCount} label="Required" color="blue" />
        <SummaryStat value={prescribableCount} label="Prescribable" color="green" />
        <SummaryStat value={calculatedCount} label="Calculated" color="purple" />
      </div>
    </div>
  );
}

// Main Component Header
interface MetricsHeaderProps {
  metricsCount: number;
}

function MetricsHeader({ metricsCount }: MetricsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Tracking Metrics</h3>
      <div className="text-sm text-gray-500">
        {metricsCount} metrics configured
      </div>
    </div>
  );
}

// Main ExerciseMetricsTab Component
export function ExerciseMetricsTab({ exercise }: ExerciseMetricsTabProps) {
  return (
    <div className="space-y-6">
      <MetricsHeader metricsCount={exercise.metrics?.length || 0} />

      {/* Metrics Grid */}
      <div className="space-y-4">
        {exercise.metrics?.map((metric, index) => (
          <MetricCard key={index} metric={metric} index={index} />
        ))}

        {/* RPE Section - Always Last */}
        {exercise.rpe && <RPESection rpe={exercise.rpe} />}
      </div>

      {/* Metrics Summary */}
      {exercise.metrics && <MetricsSummary metrics={exercise.metrics} />}
    </div>
  );
}
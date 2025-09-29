import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ExerciseMetricPrescription } from '../work-assignment-types';

interface ExercisePrescriptionCardProps {
  prescription: ExerciseMetricPrescription;
  onPrescriptionToggle: (exerciseId: string) => void;
  onMetricChange: (exerciseId: string, metricId: string, value: any) => void;
}

export function ExercisePrescriptionCard({
  prescription,
  onPrescriptionToggle,
  onMetricChange
}: ExercisePrescriptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <SwitchWrapper>
            <Switch
              checked={prescription.isPrescribed}
              onCheckedChange={() => onPrescriptionToggle(prescription.exerciseId)}
            />
          </SwitchWrapper>
          <div className="flex-1">
            <h4 className="font-medium">{prescription.exerciseName}</h4>
            <p className="text-sm text-muted-foreground">
              {prescription.isPrescribed ? 'Custom metrics enabled' : 'Using default metrics'}
            </p>
          </div>
        </div>
        {prescription.isPrescribed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {isExpanded && prescription.isPrescribed && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(prescription.prescribedMetrics).map(([metricId, value]) => {
              const metric = prescription.exercise.metrics.find(m => m.id === metricId);
              if (!metric) return null;

              return (
                <div key={metricId}>
                  <Label className="text-sm font-medium mb-1 block">
                    {metricId.replace('_', ' ').toUpperCase()}
                    {metric.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    type={metric.input === 'number' ? 'number' : 'text'}
                    value={value || ''}
                    onChange={(e) => {
                      const newValue = metric.input === 'number' 
                        ? parseFloat(e.target.value) || 0
                        : e.target.value;
                      onMetricChange(prescription.exerciseId, metricId, newValue);
                    }}
                    placeholder={`Default: ${prescription.defaultMetrics[metricId]}`}
                  />
                  {metric.unit && (
                    <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTeamForm, useTeamFormValidation } from '@/contexts/team-form-context';
import { Building2 } from 'lucide-react';

export function TeamBasicInfo() {
  const { formData, updateField } = useTeamForm();
  const { validateField } = useTeamFormValidation();

  const handleNameChange = (value: string) => {
    updateField('name', value);
    // Validate on change with a slight delay to avoid too frequent validation
    setTimeout(() => validateField('name', value), 300);
  };

  const handleDescriptionChange = (value: string) => {
    updateField('description', value);
    // Validate on change with a slight delay to avoid too frequent validation
    setTimeout(() => validateField('description', value), 300);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Name */}
        <div className="space-y-2">
          <Label htmlFor="team-name" className="text-sm font-medium">
            Team Name *
          </Label>
          <Input
            id="team-name"
            placeholder="Enter team name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full"
            maxLength={50}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Choose a name that represents your team</span>
            <span>{formData.name.length}/50</span>
          </div>
        </div>

        {/* Team Description */}
        <div className="space-y-2">
          <Label htmlFor="team-description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="team-description"
            placeholder="Describe your team, goals, or any additional information"
            value={formData.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="w-full min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Optional: Add details about your team</span>
            <span>{formData.description.length}/500</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

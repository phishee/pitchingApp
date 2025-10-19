'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeamForm } from '@/contexts/team-form-context';
import { Palette, RefreshCw } from 'lucide-react';
import { TEAM_COLOR_PALETTES, createTeamColor, isValidHexColor, getRandomTeamColor } from '@/lib/colorUtils';

// Predefined color options
const COLOR_OPTIONS = TEAM_COLOR_PALETTES.slice(0, 8); // Use first 8 colors from palette

export function TeamColorPicker() {
  const { formData, updateField } = useTeamForm();

  const handleColorSelect = (primaryColor: string) => {
    const teamColor = createTeamColor(primaryColor);
    updateField('color', teamColor);
  };

  const handleCustomColorChange = (value: string) => {
    if (isValidHexColor(value)) {
      const teamColor = createTeamColor(value.toUpperCase());
      updateField('color', teamColor);
    }
  };

  const handleRandomColor = () => {
    const randomColor = getRandomTeamColor();
    updateField('color', randomColor);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Team Color
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Color Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Colors</Label>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: formData.color.primary }}
                title="Primary Color"
              />
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: formData.color.secondary }}
                title="Secondary Color"
              />
            </div>
            <div>
              <p className="text-sm font-mono text-gray-700">
                Primary: {formData.color.primary}
              </p>
              <p className="text-xs text-gray-500">Primary and secondary colors for team branding</p>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Choose a Color</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomColor}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Random
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.primary}
                type="button"
                onClick={() => handleColorSelect(color.primary)}
                className={`
                  w-full h-12 rounded-lg border-2 transition-all duration-200
                  ${formData.color.primary === color.primary 
                    ? 'border-gray-800 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color.primary }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Custom Color Input */}
        <div className="space-y-2">
          <Label htmlFor="custom-color" className="text-sm font-medium">
            Custom Primary Color
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-color"
              type="text"
              placeholder="#3B82F6"
              value={formData.color.primary}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="flex-1 font-mono"
              maxLength={7}
            />
            <div className="flex gap-1">
              <div 
                className="w-12 h-10 rounded border-2 border-gray-200"
                style={{ backgroundColor: formData.color.primary }}
                title="Primary"
              />
              <div 
                className="w-12 h-10 rounded border-2 border-gray-200"
                style={{ backgroundColor: formData.color.secondary }}
                title="Secondary"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Enter a hex color code. Secondary color will be automatically generated.
          </p>
        </div>

        {/* Placeholder Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Color Features Coming Soon</p>
              <p className="text-blue-600 mt-1">
                Team colors will be used throughout the application for branding, 
                including team cards, calendars, and other team-specific elements.
              </p>
            </div>
          </div>
        </div>

        {/* Usage Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Team colors help identify your team across the app</div>
          <div>• Used in team cards, calendars, and notifications</div>
          <div>• Choose colors that represent your team's identity</div>
        </div>
      </CardContent>
    </Card>
  );
}

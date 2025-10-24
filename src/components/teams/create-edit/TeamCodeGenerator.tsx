'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeamForm, useTeamFormValidation } from '@/providers/team-form-context';
import { useTeamCodeGenerator } from '@/hooks/use-team-code-generator';
import { RefreshCw, Copy, Check, Hash } from 'lucide-react';
import { toast } from 'sonner';

export function TeamCodeGenerator() {
  const { formData, updateField, mode } = useTeamForm();
  const { validateField } = useTeamFormValidation();
  const { generateUniqueCode, isGenerating, error, clearError } = useTeamCodeGenerator();
  const [copied, setCopied] = React.useState(false);

  // Generate code on component mount for create mode
  useEffect(() => {
    if (mode === 'create' && !formData.teamCode) {
      generateUniqueCode()
        .then(code => {
          updateField('teamCode', code);
        })
        .catch(err => {
          console.error('Failed to generate initial code:', err);
        });
    }
  }, [mode, formData.teamCode, generateUniqueCode, updateField]);

  const handleGenerateCode = async () => {
    try {
      clearError();
      const code = await generateUniqueCode();
      updateField('teamCode', code);
      toast.success('New team code generated successfully!');
    } catch (err) {
      console.error('Failed to generate code:', err);
      toast.error('Failed to generate team code. Please try again.');
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow uppercase letters and numbers
    const cleanedValue = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    // Limit to 6 characters
    const limitedValue = cleanedValue.slice(0, 6);
    
    updateField('teamCode', limitedValue);
    
    // Validate the code
    setTimeout(() => validateField('teamCode', limitedValue), 300);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(formData.teamCode);
      setCopied(true);
      toast.success('Team code copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast.error('Failed to copy team code');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Team Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-code" className="text-sm font-medium">
            Team Code *
          </Label>
          <div className="flex gap-2">
            <Input
              id="team-code"
              placeholder="ABC123"
              value={formData.teamCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="flex-1 font-mono text-center text-lg tracking-wider"
              maxLength={6}
              disabled={isGenerating}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              disabled={!formData.teamCode || copied}
              className="px-3"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            This code will be used by team members to join your team
          </div>
        </div>

        {/* Generate Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateCode}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Code
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}

        {/* Code Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Team codes are 6 characters long</div>
          <div>• Use letters (A-Z) and numbers (0-9)</div>
          <div>• Each team code must be unique</div>
          {mode === 'edit' && (
            <div className="text-amber-600">
              ⚠️ Changing the team code will affect how members join
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

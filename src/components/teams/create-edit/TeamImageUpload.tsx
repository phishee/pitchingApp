'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeamForm } from '@/contexts/team-form-context';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

export function TeamImageUpload() {
  const { formData, updateField } = useTeamForm();

  const handleImageUpload = () => {
    // Placeholder for future implementation
    console.log('Image upload functionality will be implemented here');
    toast.info('Image upload feature coming soon!');
  };

  const handleRemoveImage = () => {
    updateField('logoUrl', '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Team Logo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.logoUrl ? (
          // Image Preview (when implemented)
          <div className="relative">
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Image preview will appear here</p>
                <p className="text-xs text-gray-400 mt-1">Current URL: {formData.logoUrl}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          // Upload Area
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Team Logo
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Add a logo to help identify your team
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleImageUpload}
              className="mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            <p className="text-xs text-gray-400">
              PNG, JPG up to 2MB
            </p>
          </div>
        )}

        {/* Placeholder Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Image Upload Coming Soon</p>
              <p className="text-blue-600 mt-1">
                This feature is currently under development. You'll be able to upload and manage team logos soon.
              </p>
            </div>
          </div>
        </div>

        {/* Current Implementation Note */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Supported formats: PNG, JPG, GIF</div>
          <div>• Maximum file size: 2MB</div>
          <div>• Recommended size: 200x200px or larger</div>
        </div>
      </CardContent>
    </Card>
  );
}

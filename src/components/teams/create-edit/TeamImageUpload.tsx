'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeamForm } from '@/contexts/team-form-context';
import { Upload, Image as ImageIcon, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export function TeamImageUpload() {
  const { formData, updateField } = useTeamForm();
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageUpload = () => {
    console.log('Image upload functionality will be implemented here');
    toast.info('Image upload feature coming soon!');
  };

  const handleRemoveImage = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    updateField('logoUrl', '');
    setImageUrl('');
    setImageError(false);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (error: any) => {
    console.log('Image failed to load:', error);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setImageLoading(false);
    setImageError(true);
  };

  const handleApplyUrl = () => {
    const trimmedUrl = imageUrl.trim();
    
    if (!trimmedUrl) {
      toast.error('Please enter an image URL');
      return;
    }

    console.log('Applying URL:', trimmedUrl);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset states and apply URL
    setImageError(false);
    setImageLoading(true);
    
    requestAnimationFrame(() => {
      updateField('logoUrl', trimmedUrl);
      toast.success('Logo URL applied!');
      
      // Set timeout as fallback
      timeoutRef.current = setTimeout(() => {
        console.log('Image loading timeout - setting error state');
        setImageLoading(false);
        setImageError(true);
      }, 10000);
    });
  };

  const handlePasteUrl = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setImageUrl(pastedText);
    }
  };

  // Sync local state with form data
  useEffect(() => {
    if (formData.logoUrl && !imageUrl) {
      setImageUrl(formData.logoUrl);
    }
  }, [formData.logoUrl, imageUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Team Logo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input Section */}
        <div className="space-y-3">
          <Label htmlFor="logo-url" className="text-sm font-medium">
            Logo URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="logo-url"
              type="text"
              placeholder="Paste image URL here..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onPaste={handlePasteUrl}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyUrl}
              disabled={!imageUrl.trim()}
              className="px-4"
            >
              <Check className="w-4 h-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        {formData.logoUrl ? (
          // Image Preview
          <div className="relative">
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {/* {imageLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading image...</p>
                </div>
              ) : imageError ? (
                <div className="text-center px-4">
                  <ImageIcon className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-500 font-medium">Failed to load image</p>
                  <p className="text-xs text-gray-400 mt-2 break-all">
                    {formData.logoUrl}
                  </p>
                </div>
              ) : ( */}
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={imageUrl}
                    alt="Team logo preview"
                    fill
                    className="object-contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    unoptimized
                  />
                </div>
              {/* )} */}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white z-10"
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

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Logo Options</p>
              <p className="text-blue-600 mt-1">
                Paste any image URL above. The image must be publicly accessible.
              </p>
            </div>
          </div>
        </div>

        {/* Current Implementation Note */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Paste any publicly accessible image URL</div>
          <div>• Recommended size: 200x200px or larger</div>
          <div>• Square images work best for logos</div>
          <div>• File upload feature coming soon</div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { UnsplashImagePicker } from './UnsplashImagePicker';

interface ImagePickerProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
  unsplashSearchQuery?: string;
  unsplashOrientation?: 'landscape' | 'portrait' | 'squarish';
  unsplashColor?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
  maxImages?: number;
}

export function ImagePicker({
  value,
  onChange,
  multiple = false,
  placeholder = "Select an image",
  className = "",
  unsplashSearchQuery = "fitness workout",
  unsplashOrientation,
  unsplashColor,
  maxImages = 5
}: ImagePickerProps) {
  const [showUnsplashPicker, setShowUnsplashPicker] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    if (multiple) {
      const newImages: string[] = [];
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newImages.push(result);
          if (newImages.length === imageFiles.length) {
            const currentImages = Array.isArray(value) ? value : [];
            const updatedImages = [...currentImages, ...newImages].slice(0, maxImages);
            onChange(updatedImages);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUnsplashSelect = (images: any) => {
    if (multiple) {
      const imageUrls = images.map((img: any) => img.urls.regular);
      const currentImages = Array.isArray(value) ? value : [];
      const updatedImages = [...currentImages, ...imageUrls].slice(0, maxImages);
      onChange(updatedImages);
    } else {
      onChange(images.urls.regular);
    }
    setShowUnsplashPicker(false);
  };

  const handleRemoveImage = (index?: number) => {
    if (multiple && Array.isArray(value)) {
      const newImages = value.filter((_, i) => i !== index);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  const renderImagePreview = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return (
        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{placeholder}</p>
          </div>
        </div>
      );
    }

    if (multiple && Array.isArray(value)) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {value.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Selected ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="relative group">
        <img
          src={value as string}
          alt="Selected"
          className="w-full h-32 object-cover rounded-lg"
        />
        <button
          onClick={() => handleRemoveImage()}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {renderImagePreview()}
      
      <div className="flex gap-2">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            multiple={multiple}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild>
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload {multiple ? 'Images' : 'Image'}
              </span>
            </Button>
          </label>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowUnsplashPicker(true)}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          From Unsplash
        </Button>
      </div>

      {multiple && Array.isArray(value) && value.length > 0 && (
        <p className="text-xs text-gray-500">
          {value.length} of {maxImages} images selected
        </p>
      )}

      {showUnsplashPicker && (
        <UnsplashImagePicker
          onSelect={handleUnsplashSelect}
          onClose={() => setShowUnsplashPicker(false)}
          multiple={multiple}
          searchQuery={unsplashSearchQuery}
          orientation={unsplashOrientation}
          color={unsplashColor}
          selectedImages={[]}
        />
      )}
    </div>
  );
}
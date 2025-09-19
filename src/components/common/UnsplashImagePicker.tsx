'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  X, 
  Check, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink,
  Heart,
  User
} from 'lucide-react';

interface UnsplashImage {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
    profile_image: {
      small: string;
    };
  };
  likes: number;
  width: number;
  height: number;
  color: string;
}

interface UnsplashImagePickerProps {
  onSelect: (images: UnsplashImage | UnsplashImage[]) => void;
  onClose: () => void;
  multiple?: boolean;
  searchQuery?: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
  orderBy?: 'relevant' | 'latest';
  perPage?: number;
  selectedImages?: UnsplashImage[];
}

export function UnsplashImagePicker({
  onSelect,
  onClose,
  multiple = false,
  searchQuery = 'fitness workout',
  orientation,
  color,
  orderBy = 'relevant',
  perPage = 20,
  selectedImages = []
}: UnsplashImagePickerProps) {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>(
    selectedImages.map(img => img.id)
  );

  const searchImages = useCallback(async (query: string, pageNum: number = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query,
        page: pageNum.toString(),
        perPage: perPage.toString(),
        orderBy,
        ...(orientation && { orientation }),
        ...(color && { color })
      });

      const response = await fetch(`/api/v1/unsplash?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      
      if (reset) {
        setImages(data.results);
        setPage(1);
      } else {
        // Ensure unique images by filtering out duplicates based on ID
        setImages(prev => {
          const existingIds = new Set(prev.map(img => img.id));
          const newImages = data.results.filter((img: UnsplashImage) => !existingIds.has(img.id));
          return [...prev, ...newImages];
        });
      }
      
      setHasMore(data.results.length === perPage);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }, [orientation, color, orderBy, perPage]);

  useEffect(() => {
    searchImages(searchQuery, 1, true);
  }, [searchImages, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(searchTerm, 1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      searchImages(searchTerm, page + 1, false);
      setPage(prev => prev + 1);
    }
  };

  const handleImageSelect = (image: UnsplashImage) => {
    if (multiple) {
      const newSelectedIds = selectedImageIds.includes(image.id)
        ? selectedImageIds.filter(id => id !== image.id)
        : [...selectedImageIds, image.id];
      
      setSelectedImageIds(newSelectedIds);
      
      const selectedImages = images.filter(img => newSelectedIds.includes(img.id));
      onSelect(selectedImages);
    } else {
      onSelect(image);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      const selectedImages = images.filter(img => selectedImageIds.includes(img.id));
      onSelect(selectedImages);
    } else {
      const selectedImage = images.find(img => selectedImageIds.includes(img.id));
      if (selectedImage) {
        onSelect(selectedImage);
      }
    }
  };

  const isImageSelected = (imageId: string) => selectedImageIds.includes(imageId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Choose Image{multiple ? 's' : ''} from Unsplash
            </h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Orientation: {orientation || 'any'}</Badge>
            <Badge variant="outline">Color: {color || 'any'}</Badge>
            <Badge variant="outline">Order: {orderBy}</Badge>
          </div>
        </div>

        {/* Image Grid */}
        <CardContent className="flex-1 overflow-y-auto p-6">
          {images.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No images found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={`${image.id}-${index}`} // Use both ID and index for uniqueness
                  className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                    isImageSelected(image.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={image.urls.small}
                      alt={image.alt_description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                      <div className="absolute top-2 right-2">
                        {isImageSelected(image.id) ? (
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Check className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={image.user.profile_image.small}
                          alt={image.user.name}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-xs font-medium">{image.user.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{image.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <a
                            href={`https://unsplash.com/photos/${image.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {multiple ? (
                selectedImageIds.length > 0 ? (
                  `${selectedImageIds.length} image${selectedImageIds.length !== 1 ? 's' : ''} selected`
                ) : (
                  'No images selected'
                )
              ) : (
                selectedImageIds.length > 0 ? 'Image selected' : 'No image selected'
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={selectedImageIds.length === 0}
              >
                {multiple ? 'Select Images' : 'Select Image'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
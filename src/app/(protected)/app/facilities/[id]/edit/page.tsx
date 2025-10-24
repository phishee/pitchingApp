'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { facilityApi } from '@/app/services-client/facilityApi';
import { useOrganization } from '@/providers/organization-context';
import { useUser } from '@/providers/user.context';
import { FacilityFormProvider, useFacilityForm, useFacilityFormValidation } from '@/providers/facility-form-context';
import { Facility } from '@/models';
import { toast } from 'sonner';

// Available amenities options
const AMENITY_OPTIONS = [
  'batting_cages',
  'bullpen',
  'weight_room',
  'locker_rooms',
  'concession_stand',
  'parking',
  'restrooms',
  'bleachers',
  'scoreboard',
  'lighting',
  'turf',
  'grass',
  'indoor',
  'outdoor',
  'air_conditioning',
  'heating',
  'wifi',
  'sound_system',
  'projector',
  'storage'
];

function EditFacilityForm() {
  const router = useRouter();
  const params = useParams();
  const facilityId = params.id as string;
  const { user } = useUser();
  const { currentOrganization } = useOrganization();
  const { formData, updateField, isSubmitting, setSubmitting, errors, clearErrors, initializeForm } = useFacilityForm();
  const { validateForm, hasErrors } = useFacilityFormValidation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacility, setIsLoadingFacility] = useState(true);
  const [facility, setFacility] = useState<Facility | null>(null);

  // Load facility data
  useEffect(() => {
    const loadFacility = async () => {
      if (!facilityId) return;

      try {
        setIsLoadingFacility(true);
        const facilityData = await facilityApi.getFacility(facilityId);
        setFacility(facilityData);
        initializeForm('edit', facilityData);
      } catch (error: any) {
        console.error('Error loading facility:', error);
        toast.error('Failed to load facility');
        router.push('/app/facilities');
      } finally {
        setIsLoadingFacility(false);
      }
    };

    loadFacility();
  }, [facilityId, initializeForm, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!facilityId) {
      toast.error('Facility ID not found');
      return;
    }

    try {
      setIsLoading(true);
      setSubmitting(true);
      clearErrors();

      await facilityApi.updateFacility(facilityId, formData);
      
      toast.success('Facility updated successfully');
      router.push('/app/facilities');
    } catch (error: any) {
      console.error('Error updating facility:', error);
      toast.error(error.message || 'Failed to update facility');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/app/facilities');
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    updateField('amenities', newAmenities);
  };

  if (isLoadingFacility) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Facility</h1>
            <p className="text-muted-foreground">Loading facility data...</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Facility</h1>
            <p className="text-muted-foreground">Facility not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Facility Not Found</h3>
              <p className="text-muted-foreground">
                The facility you're looking for doesn't exist or you don't have permission to edit it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
              <p className="text-muted-foreground">
                Please select an organization to edit facilities
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Facility</h1>
          <p className="text-muted-foreground">Update {facility.name} in {currentOrganization.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter facility name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter facility description"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => updateField('type', value)}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field">Field</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="indoor_facility">Indoor Facility</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => updateField('status', value)}>
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter facility address"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div>
                <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                <Input
                  id="maxOccupancy"
                  type="number"
                  min="0"
                  max="10000"
                  value={formData.maxOccupancy}
                  onChange={(e) => updateField('maxOccupancy', parseInt(e.target.value) || 0)}
                  placeholder="Enter max occupancy"
                  className={errors.maxOccupancy ? 'border-red-500' : ''}
                />
                {errors.maxOccupancy && <p className="text-sm text-red-500 mt-1">{errors.maxOccupancy}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Settings & Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Settings & Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverPhotoUrl">Cover Photo URL</Label>
                <Input
                  id="coverPhotoUrl"
                  value={formData.coverPhotoUrl}
                  onChange={(e) => updateField('coverPhotoUrl', e.target.value)}
                  placeholder="Enter cover photo URL"
                />
              </div>

              <div className="space-y-3">
                <Label>Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBookable"
                      checked={formData.isBookable}
                      onCheckedChange={(checked) => updateField('isBookable', !!checked)}
                    />
                    <Label htmlFor="isBookable">Bookable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresApproval"
                      checked={formData.requiresApproval}
                      onCheckedChange={(checked) => updateField('requiresApproval', !!checked)}
                    />
                    <Label htmlFor="requiresApproval">Requires Approval</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="public"
                      checked={formData.public}
                      onCheckedChange={(checked) => updateField('public', !!checked)}
                    />
                    <Label htmlFor="public">Public Facility</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities?.includes(amenity) || false}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.amenities && <p className="text-sm text-red-500 mt-1">{errors.amenities}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isSubmitting || hasErrors}>
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Facility
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EditFacilityPage() {
  return (
    <FacilityFormProvider>
      <EditFacilityForm />
    </FacilityFormProvider>
  );
}

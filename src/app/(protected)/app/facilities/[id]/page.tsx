'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, MapPin, Building2, Users, Calendar, Loader2 } from 'lucide-react';
import { facilityApi } from '@/app/services-client/facilityApi';
import { useOrganization } from '@/providers/organization-context';
import { useUser } from '@/providers/user.context';
import { Facility } from '@/models';
import { toast } from 'sonner';
import { ConfirmDismissDialog } from '@/components/common/confirm-dismiss-dialog';

// Prevent static generation since this page uses client-side hooks and context
export const dynamic = 'force-dynamic';

function FacilityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const facilityId = params.id as string;
  const { user } = useUser();
  const { currentOrganization } = useOrganization();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load facility data
  useEffect(() => {
    const loadFacility = async () => {
      if (!facilityId) return;

      try {
        setIsLoading(true);
        const facilityData = await facilityApi.getFacility(facilityId);
        setFacility(facilityData);
      } catch (error: any) {
        console.error('Error loading facility:', error);
        toast.error('Failed to load facility');
        router.push('/app/facilities');
      } finally {
        setIsLoading(false);
      }
    };

    loadFacility();
  }, [facilityId, router]);

  const handleEdit = () => {
    router.push(`/app/facilities/${facilityId}/edit`);
  };

  const handleDelete = async () => {
    if (!facilityId) return;

    try {
      setIsDeleting(true);
      await facilityApi.deleteFacility(facilityId);
      toast.success('Facility deleted successfully');
      router.push('/app/facilities');
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      toast.error(error.message || 'Failed to delete facility');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleBack = () => {
    router.push('/app/facilities');
  };

  const getStatusColor = (status: Facility['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Facility['type']) => {
    switch (type) {
      case 'field':
        return <MapPin className="h-5 w-5" />;
      case 'gym':
        return <Building2 className="h-5 w-5" />;
      case 'indoor_facility':
        return <Building2 className="h-5 w-5" />;
      case 'other':
        return <Building2 className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Facility Details</h1>
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
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Facility Details</h1>
            <p className="text-muted-foreground">Facility not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Facility Not Found</h3>
              <p className="text-muted-foreground">
                The facility you're looking for doesn't exist or you don't have permission to view it.
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
                Please select an organization to view facilities
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{facility.name}</h1>
            <p className="text-muted-foreground">Facility in {currentOrganization.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(facility.type)}
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{facility.name}</h3>
                  <p className="text-muted-foreground capitalize">{facility.type.replace('_', ' ')}</p>
                </div>
                <Badge className={getStatusColor(facility.status)}>
                  {facility.status}
                </Badge>
              </div>

              {facility.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{facility.description}</p>
                </div>
              )}

              {facility.address && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h4>
                  <p className="text-muted-foreground">{facility.address}</p>
                </div>
              )}

              {facility.maxOccupancy && facility.maxOccupancy > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Capacity
                  </h4>
                  <p className="text-muted-foreground">Maximum {facility.maxOccupancy} people</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amenities */}
          {facility.amenities && facility.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {facility.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cover Photo */}
          {facility.coverPhotoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={facility.coverPhotoUrl}
                  alt={facility.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bookable</span>
                <Badge variant={facility.isBookable ? "primary" : "secondary"}>
                  {facility.isBookable ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Requires Approval</span>
                <Badge variant={facility.requiresApproval ? "primary" : "secondary"}>
                  {facility.requiresApproval ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Public Facility</span>
                <Badge variant={facility.public ? "primary" : "secondary"}>
                  {facility.public ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Created</span>
                <p className="text-sm text-muted-foreground">
                  {new Date(facility.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Last Updated</span>
                <p className="text-sm text-muted-foreground">
                  {new Date(facility.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Created By</span>
                {/* <p className="text-sm text-muted-foreground">
                  {facility.createdBy.firstName} {facility.createdBy.lastName}
                </p> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {/* <ConfirmDismissDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        // description={`Are you sure you want to delete "${facility.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      /> */}
      <ConfirmDismissDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default FacilityDetailPage;

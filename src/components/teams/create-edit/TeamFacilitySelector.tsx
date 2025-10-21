'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamForm } from '@/contexts/team-form-context';
import { useOrganization } from '@/providers/organization-context';
import { MapPin, Building2, Loader2 } from 'lucide-react';
import { Facility } from '@/models';

export function TeamFacilitySelector() {
  const { formData, updateField } = useTeamForm();
  const { organizationFacilities, isLoading } = useOrganization();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Find the selected facility when formData.facilityId changes
  useEffect(() => {
    if (formData.facilityId && organizationFacilities.length > 0) {
      const facility = organizationFacilities.find(f => f._id === formData.facilityId);
      setSelectedFacility(facility || null);
    } else {
      setSelectedFacility(null);
    }
  }, [formData.facilityId, organizationFacilities]);

  const handleFacilityChange = (facilityId: string) => {
    // Convert "none" back to empty string for storage
    const value = facilityId === 'none' ? '' : facilityId;
    updateField('facilityId', value);
  };

  const getFacilityTypeIcon = (type: Facility['type']) => {
    switch (type) {
      case 'field':
        return <MapPin className="h-4 w-4" />;
      case 'gym':
        return <Building2 className="h-4 w-4" />;
      case 'indoor_facility':
        return <Building2 className="h-4 w-4" />;
      case 'other':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Facility['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-500';
      case 'maintenance':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Home Facility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading facilities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Home Facility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="facility-select" className="text-sm font-medium">
            Select Facility (Optional)
          </Label>
          <Select
            value={formData.facilityId || 'none'}
            onValueChange={handleFacilityChange}
          >
            <SelectTrigger id="facility-select" className="w-full">
              <SelectValue placeholder="Choose a facility for this team">
                {selectedFacility && (
                  <div className="flex items-center gap-2">
                    {getFacilityTypeIcon(selectedFacility.type)}
                    <span>{selectedFacility.name}</span>
                    <span className={`text-xs ${getStatusColor(selectedFacility.status)}`}>
                      ({selectedFacility.status})
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">No facility assigned</span>
                </div>
              </SelectItem>
              {organizationFacilities
                .filter(facility => facility.status === 'active')
                .map((facility) => (
                  <SelectItem key={facility._id} value={facility._id}>
                    <div className="flex items-center gap-2">
                      {getFacilityTypeIcon(facility.type)}
                      <span>{facility.name}</span>
                      <span className={`text-xs ${getStatusColor(facility.status)}`}>
                        ({facility.status})
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {selectedFacility && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900">
                  {selectedFacility.name}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedFacility.type.replace('_', ' ').toUpperCase()}
                </p>
                {selectedFacility.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedFacility.description}
                  </p>
                )}
                {selectedFacility.address && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedFacility.address}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs font-medium ${getStatusColor(selectedFacility.status)}`}>
                  {selectedFacility.status.toUpperCase()}
                </span>
                {selectedFacility.isBookable && (
                  <span className="text-xs text-blue-600">Bookable</span>
                )}
              </div>
            </div>
          </div>
        )}

        {organizationFacilities.length === 0 && (
          <div className="text-center py-4">
            <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No facilities available</p>
            <p className="text-xs text-gray-400 mt-1">
              Create facilities in your organization to assign them to teams
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

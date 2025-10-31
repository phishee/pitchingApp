'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, MapPin, Building2, Loader2, Filter, Grid, List } from 'lucide-react';
import { Facility } from '@/models';
import { useUser } from '@/providers/user.context';
import { useOrganization } from '@/providers/organization-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

function FacilitiesPage() {
  const router = useRouter();
  const { user } = useUser();
  const { currentOrganization, organizationFacilities, isLoading: contextLoading } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'field' | 'gym' | 'indoor_facility' | 'other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Use facilities from organization context
  const facilities = organizationFacilities;
  const isLoading = contextLoading;

  // Filter facilities based on search and filters
  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
      const matchesSearch = !searchQuery || 
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (facility.description && facility.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (facility.address && facility.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'all' || facility.type === filterType;
      const matchesStatus = filterStatus === 'all' || facility.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [facilities, searchQuery, filterType, filterStatus]);

  // Show loading or no organization state
  if (!currentOrganization) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Facilities</h1>
            <p className="text-muted-foreground">Manage your organization's facilities</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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

  const handleCreateFacility = () => {
    router.push('/app/facilities/create');
  };

  const handleEditFacility = (facilityId: string) => {
    router.push(`/app/facilities/${facilityId}/edit`);
  };

  const handleViewFacility = (facilityId: string) => {
    router.push(`/app/facilities/${facilityId}`);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Facilities</h1>
            <p className="text-muted-foreground">Manage your organization's facilities</p>
          </div>
          <Button className='rounded-full' onClick={handleCreateFacility} disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Facility
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Facilities</h1>
          <p className="text-muted-foreground">Manage facilities in {currentOrganization.name}</p>
        </div>
        <div className="flex gap-2">
          <Button className='rounded-full' onClick={handleCreateFacility}>
            <Plus className="h-4 w-4 mr-2" />
            Create Facility
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="field">Field</SelectItem>
                <SelectItem value="gym">Gym</SelectItem>
                <SelectItem value="indoor_facility">Indoor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          </div>
        </div>

        {/* Facilities Grid/List */}
        {filteredFacilities.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {facilities.length === 0 ? 'No Facilities Yet' : 'No Facilities Match Your Filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {facilities.length === 0 
                    ? 'Get started by creating your first facility'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {facilities.length === 0 && (
                  <Button onClick={handleCreateFacility}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Facility
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredFacilities.map((facility) => (
              <Card key={facility._id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(facility.type)}
                      <h3 className="font-semibold text-lg">{facility.name}</h3>
                    </div>
                    <Badge className={getStatusColor(facility.status)}>
                      {facility.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {facility.description || 'No description provided'}
                    </p>
                    {facility.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {facility.address}
                      </p>
                    )}
                    {facility.maxOccupancy && facility.maxOccupancy > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Max Occupancy: {facility.maxOccupancy}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {facility.amenities?.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {facility.amenities && facility.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{facility.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {facility.isBookable && (
                        <Badge variant="outline" className="text-xs">
                          Bookable
                        </Badge>
                      )}
                      {facility.public && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewFacility(facility._id);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFacility(facility._id);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FacilitiesPage;

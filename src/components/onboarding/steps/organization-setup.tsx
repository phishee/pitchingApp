// /components/onboarding/steps/organization-setup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { Organization } from '@/models';

interface OrganizationSetupProps {
  organizationData: Partial<Organization> | null;
  setOrganizationData: (data: Partial<Organization> & { createdAt: Date; updatedAt: Date }) => void;
}

export function OrganizationSetup({ organizationData, setOrganizationData }: OrganizationSetupProps) {
  const [org, setOrg] = useState({
    name: organizationData?.name || '',
    description: organizationData?.description || '',
    type: organizationData?.type || 'school' as 'school' | 'club' | 'academy' | 'other',
    logoUrl: organizationData?.logoUrl || '',
  });

  useEffect(() => {
    setOrganizationData({
      ...org,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }, [org, setOrganizationData]);

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Create Your Organization</h2>
          <p className="text-gray-600">Set up your organization to manage teams</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              placeholder="Enter organization name"
              value={org.name}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgType">Organization Type</Label>
            <Select 
              value={org.type} 
              onValueChange={(value: string) => setOrg({ ...org, type: value as 'school' | 'club' | 'academy' | 'other' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="academy">Academy</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgDesc">Description</Label>
            <Textarea
              id="orgDesc"
              placeholder="Brief description of your organization"
              value={org.description}
              onChange={(e) => setOrg({ ...org, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgLogo">Organization Logo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Logo upload coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
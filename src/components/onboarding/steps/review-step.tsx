// /components/onboarding/steps/review-step.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, User as UserIcon, Shield, Check } from 'lucide-react';
import { User, Organization, Team, TeamJoinRequest } from '@/models';

interface ReviewStepProps {
  userData: Partial<User> | null;
  organizationData: Partial<Organization> | null;
  teamData: Partial<Team> | null;
  joinRequestData: Partial<TeamJoinRequest> | null;
}

export function ReviewStep({ userData, organizationData, teamData, joinRequestData }: ReviewStepProps) {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Review Your Information</h2>
          <p className="text-gray-600">Please review your details before finishing</p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto overflow-y-auto max-h-96">
          {/* User Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{userData?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{userData?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium capitalize">
                    {userData?.isAdmin ? 'Administrator' : userData?.role}
                  </p>
                </div>
                {userData?.position && (
                  <div>
                    <p className="text-gray-500">Position</p>
                    <p className="font-medium">{userData.position}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organization Information */}
          {organizationData && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Organization
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{organizationData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium capitalize">{organizationData.type}</p>
                  </div>
                </div>
                {organizationData.description && (
                  <div className="mt-3">
                    <p className="text-gray-500 text-sm">Description</p>
                    <p className="font-medium text-sm">{organizationData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Team Information */}
          {teamData && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{teamData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Team Code</p>
                    <p className="font-medium">{teamData.teamCode}</p>
                  </div>
                </div>
                {teamData.description && (
                  <div className="mt-3">
                    <p className="text-gray-500 text-sm">Description</p>
                    <p className="font-medium text-sm">{teamData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Join Request Information */}
          {joinRequestData && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Team Join Request
                </h3>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <p className="text-sm">Join request will be sent upon completion</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong> After clicking Finish, your account will be created and 
              {userData?.role === 'athlete' ? ' your join request will be sent to the team.' : 
               userData?.isAdmin ? ' you can start managing your organization.' : 
               ' you can start managing your team.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// /components/onboarding/steps/role-selection.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, User, Shield } from 'lucide-react';

interface RoleSelectionProps {
  userData: any;
  setUserData: any;
  onNext: () => void;
}

export function RoleSelection({ userData, setUserData, onNext }: RoleSelectionProps) {
  const handleRoleSelect = (role: string) => {
    setUserData({ ...userData, role, isAdmin: false });
    onNext();
  };

  const handleAdminSelect = () => {
    setUserData({ ...userData, role: 'coach', isAdmin: true });
    onNext();
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Welcome! What's your role?</h2>
          <p className="text-gray-600">This helps us customize your experience</p>
        </div>

        <div className="grid gap-4 max-w-lg mx-auto">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${
              userData?.role === 'athlete' && !userData?.isAdmin
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleRoleSelect('athlete')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Athlete</h3>
                  <p className="text-gray-600">Join teams and track your training progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${
              userData?.role === 'coach' && !userData?.isAdmin
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleRoleSelect('coach')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Coach</h3>
                  <p className="text-gray-600">Manage teams and guide athlete development</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${
              userData?.isAdmin
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => console.log("admin")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Administrator</h3>
                  <p className="text-gray-600">Manage organizations and oversee operations</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
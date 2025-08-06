// /components/onboarding/steps/athlete-profile.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AthleteProfileProps {
  userData: any;
  setUserData: any;
}

export function AthleteProfile({ userData, setUserData }: AthleteProfileProps) {
  const [profile, setProfile] = useState({
    position: userData?.position || '',
    dateOfBirth: userData?.dateOfBirth || '',
    height: userData?.height || '',
    weight: userData?.weight || '',
    throwingHand: userData?.throwingHand || '',
    battingStance: userData?.battingStance || '',
    jerseyNumber: userData?.jerseyNumber || '',
    experienceLevel: userData?.experienceLevel || '',
  });

  // Remove the useEffect that was causing the infinite loop
  // Instead, update userData when the form is submitted or when moving to next step

  const handleProfileChange = (field: string, value: string) => {
    const newProfile = { ...profile, [field]: value };
    setProfile(newProfile);
    // Update userData immediately
    setUserData({ ...userData, ...newProfile });
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Complete Your Athlete Profile</h2>
          <p className="text-gray-600">This helps coaches understand your abilities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="space-y-2">
            <Label htmlFor="position">Primary Position</Label>
            <Select value={profile.position} onValueChange={(value) => handleProfileChange('position', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pitcher">Pitcher</SelectItem>
                <SelectItem value="catcher">Catcher</SelectItem>
                <SelectItem value="first-base">First Base</SelectItem>
                <SelectItem value="second-base">Second Base</SelectItem>
                <SelectItem value="third-base">Third Base</SelectItem>
                <SelectItem value="shortstop">Shortstop</SelectItem>
                <SelectItem value="left-field">Left Field</SelectItem>
                <SelectItem value="center-field">Center Field</SelectItem>
                <SelectItem value="right-field">Right Field</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="180"
              value={profile.height}
              onChange={(e) => handleProfileChange('height', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="75"
              value={profile.weight}
              onChange={(e) => handleProfileChange('weight', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="throwing">Throwing Hand</Label>
            <Select value={profile.throwingHand} onValueChange={(value) => handleProfileChange('throwingHand', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="left">Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batting">Batting Stance</Label>
            <Select value={profile.battingStance} onValueChange={(value) => handleProfileChange('battingStance', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jersey">Jersey Number</Label>
            <Input
              id="jersey"
              type="number"
              placeholder="00"
              value={profile.jerseyNumber}
              onChange={(e) => handleProfileChange('jerseyNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience Level</Label>
            <Select value={profile.experienceLevel} onValueChange={(value) => handleProfileChange('experienceLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                <SelectItem value="advanced">Advanced (6+ years)</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
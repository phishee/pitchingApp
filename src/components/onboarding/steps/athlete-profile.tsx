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
    heightFeet: userData?.heightFeet || '',
    heightInches: userData?.heightInches || '',
    weight: userData?.weight || '',
    throwHand: userData?.throwHand || '',
    battingStance: userData?.battingStance || '',
    phoneNumber: userData?.phoneNumber || '',
  });

  const [errors, setErrors] = useState({
    position: false,
    dateOfBirth: false,
    throwHand: false,
    phoneNumber: false,
  });

  const handleProfileChange = (field: string, value: string) => {
    const newProfile = { ...profile, [field]: value };
    setProfile(newProfile);
    
    // Clear error when field is filled
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
    
    // Update userData immediately
    setUserData({ ...userData, ...newProfile });
  };

  const validateRequiredFields = () => {
    const newErrors = {
      position: !profile.position,
      dateOfBirth: !profile.dateOfBirth,
      throwHand: !profile.throwHand,
      phoneNumber: !profile.phoneNumber,
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Validate on mount and when required fields change
  useEffect(() => {
    validateRequiredFields();
  }, [profile.position, profile.dateOfBirth, profile.throwHand, profile.phoneNumber]);

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Complete Your Athlete Profile</h2>
          <p className="text-gray-600">This helps coaches understand your abilities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="space-y-2">
            <Label htmlFor="position" className="flex items-center gap-1">
              Primary Position
              <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={profile.position} 
              onValueChange={(value) => handleProfileChange('position', value)}
            >
              <SelectTrigger className={errors.position ? "border-red-500 focus:border-red-500" : ""}>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pitcher">Pitcher</SelectItem>
                <SelectItem disabled value="catcher">Catcher</SelectItem>
                <SelectItem disabled value="first-base">First Base</SelectItem>
                <SelectItem disabled value="second-base">Second Base</SelectItem>
                <SelectItem disabled value="third-base">Third Base</SelectItem>
                <SelectItem disabled value="shortstop">Shortstop</SelectItem>
                <SelectItem disabled value="left-field">Left Field</SelectItem>
                <SelectItem disabled value="center-field">Center Field</SelectItem>
                <SelectItem disabled value="right-field">Right Field</SelectItem>
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-red-500">Position is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-1">
              Date of Birth
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dob"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
              className={errors.dateOfBirth ? "border-red-500 focus:border-red-500" : ""}
              required
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500">Date of birth is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              Phone Number
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={profile.phoneNumber}
              onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
              className={errors.phoneNumber ? "border-red-500 focus:border-red-500" : ""}
              required
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">Phone number is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="heightFeet"
                  type="number"
                  placeholder="5"
                  min="3"
                  max="8"
                  value={profile.heightFeet}
                  onChange={(e) => handleProfileChange('heightFeet', e.target.value)}
                />
                <Label htmlFor="heightFeet" className="text-xs text-gray-500">ft</Label>
              </div>
              <div className="flex-1">
                <Input
                  id="heightInches"
                  type="number"
                  placeholder="10"
                  min="0"
                  max="11"
                  value={profile.heightInches}
                  onChange={(e) => handleProfileChange('heightInches', e.target.value)}
                />
                <Label htmlFor="heightInches" className="text-xs text-gray-500">in</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="180"
              min="50"
              max="400"
              value={profile.weight}
              onChange={(e) => handleProfileChange('weight', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="throwing" className="flex items-center gap-1">
              Throwing Hand
              <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={profile.throwHand} 
              onValueChange={(value) => handleProfileChange('throwHand', value)}
            >
              <SelectTrigger className={errors.throwHand ? "border-red-500 focus:border-red-500" : ""}>
                <SelectValue placeholder="Select hand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="left">Left</SelectItem>
              </SelectContent>
            </Select>
            {errors.throwHand && (
              <p className="text-sm text-red-500">Throwing hand is required</p>
            )}
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
        </div>
      </div>
    </div>
  );
}
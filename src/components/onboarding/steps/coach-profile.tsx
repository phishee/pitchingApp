// /components/onboarding/steps/coach-profile.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CoachProfileProps {
  userData: any;
  setUserData: any;
}

export function CoachProfile({ userData, setUserData }: CoachProfileProps) {
  const [profile, setProfile] = useState({
    coachingExperience: userData?.coachingExperience || '',
    phoneNumber: userData?.phoneNumber || '',
    philosophy: userData?.philosophy || '',
  });

  const [errors, setErrors] = useState({
    coachingExperience: false,
    phoneNumber: false,
  });

  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    message: '',
  });

  // Phone number validation regex
  const validatePhoneNumber = (phone: string): { isValid: boolean; message: string } => {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits (US phone number)
    if (cleanPhone.length !== 10) {
      return { isValid: false, message: 'Phone number must be 10 digits' };
    }

    // Check if it starts with a valid area code (not 0 or 1)
    if (cleanPhone.startsWith('0') || cleanPhone.startsWith('1')) {
      return { isValid: false, message: 'Invalid area code' };
    }

    return { isValid: true, message: '' };
  };

  const handleProfileChange = (field: string, value: string) => {
    const newProfile = { ...profile, [field]: value };
    setProfile(newProfile);
    
    // Special handling for phone number validation
    if (field === 'phoneNumber') {
      const phoneValidation = validatePhoneNumber(value);
      setPhoneValidation(phoneValidation);
      
      // Clear phone error if valid
      if (phoneValidation.isValid) {
        setErrors(prev => ({ ...prev, phoneNumber: false }));
      }
    } else {
      // Clear error when other required fields are filled
      if (errors[field as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [field]: false }));
      }
    }
    
    setUserData({ ...userData, ...newProfile });
  };

  const validateRequiredFields = () => {
    const newErrors = {
      coachingExperience: !profile.coachingExperience,
      phoneNumber: !profile.phoneNumber || !phoneValidation.isValid,
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Validate on mount and when required fields change
  useEffect(() => {
    validateRequiredFields();
  }, [profile.coachingExperience, profile.phoneNumber, phoneValidation.isValid]);

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Coach Profile</h2>
          <p className="text-gray-600">Tell us about your coaching background</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="space-y-2">
            <Label htmlFor="experience" className="flex items-center gap-1">
              Years of Coaching Experience
              <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={profile.coachingExperience} 
              onValueChange={(value) => handleProfileChange('coachingExperience', value)}
            >
              <SelectTrigger className={errors.coachingExperience ? "border-red-500 focus:border-red-500" : ""}>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
            {errors.coachingExperience && (
              <p className="text-sm text-red-500">Coaching experience is required</p>
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
              className={cn(
                errors.phoneNumber || (!phoneValidation.isValid && profile.phoneNumber) 
                  ? "border-red-500 focus:border-red-500" 
                  : ""
              )}
              required
            />
            {(errors.phoneNumber || (!phoneValidation.isValid && profile.phoneNumber)) && (
              <p className="text-sm text-red-500">
                {phoneValidation.message || 'Phone number is required'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="philosophy">Coaching Philosophy (Optional)</Label>
            <Textarea
              id="philosophy"
              placeholder="Share your approach to coaching and player development"
              value={profile.philosophy}
              onChange={(e) => handleProfileChange('philosophy', e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
    );
}
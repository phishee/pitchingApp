// /components/onboarding/steps/coach-profile.tsx
'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CoachProfileProps {
  userData: any;
  setUserData: any;
}

export function CoachProfile({ userData, setUserData }: CoachProfileProps) {
  const [profile, setProfile] = useState({
    experience: userData?.coachingExperience || '',
    certifications: userData?.certifications || '',
    philosophy: userData?.philosophy || '',
  });

  // Remove the useEffect that was causing the infinite loop
  // Instead, update userData when form fields change

  const handleProfileChange = (field: string, value: string) => {
    const newProfile = { ...profile, [field]: value };
    setProfile(newProfile);
    setUserData({ ...userData, ...newProfile });
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Coach Profile</h2>
          <p className="text-gray-600">Tell us about your coaching background</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Coaching Experience</Label>
            <Select 
              value={profile.experience} 
              onValueChange={(value) => handleProfileChange('experience', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (Optional)</Label>
            <Textarea
              id="certifications"
              placeholder="List any coaching certifications or credentials"
              value={profile.certifications}
              onChange={(e) => handleProfileChange('certifications', e.target.value)}
              rows={3}
            />
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
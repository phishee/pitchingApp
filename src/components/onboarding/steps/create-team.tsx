// /components/onboarding/steps/create-team.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Building, Trophy, CheckCircle } from 'lucide-react';
import { useOnboarding } from '@/providers/onboarding-context';
import { teamApi } from '@/app/services-client/teamApi';

interface CreateTeamProps {
  onNext?: () => void;
}

export function CreateTeam({ onNext }: CreateTeamProps) {
  const { teamData, setTeamData, userData, setUserData, setOrganizationData, setTeamMemberData } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isStepComplete, setIsStepComplete] = useState(false);

  const generateTeamCode = async (): Promise<string> => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let isUnique = false;
    
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if code already exists
      try {
        const existingTeam = await teamApi.getTeamByCode(code);
        isUnique = !existingTeam;
      } catch (error) {
        isUnique = true; // If error, assume code is unique
      }
    } while (!isUnique);
    
    return code;
  };

  // Generate team code on component mount
  useEffect(() => {
    const generateCode = async () => {
      // If teamData already has a teamCode, use it instead of generating a new one
      if (teamData?.teamCode) {
        setGeneratedCode(teamData.teamCode);
        return;
      }

      try {
        const code = await generateTeamCode();
        setGeneratedCode(code);
      } catch (error) {
        console.error('Error generating team code:', error);
      }
    };

    generateCode();
  }, [teamData?.teamCode]); // Add teamData.teamCode as dependency

  const handleNameChange = (value: string) => {
    if (teamData) {
      setTeamData({
        ...teamData,
        name: value
      });
    } else {
      setTeamData({
        name: value,
        description: '',
        logoUrl: '',
        teamCode: generatedCode,
        organizationId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  };

  const handleDescriptionChange = (value: string) => {
    if (teamData) {
      setTeamData({
        ...teamData,
        description: value
      });
    }
  };

  const handleCreateTeam = async () => {
    if (!teamData?.name || !userData) return;

    try {
      setIsLoading(true);
      setError('');

      // 1. Set organization data (auto-generated from team data)
      const organizationData = {
        name: teamData.name,
        description: teamData.description || `${teamData.name} Organization`,
        type: 'club' as const,
        createdBy: userData.userId,
        logoUrl: teamData.logoUrl || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Setting organization data:', organizationData);
      setOrganizationData(organizationData);

      // 2. Update team data with organization reference and generated code
      const updatedTeamData = {
        ...teamData,
        teamCode: generatedCode,
        organizationId: '', // Will be set when organization is created in handleFinish
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Setting team data:', updatedTeamData);
      setTeamData(updatedTeamData);

      // 3. Update user to be admin
      const updatedUserData = {
        ...userData,
        isAdmin: true,
        currentOrganizationId: '' // Will be set when organization is created in handleFinish
      };

      console.log('Updating user data:', updatedUserData);
      setUserData(updatedUserData);

      // 4. Set team member data - IMPORTANT: This is where the team member is created
      const teamMemberData = {
        teamId: '', // Will be set when team is created in handleFinish
        userId: userData.userId,
        role: 'coach' as const,
        status: 'active' as const,
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Setting team member data:', teamMemberData);
      setTeamMemberData(teamMemberData);

      console.log('Team data setup completed successfully');
      console.log('teamMemberData in context after setting:', teamMemberData);

      // Mark step as complete
      setIsStepComplete(true);

    } catch (error) {
      console.error('Error setting up team data:', error);
      setError('Failed to set up team data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-advance to next step when team is created successfully
  useEffect(() => {
    if (isStepComplete && onNext) {
      // Small delay to show success state
      const timer = setTimeout(() => {
        onNext();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isStepComplete, onNext]);

  return (
    <div className="space-y-6 ">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Create Your Team</h2>
        <p className="text-gray-600">Set up your team</p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5" />
              Team Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="Enter team name"
                value={teamData?.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This will create your team
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your team"
                value={teamData?.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={2}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Team Code Display */}
        {generatedCode && (
          <Card className="bg-blue-50 border-2 border-dashed border-blue-200">
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                  <Trophy className="w-4 h-4" />
                  <span>Your team code will be:</span>
                </div>
                <div className="bg-white border border-blue-300 rounded-lg px-4 py-2 inline-block">
                  <span className="text-xl font-mono font-bold text-blue-800 tracking-wider">
                    {generatedCode}
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  Share this code with athletes to join your team
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleCreateTeam}
            disabled={isLoading || !teamData?.name || isStepComplete}
            className="px-6 py-2"
            size="md"
          >
            {isLoading ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                Setting Up...
              </>
            ) : isStepComplete ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Team Created Successfully!
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Set Up Team
              </>
            )}
          </Button>
        </div>

        {isStepComplete && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Team created successfully! Moving to next step...</span>
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>You'll become the team coach</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This will automatically create your team and make you the coach
          </p>
        </div>
      </div>
    </div>
  );
}
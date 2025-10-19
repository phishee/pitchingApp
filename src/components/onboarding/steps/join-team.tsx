// /components/onboarding/steps/join-team.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { teamApi } from '@/app/services-client/teamApi';
import { useOnboarding } from '@/providers/onboarding-context';
import { createTeamColor } from '@/lib/colorUtils';
import Image from 'next/image';

interface JoinTeamProps {
  onNext: () => void; // Make sure this is required, not optional
}

interface TeamInfo {
  _id: string;
  name: string;
  description: string;
  logoUrl?: string;
  color?: {
    primary: string;
    secondary: string;
  };
}

export function JoinTeam({ onNext }: JoinTeamProps) {
  console.log('🔍 JoinTeam props:', { onNext }); // Add this debug log
  const [teamCode, setTeamCode] = useState('');
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRequested, setHasRequested] = useState(false);

  const { joinRequestData, setJoinRequestData, userData, teamToJoin, setTeamToJoin } = useOnboarding();

  // Helper function to check if image URL is valid
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    return url != null && url.trim() !== '';
  };

  // Helper function to get team colors with fallback
  const getTeamColors = () => {
    if (teamInfo?.color) {
      return {
        primary: teamInfo.color.primary,
        secondary: teamInfo.color.secondary
      };
    }
    
    // Generate consistent color based on team name (same as TeamCard)
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
      '#EF4444', '#6366F1', '#EC4899', '#14B8A6'
    ];
    const index = teamInfo?.name.charCodeAt(0) % colors.length;
    const primaryColor = colors[index] || '#3B82F6';
    return createTeamColor(primaryColor);
  };

  useEffect(() => {
    if (joinRequestData && !teamInfo && teamToJoin && teamToJoin._id) {
      setTeamInfo({
        _id: teamToJoin._id || '',
        name: teamToJoin.name || '',
        description: teamToJoin.description || '',
        logoUrl: teamToJoin.logoUrl || '',
        color: teamToJoin.color
      });
    }
  }, [joinRequestData, teamInfo, teamToJoin]);

  const handleFetchTeam = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await teamApi.getTeamByCode(teamCode);
      if (response) {
        setTeamInfo(response);
        setTeamToJoin(response);
        setHasRequested(true);
      } else {
        setError('Team not found. Please check the code.');
      }
    } catch (error) {
      setError('Error fetching team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = () => {
    if (teamInfo && userData) {
      const joinRequest = {
        teamId: teamInfo._id || '',
        requestedBy: userData.userId,
        requestedAt: new Date(),
        status: 'pending' as const,
        comment: null,
        role: userData.role || 'athlete',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setJoinRequestData(joinRequest);
      setHasRequested(true);
      onNext();
    }
  };

  const handleCancelRequest = () => {
    setJoinRequestData(null);
    setHasRequested(false);
    setTeamToJoin(null);
    setTeamInfo(null);
  };

  const handleSkip = () => {
    console.log('🔄 Skip button clicked'); // Add this debug log
    
    // Clear any existing data
    setJoinRequestData(null);
    setHasRequested(false);
    setTeamToJoin(null);
    setTeamInfo(null);
    setTeamCode('');
    
    console.log('📞 Calling onNext...'); // Add this debug log
    if (onNext) {
      onNext();
    } else {
      console.error('❌ onNext function is not defined');
    }
    console.log('✅ onNext called'); // Add this debug log
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Join a Team</h2>
          <p className="text-gray-600">Enter the team code provided by your coach, or skip for now</p>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          {/* Team code input */}
          <div className="space-y-2">
            <Label htmlFor="code">Team Code</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="Enter 6-character code"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                // disabled={hasRequested}
              />
              <Button
                onClick={handleFetchTeam}
                // disabled={isLoading || hasRequested}
              >
                {isLoading ? 'Checking...' : 'Verify'}
              </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* Skip button - always visible */}
          <div className="text-center pt-2">
            <Button 
              onClick={handleSkip} 
              variant="outline" 
              className="w-full bg-gray-500 text-white hover:bg-gray-600"
            >
              Skip for Now - I'll join a team later
            </Button>
          </div>

          {/* Team info display (only shows after verification) */}
          {teamInfo && (
            <Card 
              className={hasRequested ? "" : "border-primary"}
              style={hasRequested ? {
                borderColor: getTeamColors().primary,
                backgroundColor: getTeamColors().secondary
              } : {}}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  {isValidImageUrl(teamInfo?.logoUrl) && (
                    <Image src={teamInfo.logoUrl} alt={teamInfo?.name} width={40} height={40} className="rounded-full" />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{teamInfo?.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{teamInfo?.description}</p>

                {!joinRequestData ? (
                  <div className="flex gap-3 pt-4">
                    {teamInfo && (
                      <Button onClick={handleJoinRequest} className="flex-1">
                        Request to Join
                      </Button>
                    )}
                    
                    {/* The original handleSkip button is now moved outside the conditional block */}
                    {/* <Button 
                      onClick={handleSkip} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Skip for Now
                    </Button> */}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Success message */}
                    <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-200 rounded-lg">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        A request will be sent when finishing setup
                      </p>
                    </div>

                    {/* Cancel button */}
                    <Button
                      onClick={handleCancelRequest}
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
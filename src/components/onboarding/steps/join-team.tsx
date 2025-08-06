// /components/onboarding/steps/join-team.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { teamApi } from '@/app/services-client/teamApi';
import { Team } from '@/models';
import { useOnboarding } from '@/providers/onboarding-context';

// interface JoinTeamProps {
//   setJoinRequestData: any;
//   userData: any;
//   joinRequestData: any;
// }

interface TeamInfo {
  _id: string;
  name: string;
  description: string;
}

export function JoinTeam() {
  const [teamCode, setTeamCode] = useState('');
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRequested, setHasRequested] = useState(false);

  const { joinRequestData, setJoinRequestData, userData, teamToJoin, setTeamToJoin } = useOnboarding();

  useEffect(() => {
    if (joinRequestData && !teamInfo && teamToJoin && teamToJoin._id) {
      setTeamInfo({
        _id: teamToJoin._id || '',
        name: teamToJoin.name || '',
        description: teamToJoin.description || ''
      });
    }
  }, []);



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
      setJoinRequestData({
        teamId: teamInfo._id || '',
        requestedBy: userData.userId,
        requestedAt: new Date(),
        status: 'pending',
        message: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setHasRequested(true);
    }
  };

  const handleCancelRequest = () => {
    setJoinRequestData(null);
    setHasRequested(false);
    setTeamToJoin(null);
    setTeamInfo(null);
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Join a Team</h2>
          <p className="text-gray-600">Enter the team code provided by your coach</p>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          <div className="space-y-2">
            <Label htmlFor="code">Team Code</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="Enter 6-character code"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={hasRequested}
              />
              <Button
                onClick={handleFetchTeam}
              // disabled={teamCode.length !== 6 || isLoading || hasRequested}
              >
                {isLoading ? 'Checking...' : 'Verify'}
              </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {teamInfo && (
            <Card className={hasRequested ? "border-green-500 bg-green-50" : "border-primary"}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">{teamInfo?.name}</h3>
                <p className="text-gray-600 mb-4">{teamInfo?.description}</p>

                {!joinRequestData ? (
                  <Button onClick={handleJoinRequest} className="w-full">
                    Request to Join
                  </Button>
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
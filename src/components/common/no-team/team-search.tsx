// /components/athlete/team-search.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Clock, Users, Trophy } from 'lucide-react';
import { teamApi } from '@/app/services-client/teamApi';
import { useUser } from '@/providers/user.context';
import { useTeam } from '@/providers/team-context';
import { Team } from '@/models';
import Image from 'next/image';

export default function TeamSearchRequest() {
  const { user } = useUser();
  const { pendingJoinRequest, setPendingJoinRequest } = useTeam();
  const [teamCode, setTeamCode] = useState('');
  const [teamInfo, setTeamInfo] = useState<Partial<Team> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchTeam = async () => {
    if (!teamCode.trim()) {
      setError('Please enter a team code');
      return;
    }

    setIsLoading(true);
    setError('');
    setTeamInfo(null);

    try {
      const team = await teamApi.getTeamByCode(teamCode.toUpperCase());
      if (team) {
        setTeamInfo(team);
      } else {
        setError('Team not found. Please check the code.');
      }
    } catch (err) {
      setError('Team not found. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFetchTeam();
    }
  };

  const handleJoinTeam = async () => {
    if (!teamInfo || !user) return;

    setIsLoading(true);
    setError('');

    try {
      const joinRequest = await teamApi.createJoinRequest({
        teamId: teamInfo._id,
        requestedBy: user.userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const teamRequest = await teamApi.getTeam(teamInfo._id);


      const pendingRequestWithTeamUserInfo = {
        ...joinRequest,
        team: teamRequest,
        user: user
      }

      setPendingJoinRequest(pendingRequestWithTeamUserInfo);

      // Optionally redirect or show success message
      // For now, just reset the form
      setTeamCode('');
      setTeamInfo(null);
      setError('');
    } catch (error) {
      setError('Failed to send join request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="p-2 flex ">
        <div className="flex items-center gap-2 mt-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold mb-2">Join a Team</CardTitle>
          </div>
        </div>
        {/* <p className="text-muted-foreground">
          Enter the team code provided by your coach to join their team
        </p> */}
      </CardHeader>

      <CardContent className="space-y-6 px-8 pb-6">
        <div className="space-y-3">
          <Label htmlFor="teamCode" className="font-medium">Team Code</Label>
          <div className="flex gap-3">
            <Input
              id="teamCode"
              placeholder="Enter 6-character team code"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              maxLength={6}
              disabled={isLoading}
              className="py-2 px-3"
            />
            <Button
              onClick={handleFetchTeam}
              disabled={!teamCode.trim() || isLoading}
              className="px-4"
            >
              {isLoading ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground">
            Enter the team code provided by your coach to join their team
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {teamInfo && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center">
                  {teamInfo.logoUrl && (
                    <Image 
                      src={teamInfo.logoUrl} 
                      alt={teamInfo.name} 
                      width={80} 
                      height={80} 
                      className="w-20 h-20 rounded-full" 
                    />
                  )}
                  {!teamInfo.logoUrl && (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{teamInfo.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">Team Found</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                {teamInfo.description || "Join this team to start collaborating with your teammates and coach."}
              </p>

              <div className="space-y-2">
                <Button
                  onClick={handleJoinTeam}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Request to Join Team
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Your request will be sent to the team coach for approval
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            Don't have a team code? Ask your coach or team administrator for the 6-character code.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
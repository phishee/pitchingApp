'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Mail, CheckCircle, X, User, Trophy } from 'lucide-react';
import { useTeam } from '@/providers/team-context';
import { TeamInvitationWithTeamUserInfo, User as UserType } from '@/models';
import { teamInvitationApi } from '@/app/services-client/teamInvitationApi';
import Image from 'next/image';

function TeamInvitation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { currentUserPendingInvitations, setCurrentUserPendingInvitations, acceptInvitation, rejectInvitation } = useTeam();
  const [invitation, setInvitation] = useState<Partial<TeamInvitationWithTeamUserInfo> | null>(null);

  useEffect(() => {
    if (currentUserPendingInvitations) {
      setInvitation(currentUserPendingInvitations[0]);
    }
  }, [currentUserPendingInvitations]);

  // For now, use the first invitation or fake data


  const handleAcceptInvitation = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (invitation?._id && invitation?.teamId) {
        // accept invitation
        await acceptInvitation(invitation._id, invitation.teamId);
      }
      
      setShowAcceptDialog(false);
    } catch (error) {
      setError('Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvitation = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (invitation?._id && invitation?.teamId) {
        // reject invitation
        await rejectInvitation(invitation._id, invitation.teamId);
      }
      
      setShowRejectDialog(false);
    } catch (error) {
      setError('Failed to reject invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitation) {
    return null;
  }

  // Type-safe access to team and user properties
  const team = invitation.team as any;
  const invitedByUser = invitation.invitedByUser as Partial<UserType>;

  return (
    <Card className="w-full  mx-auto p-4">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
          <div>
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            Team Invitation
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="">
        {/* Team Info */}
        {team && (
          <div className="flex items-center justify-center mb-6 gap-4">
            {team.logoUrl ? (
              <Image
                src={team.logoUrl}
                alt={team.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-md"
              />
            ) : null}
            {/* Fallback text logo if no logo or logo fails to load */}
            <div className={`w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center border-2 border-gray-200 shadow-md ${team.logoUrl ? 'hidden' : ''}`}>
              <span className="text-white font-bold text-lg">{team.name.split(' ').map((word: string) => word[0]).join('')}</span>
            </div>
            <div className="text-center">
              <div className="text-black font-bold text-2xl">{team.name}</div>
              {team.city && team.state && (
                <div className="text-gray-600 text-sm">{team.city}, {team.state}</div>
              )}
            </div>
          </div>
        )}

        {/* Coach Info */}
        {invitedByUser && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              {invitedByUser.profileImageUrl ? (
                <Image
                  src={invitedByUser.profileImageUrl}
                  alt={`${invitedByUser.name}`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
              )}
              <div className="text-sm font-medium text-gray-700">Invited by</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {invitedByUser.name}
              </div>
              <div className="text-sm text-gray-600">{invitedByUser.email}</div>
            </div>
          </div>
        )}

        {/* Invitation Details */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-blue-800 font-medium mb-2">
              You've been invited to join as a <span className="font-bold">{invitation.role}</span>
            </div>
            <div className="text-sm text-blue-700">
              Invitation sent on {invitation.invitedAt ? new Date(invitation.invitedAt).toLocaleDateString() : 'Unknown date'}
            </div>
            {invitation.expiresAt && (
              <div className="text-xs text-blue-600 mt-1">
                Expires on {new Date(invitation.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
            <AlertDialogTrigger asChild>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Accept Invitation
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Accept Team Invitation?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to accept the invitation to join {team?.name}? 
                  You'll become a member of the team immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAcceptInvitation}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Accepting...' : 'Yes, Accept Invitation'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400"
                disabled={isLoading}
              >
                {isLoading ? (
                  <X className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Decline
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Decline Team Invitation?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to decline the invitation to join {team?.name}? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRejectInvitation}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? 'Declining...' : 'Yes, Decline Invitation'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default TeamInvitation;
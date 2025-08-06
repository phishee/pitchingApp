'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send, 
  UserPlus,
  Trophy,
  Activity
} from 'lucide-react';
import { useAuth } from '@/providers/auth-context';
import { teamApi } from '@/app/services-client/teamApi';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { useUser } from '@/providers/user.context';
import NoTeamAthlete from '../common/no-team/no-team-athlete';
// import { teamJoinRequestApi } from '@/app/services-client/teamJoinRequestApi';

interface TeamMember {
  _id: string;
  teamId: string;
  userId: string;
  role: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
}

interface TeamInvitation {
  _id: string;
  teamId: string;
  invitedUserId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

interface TeamJoinRequest {
  _id: string;
  teamId: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export function AthleteDashboard() {
  const { user } = useAuth();
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);

  const [teamCode, setTeamCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { pendingInvitation, pendingJoinRequest, joinTeam, acceptInvitation, rejectInvitation } = useUser();

 
  // If user is already a team member
  if (!teamMember) {
    return (
      <div className="space-y-6">
        <NoTeamAthlete />
      </div>
    );
  }

  // If user is not a member and has no pending requests/invitations
  return (
    <div className="space-y-6">
      The Dashboard
    </div>
  );
}
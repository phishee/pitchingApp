'use client'
import UserList from '@/components/common/users/user-list'
import React, { useContext, useState, useMemo } from 'react'
import { teamMembers, pendingRequests, teamInvitations } from '@/data/fakeUser'
import { PopulatedTeamMember, TeamInvitation } from '@/models';
import { useTeam } from '@/providers/team-context';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlayerList from '@/components/common/users/player-list';
import PendingRequestList from '@/components/common/users/pending-request-list';
import InvitationList from '@/components/common/users/invitation-list';
import InviteUserModal from '@/components/common/users/invite-user-modal';

function UserPage() {
  //get the json ready to be used as a list of team members
  const { currentTeamMember, teamInvitations, setTeamInvitations, teamMembers, teamRequests } = useTeam();
  const [activeTab, setActiveTab] = useState('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteUser = (invitation: Partial<TeamInvitation>) => {
    console.log('Inviting user:', invitation);
    // Here you would make the API call to send the invitation
    // For now, just add it to the local state
    setTeamInvitations([...teamInvitations, invitation]);
    setIsInviteModalOpen(false);
  };

  // Filter team members based on active tab
  const filteredTeamMembers = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return teamMembers;
      case 'athlete':
        return teamMembers.filter(member => member.role === 'athlete' && member.status === 'active');
      case 'coach':
        return teamMembers.filter(member => member.role === 'coach' && member.status === 'active');
      case 'pending':
        return teamMembers.filter(member => member.status === 'inactive');
      case 'invitation':
        return teamMembers.filter(member => member.status === 'inactive');
      default:
        return teamMembers;
    }
  }, [activeTab, teamMembers]);

  // Get counts for badges
  const pendingCount = teamRequests.length;
  const invitationCount = teamInvitations.length;

  return (
    <div>
      <div className="flex gap-4 mb-4 mt-4 items-center justify-between">
        <div className="text-2xl font-bold ">
          Team Members
        </div>
        <div>
          {currentTeamMember?.role === 'coach' && (
            <Button
              className='rounded-full'
              onClick={() => setIsInviteModalOpen(true)}
              disabled
            >
              <PlusIcon className="w-4 h-4" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* {currentTeamMember?.role === 'coach' && (
        <div className="flex flex-col gap-4">
          <CoachFilter />
        </div>
      )} */}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-auto bg-transparent border-b border-border/20">
          <TabsTrigger
            value="all"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent hover:bg-muted/20 text-sm px-4 py-2"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="athlete"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent hover:bg-muted/20 text-sm px-4 py-2"
          >
            Players
          </TabsTrigger>
          <TabsTrigger
            value="coach"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent hover:bg-muted/20 text-sm px-4 py-2"
          >
            Coach
          </TabsTrigger>
          {currentTeamMember?.role === 'coach' && (
            <>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent hover:bg-muted/20 text-sm px-4 py-2"
              >
                Pending Request
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full min-w-[20px]">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="invitation"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent hover:bg-muted/20 text-sm px-4 py-2"
              >
                Invitation Sent
                {invitationCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full min-w-[20px]">
                    {invitationCount}
                  </span>
                )}
              </TabsTrigger>
            </>

          )}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <UserList type="team-members" data={filteredTeamMembers} />
        </TabsContent>

        <TabsContent value="athlete" className="mt-6">
          <PlayerList data={filteredTeamMembers}
            isCoach={currentTeamMember?.role === 'coach'}
          />
        </TabsContent>

        <TabsContent value="coach" className="mt-6">
          <UserList type="team-members" data={filteredTeamMembers} />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingRequestList data={teamRequests} />
        </TabsContent>

        <TabsContent value="invitation" className="mt-6">
          <InvitationList data={teamInvitations} />
        </TabsContent>
      </Tabs>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        mode="user-page"
        existingInvitations={teamInvitations}
        existingMembers={teamMembers.filter(m => m.userId).map(m => m.userId!)}
        onInviteUser={handleInviteUser}
        teamId="your-team-id" // Replace with actual team ID
        invitedBy={currentTeamMember?.userId || ''}
      />
    </div>
  )
}

export default UserPage
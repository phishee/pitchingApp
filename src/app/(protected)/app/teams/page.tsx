'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TeamCard } from '@/components/common/teams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Building2, Loader2 } from 'lucide-react';
import { Team } from '@/models';
import { teamApi } from '@/app/services-client/teamApi';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { useTeam } from '@/providers/team-context';
import { useUser } from '@/providers/user.context';
import { useOrganization } from '@/providers/organization-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

function TeamsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { allTeams, currentTeam, switchTeam, isLoading: contextLoading } = useTeam();
  const { organizationTeams, isLoading: organizationLoading } = useOrganization();
  // Remove local teams state since we use context data
  const [teamMemberCounts, setTeamMemberCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'coach' | 'athlete'>('all');

  // Use organization teams if available, otherwise fall back to user teams
  const displayTeams = organizationTeams.length > 0 ? organizationTeams : allTeams;
  const isLoadingTeams = organizationLoading || contextLoading || isLoading;

  // Load member counts when display teams change
  useEffect(() => {
    const loadMemberCounts = async () => {
      if (displayTeams.length === 0) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load member counts for each team
        const memberCountPromises = displayTeams.map(async (team) => {
          try {
            const members = await teamMemberApi.getTeamMembersByTeam(team._id);
            return { teamId: team._id, count: members.filter(m => m.status === 'active').length };
          } catch (err) {
            console.error(`Error loading members for team ${team._id}:`, err);
            return { teamId: team._id, count: 0 };
          }
        });

        const memberCounts = await Promise.all(memberCountPromises);
        const memberCountMap = memberCounts.reduce((acc, { teamId, count }) => {
          acc[teamId] = count;
          return acc;
        }, {} as Record<string, number>);

        setTeamMemberCounts(memberCountMap);
      } catch (err) {
        console.error('Error loading member counts:', err);
        setError('Failed to load member counts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMemberCounts();
  }, [displayTeams]);

  // Filter and search teams
  const filteredTeams = useMemo(() => {
    let filtered = displayTeams;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.teamCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter (this would need to be enhanced based on actual team membership data)
    // For now, we'll show all teams since we don't have role-based filtering in the current API

    return filtered;
  }, [displayTeams, searchQuery, filterRole]);

  // Get member count for each team
  const getMemberCount = (teamId: string) => {
    return teamMemberCounts[teamId] || 0;
  };

  // Handle team actions
  const handleViewTeam = (teamId: string) => {
    // Navigate to team details page or open modal
    // For now, just log - this would typically navigate to /app/teams/[id] or open a modal
    console.log('View team:', teamId);
    // TODO: Implement team details view
    // router.push(`/app/teams/${teamId}`);
  };

  const handleEditTeam = (teamId: string) => {
    // Navigate to edit team page
    router.push(`/app/teams/${teamId}/edit`);
  };

  const handleSwitchTeam = async (teamId: string) => {
    try {
      await switchTeam(teamId);
    } catch (err) {
      console.error('Error switching team:', err);
    }
  };

  const handleJoinTeam = (teamId: string) => {
    // Handle join team logic
    // For now, just log - this would typically open a join request modal or navigate to join flow
    console.log('Join team:', teamId);
    // TODO: Implement team join flow
    // This could open a modal asking for role selection, or navigate to join flow
  };

  const handleCreateTeam = () => {
    // Navigate to create team page
    router.push('/app/teams/create');
  };

  // Loading skeleton
  const TeamCardSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gray-100 flex items-center justify-center">
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
          <p className="text-gray-600">
            Manage and explore teams in your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'coach' || user?.isAdmin ? (
            <Button 
              onClick={handleCreateTeam}
              className="bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          ) : null}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search teams by name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge 
            variant={filterRole === 'all' ? 'secondary' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilterRole('all')}
          >
            All Teams
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{displayTeams.length}</div>
                <div className="text-sm text-gray-600">Total Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentTeam ? 1 : 0}
                </div>
                <div className="text-sm text-gray-600">Current Team</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{filteredTeams.length}</div>
                <div className="text-sm text-gray-600">Filtered Results</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      {isLoadingTeams ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <TeamCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              memberCount={getMemberCount(team._id)}
              userRole={user?.role as 'coach' | 'athlete'}
              isCurrentTeam={currentTeam?._id === team._id}
              onViewTeam={handleViewTeam}
              onSwitchTeam={handleSwitchTeam}
              onJoinTeam={handleJoinTeam}
              onEditTeam={handleEditTeam}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No teams found' : 'No teams available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms to find what you\'re looking for.'
                    : 'There are no teams available at the moment.'
                  }
                </p>
                {searchQuery ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                  ) : (
                    user?.role === 'coach' || user?.isAdmin ? (
                      <Button onClick={handleCreateTeam}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Team
                      </Button>
                    ) : null
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TeamsPage;
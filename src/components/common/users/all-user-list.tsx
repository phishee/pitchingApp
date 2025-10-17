'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import { Search, X, Trash2, BarChart3, UserMinus, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/models/User';
import { Team } from '@/models/Team';
import { userApi } from '@/app/services-client/userApi';
import { teamApi } from '@/app/services-client/teamApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserWithTeamInfo extends User {
  teamMemberships?: {
    teamId: string;
    teamName?: string;
    role: 'coach' | 'athlete';
    status: 'active' | 'inactive';
  }[];
}

interface AllUserListProps {
  organizationId: string;
  currentUserRole: 'admin' | 'coach' | 'athlete';
}

const AllUserList = ({ 
  organizationId, 
  currentUserRole 
}: AllUserListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithTeamInfo[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<UserWithTeamInfo | null>(null);
  const [isBulkRemoveDialogOpen, setIsBulkRemoveDialogOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (roleFilter !== 'all') filters.role = roleFilter;
      if (teamFilter !== 'all') filters.teamId = teamFilter;
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const userData = await userApi.getUsersByOrganization(organizationId, filters);
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, roleFilter, teamFilter, searchQuery, statusFilter]);

  const loadTeams = useCallback(async () => {
    try {
      const teamData = await teamApi.getTeams();
      setTeams(teamData);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  }, []);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadUsers();
    loadTeams();
  }, [loadUsers, loadTeams]);

  const filteredData = useMemo(() => {
    let filtered = users;

    // Client-side filtering for team names (since API might not have team names populated)
    if (teamFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.teamMemberships?.some(membership => membership.teamId === teamFilter)
      );
    }

    return filtered;
  }, [users, teamFilter]);

  const selectedRows = useMemo(() => {
    return Object.keys(rowSelection).filter(key => rowSelection[key]);
  }, [rowSelection]);

  const handleBulkRemove = () => {
    setIsBulkRemoveDialogOpen(true);
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.userId === userId);
    setUserToRemove(user || null);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (userToRemove) {
      // TODO: Implement remove user logic
      console.log('Remove user:', userToRemove.userId);
      setIsRemoveDialogOpen(false);
      setUserToRemove(null);
    }
  };

  const handleBulkRemoveConfirm = () => {
    // TODO: Implement bulk remove logic
    console.log('Bulk remove users:', selectedRows);
    setRowSelection({});
    setIsBulkRemoveDialogOpen(false);
  };

  const handleViewAnalytics = (userId: string) => {
    console.log('View analytics for user:', userId);
  };

  const getRoleBadge = (user: UserWithTeamInfo) => {
    if (user.isAdmin) {
      return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
    }
    if (user.role === 'coach') {
      return <Badge className="bg-blue-100 text-blue-800">Coach</Badge>;
    }
    if (user.role === 'athlete') {
      return <Badge className="bg-green-100 text-green-800">Athlete</Badge>;
    }
    return <Badge variant="outline">No Role</Badge>;
  };

  const getTeamNames = (user: UserWithTeamInfo) => {
    if (!user.teamMemberships || user.teamMemberships.length === 0) {
      return <span className="text-muted-foreground text-sm">No teams</span>;
    }

    const activeMemberships = user.teamMemberships.filter(m => m.status === 'active');
    if (activeMemberships.length === 0) {
      return <span className="text-muted-foreground text-sm">No active teams</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {activeMemberships.slice(0, 2).map((membership, index) => {
          const team = teams.find(t => t._id === membership.teamId);
          return (
            <Badge key={index} variant="outline" className="text-xs">
              {team?.name || 'Unknown Team'}
            </Badge>
          );
        })}
        {activeMemberships.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{activeMemberships.length - 2} more
          </Badge>
        )}
      </div>
    );
  };

  const columns = useMemo<ColumnDef<UserWithTeamInfo>[]>(() => [
    ...(currentUserRole === 'admin' ? [{
      id: 'select',
      header: ({ table }: { table: any }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: any }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    }] : []),
    {
      accessorKey: 'user',
      id: 'user',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="User"
          visibility={true}
          column={column}
        />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const name = user.name || 'Unknown';
        const email = user.email || 'No email';
        const avatarUrl = user.profileImageUrl;
        const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={name} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-px">
              <div className="font-medium text-sm">{name}</div>
              <div className="text-muted-foreground text-xs">{email}</div>
            </div>
          </div>
        );
      },
      size: 300,
      meta: {
        headerTitle: 'User',
        skeleton: (
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ),
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'role',
      id: 'role',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Role"
          visibility={true}
          column={column}
        />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return getRoleBadge(user);
      },
      size: 120,
      meta: {
        headerTitle: 'Role',
        skeleton: <Skeleton className="w-16 h-7" />,
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'position',
      id: 'position',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Position"
          visibility={true}
          column={column}
        />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const position = user.position;
        
        if (!position) return '-';
        
        return (
          <Badge variant="outline" className="capitalize">
            {position.replace('_', ' ')}
          </Badge>
        );
      },
      size: 150,
      meta: {
        headerTitle: 'Position',
        skeleton: <Skeleton className="w-20 h-7" />,
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'teams',
      id: 'teams',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Teams"
          visibility={true}
          column={column}
        />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return getTeamNames(user);
      },
      size: 200,
      meta: {
        headerTitle: 'Teams',
        skeleton: <Skeleton className="w-24 h-7" />,
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Status"
          visibility={true}
          column={column}
        />
      ),
      size: 100,
      cell: ({ row }) => {
        const user = row.original;
        const hasActiveTeams = user.teamMemberships?.some(m => m.status === 'active');
        
        return (
          <Badge className={`capitalize ${
            hasActiveTeams 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {hasActiveTeams ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
      meta: {
        headerTitle: 'Status',
        skeleton: <Skeleton className="w-14 h-7" />,
      },
      enableSorting: true,
      enableHiding: true,
    },
    ...(currentUserRole === 'admin' ? [{
      accessorKey: 'quickActions',
      id: 'quickActions',
      header: ({ column }: { column: any }) => (
        <DataGridColumnHeader
          title="Quick Actions"
          visibility={true}
          column={column}
        />
      ),
      size: 150,
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        
        return (
          <div className="flex gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveUser(user.userId)}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              title="Remove user"
            >
              <UserMinus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewAnalytics(user.userId)}
              className="h-7 w-7 p-0"
              title="View user analytics"
            >
              <BarChart3 className="size-4" />
            </Button>
          </div>
        );
      },
      meta: {
        headerTitle: 'Quick Actions',
        skeleton: <Skeleton className="w-16 h-7" />,
      },
      enableSorting: false,
      enableHiding: false,
    }] : []),
    {
      accessorKey: 'arrow',
      header: '',
      cell: () => (
        <div>
          <ChevronRight className="text-muted-foreground/70 size-4 hover:text-muted-foreground hover:cursor-pointer" />
        </div>
      ),
      size: 60,
      enableSorting: false,
      enableHiding: false,
    },
  ], [currentUserRole, teams]);

  const table = useReactTable({
    columns,
    data: filteredData,
    getRowId: (row) => row._id || row.userId || `user-${Math.random()}`,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <>
      <DataGrid
        table={table}
        recordCount={filteredData.length}
        isLoading={isLoading}
        tableLayout={{
          columnsResizable: true,
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
        tableClassNames={{
          edgeCell: 'px-5',
        }}
      >
        <Card>
          <CardHeader className="flex-col flex-wrap sm:flex-row items-stretch sm:items-center py-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search users"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                    className="ps-9 w-full sm:w-40 md:w-80 rounded-full"
                  />
                  {searchQuery.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="athlete">Athlete</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team._id} value={team._id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {currentUserRole === 'admin' && selectedRows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedRows.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkRemove}
                      className="h-8 px-3 text-xs"
                    >
                      <Trash2 className="size-3 mr-1" />
                      Remove Users
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      {/* Remove User Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.name || 'this user'} from the organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep them</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm} className="bg-red-600 hover:bg-red-700">
              Yes, remove them
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Remove Confirmation Dialog */}
      <AlertDialog open={isBulkRemoveDialogOpen} onOpenChange={setIsBulkRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Multiple Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedRows.length} user{selectedRows.length > 1 ? 's' : ''} from the organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep them</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRemoveConfirm} className="bg-red-600 hover:bg-red-700">
              Yes, remove {selectedRows.length > 1 ? 'all' : 'them'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AllUserList;

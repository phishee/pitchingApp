'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import { Search, X, ChevronRight, UserCheck, UserX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DataGrid,
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { TeamJoinRequestWithTeamUserInfo } from '@/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { useTeam } from '@/providers/team-context';
import { formatDateWithOrdinal } from '@/lib/helpers';

interface PendingRequestListProps {
  data: Partial<TeamJoinRequestWithTeamUserInfo>[];
  isLoading?: boolean;
}

const PendingRequestList = ({
  data,
  isLoading = false
}: PendingRequestListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedRequest, setSelectedRequest] = useState<TeamJoinRequestWithTeamUserInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<TeamJoinRequestWithTeamUserInfo | null>(null);
  const { loadTeamMembers, loadTeamRequests } = useTeam();

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter(item => {
      const name = item?.user?.name || '';
      const email = item?.user?.email || '';

      return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery]);

  const selectedRows = useMemo(() => {
    return Object.keys(rowSelection).filter(key => rowSelection[key]);
  }, [rowSelection]);

  const handleBulkAccept = () => {
    console.log('Bulk accept requests:', selectedRows);
  };

  const handleBulkReject = () => {
    console.log('Bulk reject requests:', selectedRows);
  };

  const reloadTeamMembersAndRequests = async (teamId: string) => {
    await loadTeamMembers(teamId);
    await loadTeamRequests(teamId);
  }

  const handleAccept = async (request: TeamJoinRequestWithTeamUserInfo) => {
    const response = await teamMemberApi.acceptTeamRequest(request._id, request.teamId);
    if (response) {
      reloadTeamMembersAndRequests(request.teamId);
    }
  };

  const handleReject = async (request: TeamJoinRequestWithTeamUserInfo) => {
    setRequestToReject(request);
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (requestToReject) {
      const response = await teamMemberApi.rejectTeamRequest(requestToReject._id, { comment: rejectComment, rejectedBy: requestToReject.requestedBy });
      if (response) {
        reloadTeamMembersAndRequests(requestToReject.teamId);
      }
      setRejectComment('');
      reloadTeamMembersAndRequests(requestToReject.teamId);
      setIsRejectDialogOpen(false);
      setRequestToReject(null);
    }
  };

  const handleViewDetails = (request: TeamJoinRequestWithTeamUserInfo) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const getFakeAverage = (position?: string) => {
    if (!position) return 'N/A';

    const averages: Record<string, string> = {
      pitcher: '87.5 mph',
      catcher: '2.1 sec pop time',
      first_base: '0.95 fielding %',
      second_base: '0.92 fielding %',
      third_base: '0.89 fielding %',
      shortstop: '0.94 fielding %',
      left_field: '0.91 fielding %',
      center_field: '0.93 fielding %',
      right_field: '0.90 fielding %'
    };

    return averages[position] || 'N/A';
  };

  const columns = useMemo<ColumnDef<Partial<TeamJoinRequestWithTeamUserInfo>>[]>(() => [
    {
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
    },
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
        const request = row.original;
        const name = request.user?.name || 'Unknown';
        const email = request.user?.email || 'No email';
        const avatarUrl = request.user?.profileImageUrl;
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
      size: 125,
      cell: ({ row }) => {
        const request = row.original;
        const role = request.role;

        if (!role) return '-';

        return (
          <Badge variant="outline" className="capitalize">
            {role}
          </Badge>
        );
      },
      meta: {
        headerTitle: 'Role',
        skeleton: <Skeleton className="w-20 h-7" />,
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'requestedAt',
      id: 'requestedAt',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Date Requested"
          visibility={true}
          column={column}
        />
      ),
      size: 150,
      cell: ({ row }) => {
        const request = row.original;
        const date = request.requestedAt;

        if (!date) return '-';

        return (
          <span className="text-sm text-muted-foreground">
            {formatDateWithOrdinal(date)}
          </span>
        );
      },
      meta: {
        headerTitle: 'Date Requested',
        skeleton: <Skeleton className="w-24 h-7" />,
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
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
        const request = row.original;

        return (
          <div className="flex gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAccept(request)}
              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Accept request"
            >
              <UserCheck className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReject(request)}
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Reject request"
            >
              <UserX className="size-4" />
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
    },
    {
      accessorKey: 'arrow',
      header: '',
      cell: ({ row }: { row: any }) => {
        const request = row.original;

        return (
          <div className="flex items-center justify-center px-4">
            <ChevronRight
              className="text-muted-foreground/70 size-4 hover:text-muted-foreground hover:cursor-pointer"
              onClick={() => handleViewDetails(request)}
            />
          </div>
        );
      },
      size: 80, // Increased size to ensure visibility
      enableSorting: false,
      enableHiding: false,
      minSize: 60, // Added minimum size
    },
  ], []);

  const table = useReactTable({
    columns,
    data: filteredData,
    getRowId: (row) => row._id || `request-${Math.random()}`,
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
                    placeholder="Search pending requests"
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

                {selectedRows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedRows.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkAccept}
                      className="h-8 px-3 text-xs text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <UserCheck className="size-3 mr-1" />
                      Accept All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkReject}
                      className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <UserX className="size-3 mr-1" />
                      Reject All
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

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Review user information before making a decision
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {selectedRequest.user?.profileImageUrl && (
                    <AvatarImage src={selectedRequest.user.profileImageUrl} alt={selectedRequest.user.name || ''} />
                  )}
                  <AvatarFallback className="text-lg">
                    {selectedRequest.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedRequest.user?.name}</h3>
                  <p className="text-muted-foreground">{selectedRequest.user?.email}</p>
                  {selectedRequest.user?.position && (
                    <Badge variant="outline" className="mt-1 capitalize">
                      {selectedRequest.user.position.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              {selectedRequest.user?.position && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <Label className="text-sm font-medium">Performance Metrics</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRequest.user.position === 'pitcher' ? 'Average Speed' : 'Average Performance'}: {' '}
                    <span className="font-medium text-foreground">
                      {getFakeAverage(selectedRequest.user.position)}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    handleAccept(selectedRequest);
                    setIsModalOpen(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="size-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRequestToReject(selectedRequest);
                    setIsModalOpen(false);
                    setIsRejectDialogOpen(true);
                  }}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <UserX className="size-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-comment">Rejection Reason</Label>
              <Textarea
                id="reject-comment"
                placeholder="Enter reason for rejection..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRequestToReject(null);
                setRejectComment('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingRequestList;

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
import { Search, X, XCircle, ChevronRight } from 'lucide-react';
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
import { TeamInvitationWithTeamUserInfo } from '@/models';
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
import { formatDateWithOrdinal } from '@/lib/helpers';

interface InvitationListProps {
  data: Partial<TeamInvitationWithTeamUserInfo>[];
  isLoading?: boolean;
}

const InvitationList = ({ 
  data, 
  isLoading = false
}: InvitationListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState<Partial<TeamInvitationWithTeamUserInfo> | null>(null);
  const [isBulkCancelDialogOpen, setIsBulkCancelDialogOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item => {
      const name = item?.user?.name || '';
      const email = item?.user?.email || item.invitedEmail || '';
      
      return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery]);

  const selectedRows = useMemo(() => {
    return Object.keys(rowSelection).filter(key => rowSelection[key]);
  }, [rowSelection]);

  const handleBulkCancel = () => {
    setIsBulkCancelDialogOpen(true);
  };

  const handleCancel = (invitation: TeamInvitationWithTeamUserInfo) => {
    setInvitationToCancel(invitation);
    setIsCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (invitationToCancel) {
      console.log('Cancel invitation:', invitationToCancel._id);
      setIsCancelDialogOpen(false);
      setInvitationToCancel(null);
    }
  };

  const handleBulkCancelConfirm = () => {
    console.log('Bulk cancel invitations:', selectedRows);
    setRowSelection({});
    setIsBulkCancelDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<Partial<TeamInvitationWithTeamUserInfo>>[]>(() => [
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
        const invitation = row.original;
        const user = invitation.user;
        
        if (user) {
          // Existing user - show avatar, name, and email
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
        } else {
          // New user - just show email
          const email = invitation.invitedEmail;
          const initials = email ? email.charAt(0).toUpperCase() : '?';

          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-px">
                <div className="font-medium text-sm">{email}</div>
                <div className="text-muted-foreground text-xs">New user</div>
              </div>
            </div>
          );
        }
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
        const invitation = row.original;
        const role = invitation.role;
        
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
      accessorKey: 'invitedAt',
      id: 'invitedAt',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Date Invited"
          visibility={true}
          column={column}
        />
      ),
      size: 150,
      cell: ({ row }) => {
        const invitation = row.original;
        const date = invitation.invitedAt;
        
        if (!date) return '-';
        
        return (
          <span className="text-sm text-muted-foreground">
            {formatDateWithOrdinal(date)}
          </span>
        );
      },
      meta: {
        headerTitle: 'Date Invited',
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
        const invitation = row.original;
        
        return (
          <div className="flex gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancel(invitation)}
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Cancel invitation"
            >
              <XCircle className="size-4" />
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
  ], []);

  const table = useReactTable({
    columns,
    data: filteredData,
    getRowId: (row) => row._id || `invitation-${Math.random()}`,
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
                    placeholder="Search invitations"
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
                      onClick={handleBulkCancel}
                      className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="size-3 mr-1" />
                      Cancel All
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700">
              Yes, cancel it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Cancel Confirmation Dialog */}
      <AlertDialog open={isBulkCancelDialogOpen} onOpenChange={setIsBulkCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Multiple Invitations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel {selectedRows.length} invitation{selectedRows.length > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep them</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkCancelConfirm} className="bg-red-600 hover:bg-red-700">
              Yes, cancel {selectedRows.length > 1 ? 'all' : 'it'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvitationList;

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
import { Search, X, Check, Plus, Trash2, BarChart3, UserMinus, ChevronRight } from 'lucide-react';
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
import { PopulatedTeamMember } from '@/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface PlayerListProps {
  data: PopulatedTeamMember[];
  isLoading?: boolean;
  isCoach?: boolean;
}

const PlayerList = ({ 
  data, 
  isLoading = false,
  isCoach = false
}: PlayerListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isAssignProgramModalOpen, setIsAssignProgramModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PopulatedTeamMember | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<PopulatedTeamMember | null>(null);
  const [isBulkRemoveDialogOpen, setIsBulkRemoveDialogOpen] = useState(false);

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

  const handleBulkRemove = () => {
    setIsBulkRemoveDialogOpen(true);
  };

  const handleBulkAssignProgram = () => {
    setIsAssignProgramModalOpen(true);
  };

  const handleRemoveUser = (userId: string) => {
    const member = data.find(m => m.userId === userId);
    setMemberToRemove(member || null);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (memberToRemove) {
      console.log('Remove user:', memberToRemove.userId);
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleBulkRemoveConfirm = () => {
    console.log('Bulk remove users:', selectedRows);
    setRowSelection({});
    setIsBulkRemoveDialogOpen(false);
  };

  const handleViewAnalytics = (userId: string) => {
    console.log('View analytics for user:', userId);
  };

  const handleAssignProgram = (userId: string) => {
    const member = data.find(m => m.userId === userId);
    setSelectedMember(member || null);
    setIsAssignProgramModalOpen(true);
  };

  const columns = useMemo<ColumnDef<PopulatedTeamMember>[]>(() => [
    ...(isCoach ? [{
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
        const member = row.original;
        const name = member.user?.name || 'Unknown';
        const email = member.user?.email || 'No email';
        const avatarUrl = member.user?.profileImageUrl;
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
        const member = row.original;
        const position = member.user?.position;
        
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
      accessorKey: 'status',
      id: 'status',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Status"
          visibility={true}
          column={column}
        />
      ),
      size: 125,
      cell: ({ row }) => {
        const member = row.original;
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800'
        };
        
        return (
          <Badge className={`capitalize ${statusColors[member.status]}`}>
            {member.status}
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
    {
      accessorKey: 'program',
      id: 'program',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Enrolled in Program"
          visibility={true}
          column={column}
        />
      ),
      size: 200,
      cell: ({ row }) => {
        const member = row.original;
        const hasProgram = member.programIds && member.programIds.length > 0;
        
        if (hasProgram) {
          return (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="size-4" />
              <span className="text-sm">Enrolled</span>
            </div>
          );
        }
        
        if (isCoach) {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAssignProgram(member.userId)}
              className="h-7 px-2 text-xs"
            >
              <Plus className="size-3 mr-1" />
              assign Programs
            </Button>
          );
        }
        
        return (
          <span className="text-muted-foreground text-sm">Not enrolled</span>
        );
      },
      meta: {
        headerTitle: 'Enrolled in Program',
        skeleton: <Skeleton className="w-24 h-7" />,
      },
      enableSorting: true,
      enableHiding: true,
    },
    ...(isCoach ? [{
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
        const member = row.original;
        
        return (
          <div className="flex gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveUser(member.userId)}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              title="Remove user from team"
            >
              <UserMinus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewAnalytics(member.userId)}
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
  ], [isCoach]);

  const table = useReactTable({
    columns,
    data: filteredData,
    getRowId: (row) => row._id || row.userId || `member-${Math.random()}`,
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
                    placeholder="Search players"
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
                
                {isCoach && selectedRows.length > 0 && (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkAssignProgram}
                      className="h-8 px-3 text-xs"
                    >
                      <Plus className="size-3 mr-1" />
                      Assign Program
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

      {/* Assign Program Modal */}
      <Dialog open={isAssignProgramModalOpen} onOpenChange={setIsAssignProgramModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Program</DialogTitle>
            <DialogDescription>
              {selectedMember 
                ? `Assign a program to ${selectedMember.user?.name || 'this user'}`
                : `Assign programs to ${selectedRows.length} selected users`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <p>Program assignment functionality coming soon...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove User Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user?.name || 'this user'} from the team? This action cannot be undone.
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
              Are you sure you want to remove {selectedRows.length} user{selectedRows.length > 1 ? 's' : ''} from the team? This action cannot be undone.
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

export default PlayerList;

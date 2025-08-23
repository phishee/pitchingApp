'use client';

import { useMemo } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronRight, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import {
  DataGrid,
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { User, PopulatedTeamMember } from '@/models';


interface UserListProps {
  data: Partial<User>[] | Partial<PopulatedTeamMember>[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showActions?: boolean;
  type: 'users' | 'team-members';
}

const UserList = ({ 
  data, 
  isLoading = false, 
  onDelete, 
  onEdit, 
  showActions = false,
  type 
}: UserListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item => {
      const name = type === 'users' 
        ? (item as Partial<User>).name 
        : (item as Partial<PopulatedTeamMember>)?.user?.name;
      const email = type === 'users' 
        ? (item as Partial<User>).email 
        : (item as Partial<PopulatedTeamMember>)?.user?.email;
      
      return name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, type]);

  const columns = useMemo<ColumnDef<Partial<User> | Partial<PopulatedTeamMember>>[]>(() => [
    {
      accessorKey: 'name',
      id: 'name',
      header: ({ column }) => (
        <DataGridColumnHeader
          title="User"
          visibility={true}
          column={column}
        />
      ),
      cell: ({ row }) => {
        const item = row.original;
        let name: string, email: string, avatarUrl: string | undefined;
        
        if (type === 'users') {
          const user = item as User;
          name = user.name;
          email = user.email;
          avatarUrl = user.profileImageUrl;
        } else {
          const member = item as PopulatedTeamMember;
          name = member.user?.name || '';
          email = member.user?.email || '';
          avatarUrl = member.user?.profileImageUrl;
        }

        const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={name || ''} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-px">
              <div className="font-medium text-sm">{name || 'Unknown'}</div>
              <div className="text-muted-foreground text-xs">{email || 'No email'}</div>
            </div>
          </div>
        );
      },
      size: 300,
      meta: {
        headerTitle: 'Name',
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
      size: 150,
      cell: ({ row }) => {
        if (type === 'users') return '-';
        
        const member = row.original as PopulatedTeamMember;
        return (
          <Badge variant="secondary" className="capitalize">
            {member.role}
          </Badge>
        );
      },
      meta: {
        headerTitle: 'Role',
        skeleton: <Skeleton className="w-28 h-7" />,
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
        if (type === 'users') return '-';
        
        const member = row.original as PopulatedTeamMember;
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
    ...(showActions ? [{
      accessorKey: 'actions',
      id: 'actions',
      header: '',
      cell: ({ row }: { row: any }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item._id)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(item._id)}
              >
                Delete
              </Button>
            )}
          </div>
        );
      },
      size: 150,
      enableSorting: false,
      enableHiding: false,
    }] : []),
    {
      accessorKey: 'arrow',
      header: '',
      cell: () => (
        <ChevronRight className="text-muted-foreground/70 size-3.5" />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
  ], [type, showActions, onEdit, onDelete]);

  const table = useReactTable({
    columns,
    data: filteredData,
    getRowId: (row) => {
      if (type === 'users') {
        const user = row as Partial<User>;
        return user.email || `user-${Math.random()}`;
      }
      const member = row as Partial<PopulatedTeamMember>;
      return member._id || member.userId || member.user?.email || `member-${Math.random()}`;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
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
            <div className="relative">
              <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                className="ps-9 w-full sm:w-40 md:w-64"
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
  );
};

export default UserList;

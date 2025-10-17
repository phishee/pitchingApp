'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AllUsersPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Users</h1>
          <p className="text-muted-foreground">Manage all users across the system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Users Management</h3>
              <p className="text-muted-foreground">
                View and manage all users across all organizations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

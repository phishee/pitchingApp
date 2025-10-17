'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Download } from 'lucide-react';
import AllUserList from '@/components/common/users/all-user-list';
import { useUser } from '@/providers/user.context';
import { useOrganization } from '@/providers/organization-context';

export default function AllUsersPage() {
  const { user } = useUser();
  const { currentOrganization } = useOrganization();

  // Show loading or no organization state
  if (!currentOrganization) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">All Users</h1>
            <p className="text-muted-foreground">Manage all users in your organization</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
              <p className="text-muted-foreground">
                Please select an organization to view users
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Users</h1>
          <p className="text-muted-foreground">Manage all users in {currentOrganization.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {user?.isAdmin && (
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <AllUserList 
          organizationId={currentOrganization._id} 
          currentUserRole={user?.isAdmin ? 'admin' : (user?.role || 'athlete')} 
        />
      </div>
    </div>
  );
}

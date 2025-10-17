// src/app/api/lib/controllers/user.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { USER_TYPES } from '@/app/api/lib/symbols/Symbols';
import { UserService } from '@/app/api/lib/services/user.service';
import { AuthenticatedRequest, getUserId } from '@/app/api/lib/middleware/auth.middleware';
import { isOwnResource } from '@/app/api/lib/utils/auth.utils';

@injectable()
export class UserController {
  constructor(
    @inject(USER_TYPES.UserService) private userService: UserService
  ) { }

  async createUser(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const authenticatedUserId = getUserId(req);
      
      // Ensure the user is creating their own profile or has admin privileges
      if (body.id && body.id !== authenticatedUserId) {
        return NextResponse.json({ error: 'You can only create your own user profile' }, { status: 403 });
      }
      
      // Set the user ID from the authenticated user if not provided
      if (!body.id) {
        body.id = authenticatedUserId;
      }
      
      const user = await this.userService.createUser(body);
      return NextResponse.json(user, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getUsers(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const email = searchParams.get('email');
      const organizationId = searchParams.get('organizationId');
      const role = searchParams.get('role');
      const teamId = searchParams.get('teamId');
      const search = searchParams.get('search');
      const status = searchParams.get('status');
      
      if (email) {
        // Handle search by email
        const users = await this.userService.searchUsersByEmail(email.trim());
        return NextResponse.json(users);
      }

      if (organizationId) {
        // Handle organization-based filtering
        const filters: any = {};
        if (role) filters.role = role as 'coach' | 'athlete' | 'admin';
        if (teamId) filters.teamId = teamId;
        if (search) filters.search = search;
        if (status) filters.status = status as 'active' | 'inactive';

        const users = await this.userService.getUsersWithTeamInfo(organizationId, filters);
        return NextResponse.json(users);
      }
      
      // Handle regular GET all users - only return users from the same organization
      // For now, we'll return all users, but you might want to add organization filtering
      const users = await this.userService.listUsers();
      return NextResponse.json(users);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getUserByUserId(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const authenticatedUserId = getUserId(req);
      
      // Users can only view their own profile unless they have admin privileges
      if (!isOwnResource(req, id)) {
        return NextResponse.json({ error: 'You can only view your own profile' }, { status: 403 });
      }
      
      const user = await this.userService.getUserByUserId(id);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateUser(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const body = await req.json();
      const authenticatedUserId = getUserId(req);
      
      // Users can only update their own profile unless they have admin privileges
      if (!isOwnResource(req, id)) {
        return NextResponse.json({ error: 'You can only update your own profile' }, { status: 403 });
      }
      
      // Ensure the user ID in the body matches the authenticated user
      if (body.id && body.id !== authenticatedUserId) {
        return NextResponse.json({ error: 'You can only update your own profile' }, { status: 403 });
      }
      
      const user = await this.userService.updateUser(id, body);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteUser(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const authenticatedUserId = getUserId(req);
      
      // Users can only delete their own profile unless they have admin privileges
      if (!isOwnResource(req, id)) {
        return NextResponse.json({ error: 'You can only delete your own profile' }, { status: 403 });
      }
      
      const success = await this.userService.deleteUser(id);
      if (!success) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
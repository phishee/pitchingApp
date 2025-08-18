// src/app/api/lib/controllers/user.controller.ts

import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { USER_TYPES } from '@/app/api/lib/symbols/Symbols';
import { UserService } from '@/app/api/lib/services/user.service';

@injectable()
export class UserController {
  constructor(
    @inject(USER_TYPES.UserService) private userService: UserService
  ) { }

  async createUser(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const user = await this.userService.createUser(body);
      return NextResponse.json(user, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getUsers(req: NextRequest): Promise<NextResponse> {
    try {
      const users = await this.userService.listUsers();
      return NextResponse.json(users);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async getUserByUserId(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const user = await this.userService.getUserByUserId(id);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
      const body = await req.json();
      const user = await this.userService.updateUser(id, body);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async deleteUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      const { id } = await params;
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
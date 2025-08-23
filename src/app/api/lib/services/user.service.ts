// src/app/api/v1/users/user.service.ts

import { User } from '@/models/User';
import { DBProviderFactory } from '../factories/DBFactory'; // Adjust the import path as needed
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';

@injectable()
export class UserService {
  private userRepo;
  private userCollection = 'users';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.userRepo = this.dbFactory.createDBProvider();
  }

  async listUsers(): Promise<User[]> {
    return this.userRepo.findAll(this.userCollection);
  }

  async createUser(data: Partial<User>): Promise<User> {
    // Add validation as needed
    return this.userRepo.create(this.userCollection, data);
  }

  async getUserByUserId(id: string): Promise<User | null> {
    return this.userRepo.findOne(this.userCollection, { userId: id });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return this.userRepo.update(this.userCollection, id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepo.delete(this.userCollection, id);
  }

  async searchUsersByEmail(email: string): Promise<Partial<User>[]> {
    try {
      const users = await this.userRepo.findQuery(this.userCollection, { email: { $regex: email, $options: 'i' } });
      return users;
    } catch (error) {
      console.error('Error searching users by email:', error);
      throw error;
    }
  }
}
// src/services/userApi.ts

import axios from "axios";
import { User } from "@/models/User";

const API_BASE = "/api/v1/users";

export const userApi = {
  // Get all users
  async getUsers(): Promise<User[]> {
    const res = await axios.get<User[]>(API_BASE);
    return res.data;
  },

  // Get a single user by ID
  async getUser(id: string): Promise<User> {
    const res = await axios.get<User>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Get a single user by email
  async getUserByEmail(email: string): Promise<User> {
    const res = await axios.get<User>(`${API_BASE}/email/${email}`);
    return res.data;
  },

  // Create a new user
  async createUser(data: Partial<User>): Promise<User> {
    const res = await axios.post<User>(API_BASE, data);
    return res.data;
  },

  // Search users by email
  async searchUsersByEmail(email: string): Promise<User[]> {
    const res = await axios.get<User[]>(`${API_BASE}?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  // Update a user by ID
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await axios.put<User>(`${API_BASE}/${id}`, data);
    return res.data;
  },

  // Delete a user by ID
  async deleteUser(id: string): Promise<{ message: string }> {
    const res = await axios.delete<{ message: string }>(`${API_BASE}/${id}`);
    return res.data;
  },
};
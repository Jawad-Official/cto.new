import api from './api';
import { AuthResponse, LoginData, RegisterData, User } from '../types';
import { storage } from './storage';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    storage.setToken(response.data.token);
    storage.setUser(response.data.user);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    storage.setToken(response.data.token);
    storage.setUser(response.data.user);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    storage.setUser(response.data.user);
    return response.data.user;
  },

  logout(): void {
    storage.clear();
  },
};

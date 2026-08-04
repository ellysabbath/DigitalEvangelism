// src/api/services/auth.service.ts
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { LoginRequest, RegisterRequest, VerifyRequest, AuthResponse, User } from '../../types/data';

export const authService = {
  async login(data: LoginRequest) {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, data);
  },

  async register(data: RegisterRequest) {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
  },

  async verify(data: VerifyRequest) {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.verify, data);
  },

  async logout() {
    return apiClient.post(API_ENDPOINTS.auth.logout);
  },

  async getCurrentUser() {
    return apiClient.get<User>(API_ENDPOINTS.auth.me);
  },
};
// src/services/userDataApi.ts
import axios from 'axios';
import type {
  User,
  UserCreateData,
  UserUpdateData,
  Profile,
  ProfileCreateData,
  ProfileUpdateData,
  VerificationLog,
  VerificationLogCreateData,
  UserSession,
  UserSessionCreateData,
  AuthLog,
  AuthLogCreateData,
  DashboardStats,
  UserListResponse,
  UserFilterOptions,
  UserStats,
} from '../types/userData';

// ============================================
// API CLIENT CONFIGURATION
// ============================================
const API_URL = import.meta.env.VITE_API_URL || 'https://hopeprojects.pythonanywhere.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// USER API
// ============================================
export const userApi = {
  /**
   * Get list of users with optional filters and pagination
   */
  getUsers: async (params?: Record<string, any>): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>('/auth/crud/users/', { params });
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  getUser: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/auth/crud/users/${id}/`);
    return response.data;
  },

  /**
   * Create a new user
   */
  createUser: async (data: UserCreateData): Promise<User> => {
    const response = await api.post<User>('/auth/crud/users/', data);
    return response.data;
  },

  /**
   * Update an existing user
   */
  updateUser: async (id: number, data: UserUpdateData): Promise<User> => {
    // Clean data - remove undefined values
    const cleanData: any = {};
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof UserUpdateData];
      if (value !== undefined && value !== null) {
        cleanData[key] = value;
      }
    });
    // Remove empty password
    if (cleanData.password === '') {
      delete cleanData.password;
    }
    const response = await api.patch<User>(`/auth/crud/users/${id}/`, cleanData);
    return response.data;
  },

  /**
   * Soft delete a user
   */
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/auth/crud/users/${id}/`);
    return response.data;
  },

  /**
   * Hard delete a user (permanently remove)
   */
  hardDeleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/auth/crud/users/${id}/hard-delete/`);
    return response.data;
  },

  /**
   * Activate a user account
   */
  activateUser: async (id: number): Promise<{ message: string; user: User }> => {
    const response = await api.post<{ message: string; user: User }>(
      `/auth/crud/users/${id}/activate/`
    );
    return response.data;
  },

  /**
   * Deactivate a user account
   */
  deactivateUser: async (id: number): Promise<{ message: string; user: User }> => {
    const response = await api.post<{ message: string; user: User }>(
      `/auth/crud/users/${id}/deactivate/`
    );
    return response.data;
  },

  /**
   * Bulk soft delete users
   */
  bulkDeleteUsers: async (userIds: number[]): Promise<{ message: string; deleted_count: number }> => {
    const response = await api.delete<{ message: string; deleted_count: number }>(
      '/auth/crud/users/bulk/delete/',
      { data: { user_ids: userIds } }
    );
    return response.data;
  },

  /**
   * Bulk hard delete users
   */
  bulkHardDeleteUsers: async (userIds: number[]): Promise<{ message: string; deleted_count: number }> => {
    const response = await api.delete<{ message: string; deleted_count: number }>(
      '/auth/crud/users/bulk/hard-delete/',
      { data: { user_ids: userIds } }
    );
    return response.data;
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>('/auth/crud/stats/');
    return response.data;
  },

  /**
   * Get filter options for users
   */
  getFilterOptions: async (): Promise<UserFilterOptions> => {
    try {
      const response = await api.get<UserFilterOptions>('/auth/crud/filter-options/');
      return response.data;
    } catch {
      // Return default filter options if endpoint doesn't exist
      return {
        roles: ['evangelist', 'pastor', 'church_admin', 'super_admin', 'admin', 'student'],
        regions: [],
        cities: [],
        churches: [],
        filters: {
          is_verified: [true, false],
          is_active: [true, false],
          is_online: [true, false],
        },
      };
    }
  },

  /**
   * Update user role
   */
  updateUserRole: async (id: number, role: string): Promise<User> => {
    const response = await api.patch<User>(`/auth/crud/users/${id}/`, { role });
    return response.data;
  },
};

// ============================================
// PROFILE API
// ============================================
export const profileApi = {
  /**
   * Get list of profiles with optional filters
   */
  getProfiles: async (params?: Record<string, any>): Promise<Profile[]> => {
    const response = await api.get<Profile[]>('/auth/profiles/', { params });
    return response.data;
  },

  /**
   * Get a single profile by ID
   */
  getProfile: async (id: number): Promise<Profile> => {
    const response = await api.get<Profile>(`/auth/profiles/${id}/`);
    return response.data;
  },

  /**
   * Get profile by user ID
   */
  getProfileByUser: async (userId: number): Promise<Profile> => {
    const response = await api.get<Profile>(`/auth/profiles/by-user/${userId}/`);
    return response.data;
  },

  /**
   * Create a new profile
   */
  createProfile: async (data: ProfileCreateData): Promise<Profile> => {
    const response = await api.post<Profile>('/auth/profiles/', data);
    return response.data;
  },

  /**
   * Update an existing profile
   */
  updateProfile: async (id: number, data: ProfileUpdateData): Promise<Profile> => {
    const response = await api.patch<Profile>(`/auth/profiles/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a profile
   */
  deleteProfile: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/auth/profiles/${id}/`);
    return response.data;
  },
};

// ============================================
// VERIFICATION LOG API
// ============================================
export const verificationApi = {
  /**
   * Get list of verification logs with optional filters
   */
  getVerifications: async (params?: Record<string, any>): Promise<VerificationLog[]> => {
    const response = await api.get<VerificationLog[]>('/auth/verifications/', { params });
    return response.data;
  },

  /**
   * Get a single verification log by ID
   */
  getVerification: async (id: number): Promise<VerificationLog> => {
    const response = await api.get<VerificationLog>(`/auth/verifications/${id}/`);
    return response.data;
  },

  /**
   * Get verification logs by user ID
   */
  getVerificationsByUser: async (userId: number): Promise<VerificationLog[]> => {
    const response = await api.get<VerificationLog[]>(`/auth/verifications/by-user/${userId}/`);
    return response.data;
  },

  /**
   * Create a new verification log
   */
  createVerification: async (data: VerificationLogCreateData): Promise<VerificationLog> => {
    const response = await api.post<VerificationLog>('/auth/verifications/', data);
    return response.data;
  },

  /**
   * Mark a verification as used
   */
  markUsed: async (id: number): Promise<VerificationLog> => {
    const response = await api.post<VerificationLog>(`/auth/verifications/${id}/mark-used/`);
    return response.data;
  },

  /**
   * Mark a verification as expired
   */
  markExpired: async (id: number): Promise<VerificationLog> => {
    const response = await api.post<VerificationLog>(`/auth/verifications/${id}/mark-expired/`);
    return response.data;
  },

  /**
   * Delete a verification log
   */
  deleteVerification: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/auth/verifications/${id}/`);
    return response.data;
  },
};

// ============================================
// SESSION API
// ============================================
export const sessionApi = {
  /**
   * Get list of user sessions with optional filters
   */
  getSessions: async (params?: Record<string, any>): Promise<UserSession[]> => {
    const response = await api.get<UserSession[]>('/auth/sessions/', { params });
    return response.data;
  },

  /**
   * Get a single session by ID
   */
  getSession: async (id: number): Promise<UserSession> => {
    const response = await api.get<UserSession>(`/auth/sessions/${id}/`);
    return response.data;
  },

  /**
   * Get sessions by user ID
   */
  getSessionsByUser: async (userId: number): Promise<UserSession[]> => {
    const response = await api.get<UserSession[]>(`/auth/sessions/by-user/${userId}/`);
    return response.data;
  },

  /**
   * Create a new session
   */
  createSession: async (data: UserSessionCreateData): Promise<UserSession> => {
    const response = await api.post<UserSession>('/auth/sessions/', data);
    return response.data;
  },

  /**
   * End a session
   */
  endSession: async (id: number): Promise<UserSession> => {
    const response = await api.post<UserSession>(`/auth/sessions/${id}/end/`);
    return response.data;
  },

  /**
   * End all sessions for a user
   */
  endAllSessions: async (userId: number): Promise<{ message: string; ended_count: number }> => {
    const response = await api.post<{ message: string; ended_count: number }>(
      `/auth/sessions/by-user/${userId}/end-all/`
    );
    return response.data;
  },

  /**
   * Delete a session
   */
  deleteSession: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/auth/sessions/${id}/`);
    return response.data;
  },
};

// ============================================
// AUTH LOG API
// ============================================
export const authLogApi = {
  /**
   * Get list of auth logs with optional filters
   */
  getAuthLogs: async (params?: Record<string, any>): Promise<AuthLog[]> => {
    const response = await api.get<AuthLog[]>('/auth/auth-logs/', { params });
    return response.data;
  },

  /**
   * Get a single auth log by ID
   */
  getAuthLog: async (id: number): Promise<AuthLog> => {
    const response = await api.get<AuthLog>(`/auth/auth-logs/${id}/`);
    return response.data;
  },

  /**
   * Get auth logs by user ID
   */
  getAuthLogsByUser: async (userId: number): Promise<AuthLog[]> => {
    const response = await api.get<AuthLog[]>(`/auth/auth-logs/by-user/${userId}/`);
    return response.data;
  },

  /**
   * Create a new auth log
   */
  createAuthLog: async (data: AuthLogCreateData): Promise<AuthLog> => {
    const response = await api.post<AuthLog>('/auth/auth-logs/', data);
    return response.data;
  },

  /**
   * Get auth log statistics
   */
  getAuthLogStats: async (): Promise<any> => {
    const response = await api.get('/auth/auth-logs/stats/');
    return response.data;
  },

  /**
   * Delete an auth log
   */
  deleteAuthLog: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/auth/auth-logs/${id}/`);
    return response.data;
  },
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/auth/dashboard/stats/');
    return response.data;
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit: number = 10): Promise<any> => {
    const response = await api.get('/auth/dashboard/recent-activity/', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get user growth data
   */
  getUserGrowth: async (days: number = 30): Promise<any> => {
    const response = await api.get('/auth/dashboard/user-growth/', {
      params: { days },
    });
    return response.data;
  },
};

// ============================================
// UNIFIED EXPORT FOR USER DATA CONTEXT
// ============================================

/**
 * Unified API object that matches what UserDataContext expects
 * This combines all the individual APIs into a single object
 */
export const userDataApi = {
  // User methods
  list: userApi.getUsers,
  get: userApi.getUser,
  create: userApi.createUser,
  update: userApi.updateUser,
  delete: userApi.deleteUser,
  hardDelete: userApi.hardDeleteUser,
  activate: userApi.activateUser,
  deactivate: userApi.deactivateUser,
  updateRole: userApi.updateUserRole,
  bulkDelete: userApi.bulkDeleteUsers,
  bulkHardDelete: userApi.bulkHardDeleteUsers,
  
  // Stats and filter options
  getStats: userApi.getUserStats,
  getFilterOptions: userApi.getFilterOptions,
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default userDataApi;
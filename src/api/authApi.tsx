import apiClient from './apiClient';

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  tokens?: {
    access: string;
    refresh: string;
  };
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: 'admin' | 'instructor' | 'student';
    role_display: string;
    is_admin: boolean;
    is_instructor: boolean;
    is_student: boolean;
    is_verified: boolean;
    has_profile_picture: boolean;
    profile_picture?: string;
    profile_picture_preview?: string;
    phone_number?: string;
    whatsapp_number?: string;
    country?: string;
    region?: string;
    city?: string;
    top_education_level?: string;
    interests?: string[];
    last_login?: string;
    registration_date?: string;
  };
  errors?: Record<string, string[]>;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: 'admin' | 'instructor' | 'student';
    role_display: string;
    is_admin: boolean;
    is_instructor: boolean;
    is_student: boolean;
    is_verified: boolean;
    has_profile_picture: boolean;
    profile_picture?: string;
    phone_number?: string;
    country?: string;
    region?: string;
    city?: string;
  };
}

const authApi = {
  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log('Login attempt:', email);
      
      const response = await apiClient.post('/registration/login', {
        email: email.toLowerCase(),
        password: password,
      });
      
      if (response.data.success && response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.error || 'Login failed. Please try again.',
        errors: error.errors,
      };
    }
  },

  /**
   * Logout user - clear tokens and blacklist refresh token
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await apiClient.post('/registration/logout', {
          refresh_token: refreshToken,
        });
      }
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return {
        success: false,
        error: error.error || 'Logout failed',
      };
    }
  },

  /**
   * Check if user is authenticated and get user data
   */
  checkAuth: async (): Promise<AuthCheckResponse> => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        return { authenticated: false };
      }
      
      const response = await apiClient.get('/registration/check-auth', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.data.authenticated && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return {
          authenticated: true,
          user: response.data.user,
        };
      }
      
      return { authenticated: false };
    } catch (error) {
      console.error('Auth check error:', error);
      return { authenticated: false };
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: (): LoginResponse['user'] | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get user role
   */
  getUserRole: (): 'admin' | 'instructor' | 'student' | null => {
    const user = authApi.getCurrentUser();
    return user?.role || null;
  },

  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    const user = authApi.getCurrentUser();
    return user?.is_admin || false;
  },

  /**
   * Check if user is instructor
   */
  isInstructor: (): boolean => {
    const user = authApi.getCurrentUser();
    return user?.is_instructor || false;
  },

  /**
   * Check if user is student
   */
  isStudent: (): boolean => {
    const user = authApi.getCurrentUser();
    return user?.is_student || true;
  },

  /**
   * Check if user has specific role
   */
  hasRole: (role: 'admin' | 'instructor' | 'student'): boolean => {
    const userRole = authApi.getUserRole();
    return userRole === role;
  },

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole: (roles: ('admin' | 'instructor' | 'student')[]): boolean => {
    const userRole = authApi.getUserRole();
    return userRole !== null && roles.includes(userRole);
  },

  /**
   * Get role display name
   */
  getRoleDisplay: (): string | null => {
    const user = authApi.getCurrentUser();
    return user?.role_display || null;
  },

  /**
   * Update user data in localStorage
   */
  updateUser: (userData: Partial<LoginResponse['user']>): void => {
    const currentUser = authApi.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  },

  /**
   * Get access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Clear all auth data
   */
  clearAuth: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

export default authApi;
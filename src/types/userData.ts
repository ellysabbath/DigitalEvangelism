// src/types/userData.ts

// ============================================
// USER TYPES
// ============================================
export interface User {
  id: number;
  phone_number: string;
  email: string | null;
  full_name: string;
  role: 'evangelist' | 'pastor' | 'church_admin' | 'super_admin' | 'admin' | 'student';
  role_display: string;
  church_name: string;
  region: string;
  city: string;
  street: string;
  country_code: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_online: boolean;
  date_joined: string;
  last_login: string | null;
  last_seen: string | null;
  full_phone_number: string;
  profile?: Profile;
}

export interface UserCreateData {
  phone_number: string;
  email?: string;
  full_name?: string;
  role: string;
  password: string;
  church_name?: string;
  region?: string;
  city?: string;
  street?: string;
  country_code?: string;
  is_verified?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface UserUpdateData {
  phone_number?: string;
  email?: string;
  full_name?: string;
  role?: string;
  church_name?: string;
  region?: string;
  city?: string;
  street?: string;
  country_code?: string;
  is_verified?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

// ============================================
// PROFILE TYPES
// ============================================
export interface Profile {
  id: number;
  user: number;
  user_phone: string;
  user_name: string;
  profile_picture: string | null;
  profile_picture_thumbnail: string | null;
  bio: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileCreateData {
  user: number;
  profile_picture?: string;
  profile_picture_thumbnail?: string;
  bio?: string;
  location?: string;
}

export interface ProfileUpdateData {
  profile_picture?: string;
  profile_picture_thumbnail?: string;
  bio?: string;
  location?: string;
}

// ============================================
// VERIFICATION LOG TYPES
// ============================================
export interface VerificationLog {
  id: number;
  user: number;
  user_phone: string;
  user_name: string;
  verification_code: string;
  phone_number: string;
  is_used: boolean;
  is_expired: boolean;
  is_valid: boolean;
  expires_at: string;
  created_at: string;
  used_at: string | null;
}

export interface VerificationLogCreateData {
  user: number;
  verification_code: string;
  phone_number: string;
  expires_at?: string;
}

// ============================================
// USER SESSION TYPES
// ============================================
export interface UserSession {
  id: number;
  user: number;
  user_phone: string;
  user_name: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
}

export interface UserSessionCreateData {
  user: number;
  device_info?: string;
  ip_address?: string;
}

// ============================================
// AUTH LOG TYPES
// ============================================
export interface AuthLog {
  id: number;
  user: number | null;
  user_phone: string | null;
  user_name: string | null;
  phone_number: string;
  action: string;
  action_display: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  created_at: string;
}

export interface AuthLogCreateData {
  user?: number;
  phone_number: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
}

// ============================================
// DASHBOARD STATS TYPES
// ============================================
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    verified: number;
    online: number;
    inactive: number;
    unverified: number;
    role_stats: Record<string, number>;
  };
  profiles: {
    total: number;
    with_picture: number;
    without_picture: number;
  };
  sessions: {
    active: number;
    total: number;
    inactive: number;
  };
  auth_logs: {
    total: number;
    recent_24h: number;
  };
  verifications: {
    total: number;
    used: number;
    expired: number;
    pending: number;
  };
}

// ============================================
// FILTERS AND API RESPONSE TYPES
// ============================================

/**
 * User filter options for dropdowns and filters
 */
export interface UserFilterOptions {
  roles: string[];
  regions: string[];
  cities: string[];
  churches: string[];
  filters?: {
    is_verified: boolean[];
    is_active: boolean[];
    is_online: boolean[];
  };
}

/**
 * User statistics summary
 */
export interface UserStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  online_users: number;
  role_stats: {
    evangelist: number;
    pastor: number;
    church_admin: number;
    super_admin: number;
    admin: number;
    student?: number;
  };
  inactive_users: number;
  unverified_users: number;
}

/**
 * User filters for querying users
 */
export interface UserFilters {
  search?: string;
  role?: string;
  region?: string;
  city?: string;
  church_name?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_online?: boolean;
  date_joined_start?: string;
  date_joined_end?: string;
  last_login_start?: string;
  last_login_end?: string;
}

/**
 * Paginated list response for users
 */
export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T;
  message?: string;
  status?: string;
  status_code?: number;
  success?: boolean;
  errors?: string[] | Record<string, string[]>;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// ============================================
// EXPORT ALL TYPES
// ============================================
export type {
  User as UserType,
  UserCreateData as UserCreateDataType,
  UserUpdateData as UserUpdateDataType,
  Profile as ProfileType,
  ProfileCreateData as ProfileCreateDataType,
  ProfileUpdateData as ProfileUpdateDataType,
  VerificationLog as VerificationLogType,
  VerificationLogCreateData as VerificationLogCreateDataType,
  UserSession as UserSessionType,
  UserSessionCreateData as UserSessionCreateDataType,
  AuthLog as AuthLogType,
  AuthLogCreateData as AuthLogCreateDataType,
  DashboardStats as DashboardStatsType,
  UserFilterOptions as UserFilterOptionsType,
  UserStats as UserStatsType,
  UserFilters as UserFiltersType,
  UserListResponse as UserListResponseType,
  ApiResponse as ApiResponseType,
};
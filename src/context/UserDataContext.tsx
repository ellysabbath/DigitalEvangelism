// src/context/UserDataContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { userDataApi } from '../services/userDataApi';
import type {
  User,
  UserCreateData,
  UserUpdateData,
  UserFilters,
  UserStats,
  UserFilterOptions,
} from '../types/userData';

// ============================================
// TYPES
// ============================================
interface UserDataContextType {
  // State
  users: User[];
  loading: boolean;
  error: string | null;
  stats: UserStats | null;
  filterOptions: UserFilterOptions | null;
  filters: UserFilters;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  
  // CRUD Operations
  createUser: (data: UserCreateData) => Promise<User>;
  updateUser: (id: number, data: UserUpdateData) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  hardDeleteUser: (id: number) => Promise<void>;
  activateUser: (id: number) => Promise<void>;
  deactivateUser: (id: number) => Promise<void>;
  updateUserRole: (id: number, role: string) => Promise<void>;
  bulkDeleteUsers: (ids: number[]) => Promise<void>;
  bulkHardDeleteUsers: (ids: number[]) => Promise<void>;
  
  // Filter Operations
  setFilters: (filters: UserFilters) => void;
  clearFilters: () => void;
  applyFilter: (key: keyof UserFilters, value: any) => void;
  removeFilter: (key: keyof UserFilters) => void;
  
  // Refresh Operations
  refreshUsers: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshFilterOptions: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Pagination
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  
  // Helper Functions
  getStatusBadge: (user: User) => { label: string; className: string; icon: React.ReactElement | null };
  getRoleBadge: (role: string) => { label: string; className: string };
  getFullName: (user: User) => string;
  getFullPhone: (user: User) => string;
}

// ============================================
// CONTEXT CREATION
// ============================================
const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

// ============================================
// PROVIDER PROPS
// ============================================
interface UserDataProviderProps {
  children: React.ReactNode;
  initialPageSize?: number;
}

// ============================================
// PROVIDER COMPONENT
// ============================================
export const UserDataProvider: React.FC<UserDataProviderProps> = ({ 
  children, 
  initialPageSize = 20 
}) => {
  // ============================================
  // STATE
  // ============================================
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [filterOptions, setFilterOptions] = useState<UserFilterOptions | null>(null);
  const [filters, setFiltersState] = useState<UserFilters>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  /**
   * Get status badge configuration for a user
   */
  const getStatusBadge = useCallback((user: User): { 
    label: string; 
    className: string; 
    icon: React.ReactElement | null 
  } => {
    if (!user.is_active) {
      return {
        label: 'Inactive',
        className: 'bg-gray-100 text-gray-700',
        icon: React.createElement('span', {
          className: 'w-2 h-2 bg-gray-400 rounded-full mr-1.5'
        })
      };
    }
    if (user.is_verified) {
      return {
        label: 'Verified',
        className: 'bg-green-100 text-green-700',
        icon: React.createElement('span', {
          className: 'w-2 h-2 bg-green-500 rounded-full mr-1.5'
        })
      };
    }
    return {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-700',
      icon: React.createElement('span', {
        className: 'w-2 h-2 bg-yellow-500 rounded-full mr-1.5'
      })
    };
  }, []);

  /**
   * Get role badge configuration
   */
  const getRoleBadge = useCallback((role: string): { 
    label: string; 
    className: string 
  } => {
    const roleMap: Record<string, { label: string; className: string }> = {
      evangelist: { label: 'Evangelist', className: 'bg-blue-100 text-blue-700' },
      pastor: { label: 'Pastor', className: 'bg-purple-100 text-purple-700' },
      church_admin: { label: 'Church Admin', className: 'bg-indigo-100 text-indigo-700' },
      super_admin: { label: 'Super Admin', className: 'bg-red-100 text-red-700' },
      admin: { label: 'Admin', className: 'bg-cyan-100 text-cyan-700' },
      student: { label: 'Student', className: 'bg-green-100 text-green-700' },
    };
    return roleMap[role] || { label: role || 'User', className: 'bg-gray-100 text-gray-700' };
  }, []);

  /**
   * Get full name from user object
   */
  const getFullName = useCallback((user: User): string => {
    return user.full_name || user.phone_number || 'Unknown';
  }, []);

  /**
   * Get full phone number from user object
   */
  const getFullPhone = useCallback((user: User): string => {
    return user.full_phone_number || user.phone_number || '';
  }, []);

  // ============================================
  // DATA FETCHING FUNCTIONS
  // ============================================
  
  /**
   * Fetch users with current filters and pagination
   */
  const fetchUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Build filters object
      const apiFilters: Record<string, any> = { ...filters };
      
      // Remove undefined, null, or empty values
      Object.keys(apiFilters).forEach(key => {
        const value = apiFilters[key];
        if (value === undefined || value === null || value === '') {
          delete apiFilters[key];
        }
      });
      
      // Add pagination parameters
      apiFilters.page = currentPage;
      apiFilters.page_size = pageSize;
      
      console.log('🔍 Fetching users with filters:', apiFilters);
      
      const response = await userDataApi.list(apiFilters);
      
      console.log('📦 API Response:', response);
      
      if (response && response.results) {
        setUsers(response.results);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / pageSize));
        console.log(`✅ Loaded ${response.results.length} users`);
      } else {
        setUsers([]);
        setTotalCount(0);
        setTotalPages(1);
        console.warn('⚠️ No results in response');
      }
    } catch (err: any) {
      console.error('❌ Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  /**
   * Fetch user statistics
   */
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const data = await userDataApi.getStats();
      console.log('📊 Stats response:', data);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  /**
   * Fetch filter options
   */
  const fetchFilterOptions = useCallback(async (): Promise<void> => {
    try {
      const data = await userDataApi.getFilterOptions();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
      // Set default filter options if API fails
      setFilterOptions({
        roles: ['evangelist', 'pastor', 'church_admin', 'super_admin', 'admin', 'student'],
        regions: [],
        cities: [],
        churches: []
      });
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async (): Promise<void> => {
    console.log('🔄 Refreshing all data...');
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchStats(),
        fetchFilterOptions(),
      ]);
      console.log('✅ Refresh complete');
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchStats, fetchFilterOptions]);

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  
  /**
   * Create a new user
   */
  const createUser = useCallback(async (data: UserCreateData): Promise<User> => {
    try {
      const user = await userDataApi.create(data);
      await refreshAll();
      return user;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }, [refreshAll]);

  /**
   * Update an existing user
   */
  const updateUser = useCallback(async (id: number, data: UserUpdateData): Promise<User> => {
    try {
      const user = await userDataApi.update(id, data);
      await refreshAll();
      return user;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }, [refreshAll]);

  /**
   * Soft delete a user
   */
  const deleteUser = useCallback(async (id: number): Promise<void> => {
    try {
      await userDataApi.delete(id);
      await refreshAll();
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }, [refreshAll]);

  /**
   * Hard delete a user (permanent)
   */
  const hardDeleteUser = useCallback(async (id: number): Promise<void> => {
    try {
      await userDataApi.hardDelete(id);
      await refreshAll();
    } catch (error) {
      console.error('Hard delete user error:', error);
      throw error;
    }
  }, [refreshAll]);

  /**
   * Activate a user
   */
  const activateUser = useCallback(async (id: number): Promise<void> => {
    try {
      await userDataApi.activate(id);
      await refreshAll();
    } catch (error) {
      console.error('Activate user error:', error);
      throw error;
    }
  }, [refreshAll]);

  /**
   * Deactivate a user
   */
  const deactivateUser = useCallback(async (id: number): Promise<void> => {
    try {
      await userDataApi.deactivate(id);
      await refreshAll();
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  }, [refreshAll]);

  /**
   * Update user role
   */
  const updateUserRole = useCallback(async (id: number, role: string): Promise<void> => {
    try {
      await userDataApi.updateRole(id, role);
      await refreshAll();
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }, [refreshAll]);

  /**
   * Bulk delete users
   */
  const bulkDeleteUsers = useCallback(async (ids: number[]): Promise<void> => {
    if (ids.length === 0) {
      console.warn('No users selected for deletion');
      return;
    }
    try {
      await userDataApi.bulkDelete(ids);
      await refreshAll();
    } catch (error) {
      console.error('Bulk delete users error:', error);
      throw error;
    }
  }, [refreshAll]);

  /**
   * Bulk hard delete users
   */
  const bulkHardDeleteUsers = useCallback(async (ids: number[]): Promise<void> => {
    if (ids.length === 0) {
      console.warn('No users selected for hard deletion');
      return;
    }
    try {
      await userDataApi.bulkHardDelete(ids);
      await refreshAll();
    } catch (error) {
      console.error('Bulk hard delete users error:', error);
      throw error;
    }
  }, [refreshAll]);

  // ============================================
  // FILTER FUNCTIONS
  // ============================================
  
  /**
   * Set filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: UserFilters): void => {
    setFiltersState(newFilters);
    setCurrentPage(1);
  }, []);

  /**
   * Clear all filters and reset to page 1
   */
  const clearFilters = useCallback((): void => {
    setFiltersState({});
    setCurrentPage(1);
  }, []);

  /**
   * Apply a single filter
   */
  const applyFilter = useCallback((key: keyof UserFilters, value: any): void => {
    setFiltersState((prev: UserFilters) => {
      const newFilters = { ...prev, [key]: value };
      
      // Remove undefined, null, or empty values
      Object.keys(newFilters).forEach(k => {
        const keyName = k as keyof UserFilters;
        const val = newFilters[keyName];
        if (val === undefined || val === null || val === '') {
          delete newFilters[keyName];
        }
      });
      
      return newFilters;
    });
    setCurrentPage(1);
  }, []);

  /**
   * Remove a single filter
   */
  const removeFilter = useCallback((key: keyof UserFilters): void => {
    setFiltersState((prev: UserFilters) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setCurrentPage(1);
  }, []);

  // ============================================
  // PAGINATION FUNCTIONS
  // ============================================
  
  /**
   * Go to a specific page
   */
  const goToPage = useCallback((page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  /**
   * Go to next page
   */
  const nextPage = useCallback((): void => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback((): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  /**
   * Set page size and reset to page 1
   */
  const handleSetPageSize = useCallback((size: number): void => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================
  
  // Initial load
  useEffect(() => {
    console.log('🚀 UserDataProvider mounted, fetching initial data...');
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch users when filters, page, or pageSize change
  useEffect(() => {
    console.log('📡 Filters/page/pageSize changed, fetching users...');
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, pageSize]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = useMemo<UserDataContextType>(() => ({
    // State
    users,
    loading,
    error,
    stats,
    filterOptions,
    filters,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    
    // CRUD Operations
    createUser,
    updateUser,
    deleteUser,
    hardDeleteUser,
    activateUser,
    deactivateUser,
    updateUserRole,
    bulkDeleteUsers,
    bulkHardDeleteUsers,
    
    // Filter Operations
    setFilters,
    clearFilters,
    applyFilter,
    removeFilter,
    
    // Refresh Operations
    refreshUsers: fetchUsers,
    refreshStats: fetchStats,
    refreshFilterOptions: fetchFilterOptions,
    refreshAll,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handleSetPageSize,
    
    // Helper Functions
    getStatusBadge,
    getRoleBadge,
    getFullName,
    getFullPhone,
  }), [
    users,
    loading,
    error,
    stats,
    filterOptions,
    filters,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    createUser,
    updateUser,
    deleteUser,
    hardDeleteUser,
    activateUser,
    deactivateUser,
    updateUserRole,
    bulkDeleteUsers,
    bulkHardDeleteUsers,
    setFilters,
    clearFilters,
    applyFilter,
    removeFilter,
    fetchUsers,
    fetchStats,
    fetchFilterOptions,
    refreshAll,
    goToPage,
    nextPage,
    prevPage,
    handleSetPageSize,
    getStatusBadge,
    getRoleBadge,
    getFullName,
    getFullPhone,
  ]);

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default UserDataProvider;
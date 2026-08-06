// src/pages/admin/UserManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaUsers, 
  FaUserCircle, 
  FaKey, 
  FaClock, 
  FaHistory,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSync,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaTimesCircle,
  FaDatabase,
  FaChartBar,
  FaImage,
  FaUpload
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { 
  userApi, 
  profileApi, 
  verificationApi, 
  sessionApi, 
  authLogApi,
  dashboardApi 
} from '../../services/userDataApi';
import type { 
  User, 
  Profile, 
  VerificationLog, 
  UserSession, 
  AuthLog,
  DashboardStats 
} from '../../types/userData';

// ============================================
// PROFILE IMAGE COMPONENT
// ============================================
const ProfileImage: React.FC<{ 
  base64Image: string | null; 
  size?: 'small' | 'medium' | 'large';
  fallback?: string;
}> = ({ base64Image, size = 'medium', fallback }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  const getInitials = () => {
    if (fallback) {
      const parts = fallback.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return fallback[0]?.toUpperCase() || 'U';
    }
    return 'U';
  };

  if (base64Image && !imageError) {
    try {
      const imageSrc = base64Image.startsWith('data:image') 
        ? base64Image 
        : `data:image/jpeg;base64,${base64Image}`;
      
      return (
        <img
          src={imageSrc}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-cyan-200`}
          onError={() => setImageError(true)}
        />
      );
    } catch (error) {
      // Fall through to default
    }
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm`}>
      {getInitials()}
    </div>
  );
};

// ============================================
// IMAGE UPLOAD COMPONENT
// ============================================
const ImageUpload: React.FC<{
  onImageSelect: (base64: string) => void;
  currentImage?: string | null;
  label?: string;
}> = ({ onImageSelect, currentImage, label = 'Upload Image' }) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      onImageSelect(base64);
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read image');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-cyan-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <FaImage className="text-gray-400 text-2xl" />
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <FaSpinner className="animate-spin text-white text-2xl" />
          </div>
        )}
      </div>
      <div>
        <label className="cursor-pointer">
          <div className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors flex items-center space-x-2">
            <FaUpload />
            <span>{label}</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {currentImage && (
          <button
            onClick={() => {
              setPreview(null);
              onImageSelect('');
            }}
            className="ml-2 text-sm text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
        <p className="text-xs text-gray-400 mt-1">Max 5MB, JPG/PNG/GIF/WEBP</p>
      </div>
    </div>
  );
};

// ============================================
// MAIN ADMIN PANEL
// ============================================
const AdminPanel: React.FC = () => {
  // ============================================
  // STATE
  // ============================================
  const [activeTab, setActiveTab] = useState<'users' | 'profiles' | 'verifications' | 'sessions' | 'authlogs' | 'dashboard'>('dashboard');
  
  // Loading states
  const [loading, setLoading] = useState({
    users: false,
    profiles: false,
    verifications: false,
    sessions: false,
    authlogs: false,
    dashboard: false
  });
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [verifications, setVerifications] = useState<VerificationLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  
  // Selection states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
  const [modalData, setModalData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state for user add/edit
  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    full_name: '',
    role: 'student',
    church_name: '',
    region: '',
    city: '',
    street: '',
    country_code: '+255',
    is_active: true,
    is_verified: false,
    is_staff: false,
    is_superuser: false,
    password: '',
    profile_picture: '',
    bio: '',
    location: ''
  });

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const data = await userApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(prev => ({ ...prev, profiles: true }));
    try {
      const data = await profileApi.getProfiles();
      setProfiles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast.error(error?.message || 'Failed to fetch profiles');
      setProfiles([]);
    } finally {
      setLoading(prev => ({ ...prev, profiles: false }));
    }
  }, []);

  const fetchVerifications = useCallback(async () => {
    setLoading(prev => ({ ...prev, verifications: true }));
    try {
      const data = await verificationApi.getVerifications();
      setVerifications(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching verifications:', error);
      toast.error(error?.message || 'Failed to fetch verifications');
      setVerifications([]);
    } finally {
      setLoading(prev => ({ ...prev, verifications: false }));
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoading(prev => ({ ...prev, sessions: true }));
    try {
      const data = await sessionApi.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast.error(error?.message || 'Failed to fetch sessions');
      setSessions([]);
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  }, []);

  const fetchAuthLogs = useCallback(async () => {
    setLoading(prev => ({ ...prev, authlogs: true }));
    try {
      const data = await authLogApi.getAuthLogs();
      setAuthLogs(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching auth logs:', error);
      toast.error(error?.message || 'Failed to fetch auth logs');
      setAuthLogs([]);
    } finally {
      setLoading(prev => ({ ...prev, authlogs: false }));
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    try {
      const data = await dashboardApi.getStats();
      setDashboardStats(data);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(error?.message || 'Failed to fetch dashboard stats');
      setDashboardStats(null);
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, []);

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  
  // CREATE USER
  const handleCreateUser = async () => {
    if (!formData.phone_number) {
      toast.error('Phone number is required');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsProcessing(true);
    try {
      const userData = {
        phone_number: formData.phone_number,
        email: formData.email || undefined,
        full_name: formData.full_name || undefined,
        role: formData.role,
        church_name: formData.church_name || undefined,
        region: formData.region || undefined,
        city: formData.city || undefined,
        street: formData.street || undefined,
        country_code: formData.country_code,
        is_active: formData.is_active,
        is_verified: formData.is_verified,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
        password: formData.password,
      };

      console.log('Creating user with data:', userData);
      const newUser = await userApi.createUser(userData);
      console.log('User created:', newUser);
      
      toast.success(`User ${newUser.full_name || newUser.phone_number} created successfully`);

      if (formData.profile_picture || formData.bio || formData.location) {
        try {
          const profileData = {
            user: newUser.id,
            profile_picture: formData.profile_picture || undefined,
            bio: formData.bio || undefined,
            location: formData.location || undefined,
          };
          await profileApi.createProfile(profileData);
          console.log('Profile created for user:', newUser.id);
        } catch (profileError: any) {
          console.error('Profile creation error:', profileError);
          toast.error('User created but profile creation failed');
        }
      }

      resetForm();
      setShowModal(false);
      await Promise.all([
        fetchUsers(),
        fetchProfiles(),
        fetchDashboard()
      ]);
      
    } catch (error: any) {
      console.error('Create user error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to create user';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // READ - View User
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setModalType('view');
    setModalData(user);
    setShowModal(true);
  };

  // UPDATE USER
  const handleUpdateUser = async () => {
    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }
    if (!formData.phone_number) {
      toast.error('Phone number is required');
      return;
    }

    setIsProcessing(true);
    try {
      const userData: any = {
        phone_number: formData.phone_number,
        email: formData.email || undefined,
        full_name: formData.full_name || undefined,
        role: formData.role,
        church_name: formData.church_name || undefined,
        region: formData.region || undefined,
        city: formData.city || undefined,
        street: formData.street || undefined,
        country_code: formData.country_code,
        is_active: formData.is_active,
        is_verified: formData.is_verified,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      console.log('Updating user:', selectedUser.id, userData);
      const updatedUser = await userApi.updateUser(selectedUser.id, userData);
      console.log('User updated:', updatedUser);
      
      toast.success(`User ${updatedUser.full_name || updatedUser.phone_number} updated successfully`);

      try {
        const existingProfile = await profileApi.getProfileByUser(selectedUser.id);
        const profileData = {
          profile_picture: formData.profile_picture || undefined,
          bio: formData.bio || undefined,
          location: formData.location || undefined,
        };
        
        if (existingProfile) {
          await profileApi.updateProfile(existingProfile.id, profileData);
          console.log('Profile updated for user:', selectedUser.id);
        } else {
          await profileApi.createProfile({
            user: selectedUser.id,
            ...profileData
          });
          console.log('Profile created for user:', selectedUser.id);
        }
      } catch (profileError: any) {
        console.error('Profile update error:', profileError);
        toast.error('User updated but profile update failed');
      }

      resetForm();
      setShowModal(false);
      await Promise.all([
        fetchUsers(),
        fetchProfiles(),
        fetchDashboard()
      ]);
      
    } catch (error: any) {
      console.error('Update user error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to update user';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // DELETE USER
  const handleDeleteUser = async (id: number) => {
    if (!id) {
      toast.error('Invalid user ID');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Deleting user:', id);
      await userApi.deleteUser(id);
      console.log('User deleted:', id);
      
      toast.success('User deleted successfully');
      setShowModal(false);
      setSelectedUser(null);
      
      await Promise.all([
        fetchUsers(),
        fetchProfiles(),
        fetchDashboard()
      ]);
      
    } catch (error: any) {
      console.error('Delete user error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to delete user';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ACTIVATE USER
  const handleActivateUser = async (id: number) => {
    if (!id) {
      toast.error('Invalid user ID');
      return;
    }

    try {
      console.log('Activating user:', id);
      await userApi.activateUser(id);
      console.log('User activated:', id);
      
      toast.success('User activated successfully');
      await fetchUsers();
      
    } catch (error: any) {
      console.error('Activate user error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to activate user';
      toast.error(message);
    }
  };

  // DEACTIVATE USER
  const handleDeactivateUser = async (id: number) => {
    if (!id) {
      toast.error('Invalid user ID');
      return;
    }

    try {
      console.log('Deactivating user:', id);
      await userApi.deactivateUser(id);
      console.log('User deactivated:', id);
      
      toast.success('User deactivated successfully');
      await fetchUsers();
      
    } catch (error: any) {
      console.error('Deactivate user error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to deactivate user';
      toast.error(message);
    }
  };

  // ============================================
  // FORM HANDLERS
  // ============================================
  const resetForm = () => {
    setFormData({
      phone_number: '',
      email: '',
      full_name: '',
      role: 'student',
      church_name: '',
      region: '',
      city: '',
      street: '',
      country_code: '+255',
      is_active: true,
      is_verified: false,
      is_staff: false,
      is_superuser: false,
      password: '',
      profile_picture: '',
      bio: '',
      location: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setModalType('add');
    setModalData(null);
    setSelectedUser(null);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      phone_number: user.phone_number || '',
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role || 'student',
      church_name: user.church_name || '',
      region: user.region || '',
      city: user.city || '',
      street: user.street || '',
      country_code: user.country_code || '+255',
      is_active: user.is_active ?? true,
      is_verified: user.is_verified ?? false,
      is_staff: user.is_staff ?? false,
      is_superuser: user.is_superuser ?? false,
      password: '',
      profile_picture: '',
      bio: '',
      location: ''
    });

    const profile = profiles.find(p => p.user === user.id);
    if (profile) {
      setFormData(prev => ({
        ...prev,
        profile_picture: profile.profile_picture || '',
        bio: profile.bio || '',
        location: profile.location || ''
      }));
    }

    setModalType('edit');
    setModalData(user);
    setShowModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModalType('delete');
    setModalData(user);
    setShowModal(true);
  };

  // ============================================
  // FILTERED DATA
  // ============================================
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number.includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active) ||
      (statusFilter === 'verified' && user.is_verified) ||
      (statusFilter === 'online' && user.is_online);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredAuthLogs = authLogs.filter(log => {
    const matchesSearch = !searchQuery || 
      log.phone_number.includes(searchQuery) ||
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // ============================================
  // HELPERS
  // ============================================
  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      super_admin: 'bg-red-100 text-red-700',
      church_admin: 'bg-blue-100 text-blue-700',
      pastor: 'bg-green-100 text-green-700',
      evangelist: 'bg-yellow-100 text-yellow-700',
      student: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_active) return { label: 'Inactive', className: 'bg-red-100 text-red-700' };
    if (user.is_online) return { label: 'Online', className: 'bg-green-100 text-green-700' };
    if (user.is_verified) return { label: 'Verified', className: 'bg-blue-100 text-blue-700' };
    return { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' };
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const getUserProfilePicture = (userId: number): string | null => {
    const profile = profiles.find(p => p.user === userId);
    return profile?.profile_picture || null;
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderDashboard = () => {
    if (loading.dashboard) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (!dashboardStats) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No dashboard data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-cyan-500">
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.users.total}</p>
            <p className="text-xs text-gray-500">Total Users</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
            <p className="text-2xl font-bold text-green-600">{dashboardStats.users.active}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">{dashboardStats.users.verified}</p>
            <p className="text-xs text-gray-500">Verified</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-400">
            <p className="text-2xl font-bold text-green-500">{dashboardStats.users.online}</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-red-500">
            <p className="text-2xl font-bold text-red-600">{dashboardStats.users.inactive}</p>
            <p className="text-xs text-gray-500">Inactive</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Profiles</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">{dashboardStats.profiles.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">With Picture</span>
                <span className="font-bold text-green-600">{dashboardStats.profiles.with_picture}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Verifications</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">{dashboardStats.verifications.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-bold text-green-600">{dashboardStats.verifications.used}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold text-yellow-600">{dashboardStats.verifications.pending}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sessions & Logs</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Sessions</span>
                <span className="font-bold text-green-600">{dashboardStats.sessions.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Auth Logs (24h)</span>
                <span className="font-bold text-blue-600">{dashboardStats.auth_logs.recent_24h}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Auth Logs</span>
                <span className="font-bold">{dashboardStats.auth_logs.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Role Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(dashboardStats.users.role_stats).map(([role, count]) => (
              <div key={role} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 capitalize">{role.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUsersTable = () => {
    if (loading.users) {
      return (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-cyan-500" />
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-12">
          <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <FaPlus className="mr-2" />
            Add First User
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(user => {
              const status = getStatusBadge(user);
              const profilePic = getUserProfilePicture(user.id);
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <ProfileImage 
                        base64Image={profilePic} 
                        size="small"
                        fallback={user.full_name || user.phone_number}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.full_phone_number}</td>
                  <td className="px-4 py-3 text-sm">{user.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(user.date_joined)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-gray-500 hover:text-cyan-600 rounded-lg hover:bg-cyan-50"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      {user.is_active ? (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="p-2 text-gray-500 hover:text-orange-600 rounded-lg hover:bg-orange-50"
                          title="Deactivate"
                        >
                          <FaTimesCircle />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50"
                          title="Activate"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users match your filters</p>
          </div>
        )}
      </div>
    );
  };

  const renderProfilesTable = () => {
    if (loading.profiles) {
      return (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-cyan-500" />
        </div>
      );
    }

    if (profiles.length === 0) {
      return (
        <div className="text-center py-12">
          <FaUserCircle className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No profiles found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Picture</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {profiles.map(profile => (
              <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{profile.user_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{profile.user_phone}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ProfileImage 
                    base64Image={profile.profile_picture} 
                    size="small"
                    fallback={profile.user_name || 'U'}
                  />
                </td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">{profile.bio || '-'}</td>
                <td className="px-4 py-3 text-sm">{profile.location || '-'}</td>
                <td className="px-4 py-3 text-sm">{formatDate(profile.created_at)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setModalType('view');
                      setModalData(profile);
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-cyan-600 rounded-lg hover:bg-cyan-50"
                    title="View"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVerificationsTable = () => {
    if (loading.verifications) {
      return (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-cyan-500" />
        </div>
      );
    }

    if (verifications.length === 0) {
      return (
        <div className="text-center py-12">
          <FaKey className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No verifications found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {verifications.map(verification => (
              <tr key={verification.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{verification.user_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">ID: {verification.user}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{verification.phone_number}</td>
                <td className="px-4 py-3 font-mono text-sm font-bold">{verification.verification_code}</td>
                <td className="px-4 py-3">
                  {verification.is_used ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Used</span>
                  ) : verification.is_expired ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Expired</span>
                  ) : verification.is_valid ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Valid</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Invalid</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(verification.expires_at)}</td>
                <td className="px-4 py-3 text-sm">{formatDate(verification.created_at)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setModalType('view');
                      setModalData(verification);
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-cyan-600 rounded-lg hover:bg-cyan-50"
                    title="View"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSessionsTable = () => {
    if (loading.sessions) {
      return (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-cyan-500" />
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <div className="text-center py-12">
          <FaClock className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No sessions found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map(session => (
              <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.user_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">ID: {session.user}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">{session.device_info || '-'}</td>
                <td className="px-4 py-3 text-sm font-mono">{session.ip_address || '-'}</td>
                <td className="px-4 py-3">
                  {session.is_active ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Ended</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(session.last_activity)}</td>
                <td className="px-4 py-3 text-sm">{formatDate(session.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setModalType('view');
                        setModalData(session);
                        setShowModal(true);
                      }}
                      className="p-2 text-gray-500 hover:text-cyan-600 rounded-lg hover:bg-cyan-50"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    {session.is_active && (
                      <button
                        onClick={async () => {
                          try {
                            await sessionApi.endSession(session.id);
                            toast.success('Session ended');
                            fetchSessions();
                          } catch (error: any) {
                            toast.error('Failed to end session');
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-orange-600 rounded-lg hover:bg-orange-50"
                        title="End Session"
                      >
                        <FaTimesCircle />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAuthLogsTable = () => {
    if (loading.authlogs) {
      return (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-cyan-500" />
        </div>
      );
    }

    if (authLogs.length === 0) {
      return (
        <div className="text-center py-12">
          <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No auth logs found</p>
        </div>
      );
    }

    const getActionBadge = (action: string) => {
      const colors: Record<string, string> = {
        login: 'bg-green-100 text-green-700',
        logout: 'bg-gray-100 text-gray-700',
        register: 'bg-blue-100 text-blue-700',
        verify: 'bg-purple-100 text-purple-700',
        code_sent: 'bg-yellow-100 text-yellow-700',
        code_used: 'bg-indigo-100 text-indigo-700',
        failed_login: 'bg-red-100 text-red-700',
      };
      return colors[action] || 'bg-gray-100 text-gray-700';
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAuthLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.user_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">ID: {log.user || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{log.phone_number}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadge(log.action)}`}>
                    {log.action_display}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono">{log.ip_address || '-'}</td>
                <td className="px-4 py-3 text-sm">{formatDate(log.created_at)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setModalType('view');
                      setModalData(log);
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-cyan-600 rounded-lg hover:bg-cyan-50"
                    title="View"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAuthLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No auth logs match your filters</p>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // MODAL RENDER
  // ============================================
  const renderModal = () => {
    if (!showModal) return null;

    const renderViewModal = () => {
      if (modalType === 'view' && modalData) {
        const filteredData = Object.entries(modalData).filter(([key]) => 
          !['password', 'profile', 'profile_picture'].includes(key)
        );
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredData.map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">{key}</p>
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {value !== null && value !== undefined ? String(value) : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return null;
    };

    const renderUserForm = () => {
      const isEdit = modalType === 'edit';

      return (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (isEdit) {
            handleUpdateUser();
          } else {
            handleCreateUser();
          }
        }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <ImageUpload
                onImageSelect={(base64) => setFormData({ ...formData, profile_picture: base64 })}
                currentImage={formData.profile_picture}
                label="Upload Profile Picture"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="255712345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="evangelist">Evangelist</option>
                <option value="pastor">Pastor</option>
                <option value="church_admin">Church Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Church Name</label>
              <input
                type="text"
                value={formData.church_name}
                onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Grace Church"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
              <input
                type="text"
                value={formData.country_code}
                onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Dar es Salaam"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="Kinondoni"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="123 Main Street"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="User biography..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                placeholder="City, Country"
              />
            </div>
            {!isEdit && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Min 8 characters"
                  minLength={8}
                />
              </div>
            )}
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_staff}
                    onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Staff</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_superuser}
                    onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Superuser</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center"
            >
              {isProcessing ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      );
    };

    const renderDeleteModal = () => {
      const user = modalData as User;
      return (
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <FaTrash className="text-red-600 text-3xl" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete user <strong>{user?.full_name || user?.phone_number}</strong>?
              </p>
            </div>
          </div>
          <p className="text-sm text-red-600 mb-4">This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedUser(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => user && handleDeleteUser(user.id)}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {isProcessing ? <FaSpinner className="animate-spin mr-2" /> : <FaTrash className="mr-2" />}
              Delete
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {modalType === 'view' && <FaEye className="text-cyan-600 text-2xl" />}
              {modalType === 'add' && <FaPlus className="text-green-600 text-2xl" />}
              {modalType === 'edit' && <FaEdit className="text-blue-600 text-2xl" />}
              {modalType === 'delete' && <FaTrash className="text-red-600 text-2xl" />}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === 'view' && 'View Details'}
                  {modalType === 'add' && 'Add New User'}
                  {modalType === 'edit' && 'Edit User'}
                  {modalType === 'delete' && 'Confirm Delete'}
                </h3>
                <p className="text-sm text-gray-600">
                  {modalType === 'view' && 'Viewing complete user information'}
                  {modalType === 'add' && 'Create a new user account'}
                  {modalType === 'edit' && 'Update user information'}
                  {modalType === 'delete' && 'Permanently delete this user'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {modalType === 'view' && renderViewModal()}
            {(modalType === 'add' || modalType === 'edit') && renderUserForm()}
            {modalType === 'delete' && renderDeleteModal()}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchDashboard(),
        fetchUsers(),
        fetchProfiles(),
        fetchVerifications(),
        fetchSessions(),
        fetchAuthLogs()
      ]);
    };
    loadAllData();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'users', label: `Users (${users.length})`, icon: <FaUsers /> },
    { id: 'profiles', label: `Profiles (${profiles.length})`, icon: <FaUserCircle /> },
    { id: 'verifications', label: `Verifications (${verifications.length})`, icon: <FaKey /> },
    { id: 'sessions', label: `Sessions (${sessions.length})`, icon: <FaClock /> },
    { id: 'authlogs', label: `Auth Logs (${authLogs.length})`, icon: <FaHistory /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaDatabase className="text-cyan-600 text-2xl" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Complete User Management System</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await Promise.all([
                  fetchDashboard(),
                  fetchUsers(),
                  fetchProfiles(),
                  fetchVerifications(),
                  fetchSessions(),
                  fetchAuthLogs()
                ]);
                toast.success('All data refreshed');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaSync className={loading.dashboard ? 'animate-spin' : ''} />
              <span>Refresh All</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 flex overflow-x-auto scrollbar-hide gap-1 pb-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
                setRoleFilter('');
                setStatusFilter('');
                setActionFilter('');
              }}
              className={`
                flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'text-cyan-700 border-b-2 border-cyan-600 bg-cyan-50/50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search and Filters */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              {activeTab === 'users' && (
                <>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="church_admin">Church Admin</option>
                    <option value="pastor">Pastor</option>
                    <option value="evangelist">Evangelist</option>
                    <option value="student">Student</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="verified">Verified</option>
                    <option value="online">Online</option>
                  </select>
                </>
              )}
              {activeTab === 'authlogs' && (
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Actions</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="register">Register</option>
                  <option value="verify">Verify</option>
                  <option value="code_sent">Code Sent</option>
                  <option value="code_used">Code Used</option>
                  <option value="failed_login">Failed Login</option>
                </select>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('');
                  setStatusFilter('');
                  setActionFilter('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsersTable()}
          {activeTab === 'profiles' && renderProfilesTable()}
          {activeTab === 'verifications' && renderVerificationsTable()}
          {activeTab === 'sessions' && renderSessionsTable()}
          {activeTab === 'authlogs' && renderAuthLogsTable()}
        </div>

        {/* Add User Button */}
        {activeTab === 'users' && (
          <button
            onClick={openAddModal}
            className="fixed bottom-8 right-8 p-4 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 transition-all hover:scale-105"
            title="Add New User"
          >
            <FaPlus size={24} />
          </button>
        )}
      </div>

      {/* Modal */}
      {renderModal()}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
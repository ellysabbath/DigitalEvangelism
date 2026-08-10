// src/services/api.ts
import axios from 'axios';
import type { 
  RegisterData, 
  
  User,
 
  UserCreateData,
  UserUpdateData,
  BulkCreateData,
  
  ExamFilterParams,
  EvangelistCreateData,
  EvangelistUpdateData,
  GroupCreateData,
  GroupUpdateData
} from '../types/data';

// ============================================
// API CONFIGURATION
// ============================================
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hopeprojects.pythonanywhere.com/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 300000000,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            if (response.data.refresh) {
              localStorage.setItem('refresh_token', response.data.refresh);
            }
            
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================
export const authAPI = {
  register: (data: RegisterData) => api.post('/auth/register/', data),
  login: (phoneNumber: string, code: string) => 
    api.post('/auth/login/', { phone_number: phoneNumber, verification_code: code }),
  checkUserCodes: (phoneNumber: string) => 
    api.post('/auth/check-user-codes/', { phone_number: phoneNumber }),
  generateLoginCodes: (phoneNumber: string) => 
    api.post('/auth/generate-login-codes/', { phone_number: phoneNumber }),
  verify: (phoneNumber: string, code: string) => 
    api.post('/auth/verify/', { phone_number: phoneNumber, verification_code: code }),
  resendVerification: (phoneNumber: string) => 
    api.post('/auth/resend-verification/', { phone_number: phoneNumber }),
  fetchVerificationCodes: (phoneNumber: string) => 
    api.post('/auth/fetch-codes/', { phone_number: phoneNumber }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: any) => api.patch('/auth/profile/', data),
  updateProfilePicture: (profilePicture: string) => 
    api.post('/auth/profile/picture/', { profile_picture: profilePicture }),
  logout: () => api.post('/auth/logout/'),
  checkUser: (phoneNumber: string) => 
    api.post('/auth/check-user/', { phone_number: phoneNumber }),
  getAuthStats: () => api.get('/auth/stats/'),
  getVerificationLogs: () => api.get('/auth/verification-logs/'),
  getSessions: () => api.get('/auth/sessions/'),
  getAuthLogs: () => api.get('/auth/auth-logs/'),
};

// ============================================
// USER CRUD API
// ============================================
export const crudAPI = {
  listUsers: (params?: any) => api.get('/auth/crud/users/', { params }),
  getFilterOptions: () => api.get('/auth/crud/filters/'),
  getUserStats: () => api.get('/auth/crud/stats/'),
  getUser: (id: number) => api.get(`/auth/crud/users/${id}/`),
  createUser: (data: UserCreateData) => api.post('/auth/crud/users/', data),
  updateUser: (id: number, data: UserUpdateData) => 
    api.patch(`/auth/crud/users/${id}/`, data),
  replaceUser: (id: number, data: UserCreateData) => 
    api.put(`/auth/crud/users/${id}/`, data),
  deleteUser: (id: number) => api.delete(`/auth/crud/users/${id}/`),
  hardDeleteUser: (id: number) => 
    api.delete(`/auth/crud/users/${id}/hard-delete/`),
  activateUser: (id: number) => 
    api.post(`/auth/crud/users/${id}/activate/`),
  deactivateUser: (id: number) => 
    api.post(`/auth/crud/users/${id}/deactivate/`),
  updateUserRole: (id: number, role: string) => 
    api.patch(`/auth/crud/users/${id}/role/`, { role }),
  bulkCreateUsers: (data: BulkCreateData) => 
    api.post('/auth/crud/users/bulk/create/', data),
  bulkDeleteUsers: (userIds: number[]) => 
    api.delete('/auth/crud/users/bulk/delete/', { data: { user_ids: userIds } }),
  bulkHardDeleteUsers: (userIds: number[]) => 
    api.delete('/auth/crud/users/bulk/hard-delete/', { data: { user_ids: userIds } }),
  bulkActivateUsers: (userIds: number[]) => 
    api.post('/auth/crud/users/bulk/activate/', { user_ids: userIds }),
  bulkDeactivateUsers: (userIds: number[]) => 
    api.post('/auth/crud/users/bulk/deactivate/', { user_ids: userIds }),
  bulkUpdateRoles: (updates: Array<{ id: number; role: string }>) => 
    api.patch('/auth/crud/users/bulk/roles/', { updates }),
};

// ============================================
// STUDENTS API - FIXED
// ============================================
export const studentsAPI = {
  list: (params?: any) => api.get('/students/', { params }),
  create: (data: { 
    user_id: number; 
    assigned_evangelist?: number | null; 
    groups?: number[] 
  }) => {
    // Clean the data - only include fields that have values
    const cleanData: any = { 
      user_id: data.user_id 
    };
    
    // Only include assigned_evangelist if it's a valid number or null
    if (data.assigned_evangelist !== undefined) {
      cleanData.assigned_evangelist = data.assigned_evangelist;
    }
    
    // Only include groups if it has items
    if (data.groups && data.groups.length > 0) {
      cleanData.groups = data.groups;
    }
    
    return api.post('/students/create/', cleanData);
  },
  get: (id: number) => api.get(`/students/${id}/`),
  update: (id: number, data: any) => {
    // Clean the data for update
    const cleanData: any = {};
    
    // Only include fields that have values
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        cleanData[key] = data[key];
      }
    });
    
    return api.patch(`/students/${id}/update/`, cleanData);
  },
  delete: (id: number) => api.delete(`/students/${id}/delete/`),
  stats: () => api.get('/students/stats/'),
  bulkDelete: (ids: number[]) => 
    api.delete('/students/bulk-delete/', { data: { student_ids: ids } }),
};

// ============================================
// EVANGELISTS API
// ============================================
export const evangelistsAPI = {
  list: (params?: any) => api.get('/evangelists/', { params }),
  create: (data: EvangelistCreateData) => {
    // Clean the data
    const cleanData: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof EvangelistCreateData];
      if (value !== undefined && value !== null) {
        cleanData[key] = value;
      }
    });
    
    return api.post('/evangelists/create/', cleanData);
  },
  get: (id: number) => api.get(`/evangelists/${id}/`),
  update: (id: number, data: EvangelistUpdateData) => {
    // Clean the data
    const cleanData: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof EvangelistUpdateData];
      if (value !== undefined && value !== null) {
        cleanData[key] = value;
      }
    });
    
    return api.patch(`/evangelists/${id}/update/`, cleanData);
  },
  delete: (id: number) => api.delete(`/evangelists/${id}/delete/`),
  stats: () => api.get('/evangelists/stats/'),
};

// ============================================
// GROUPS API
// ============================================
export const groupsAPI = {
  list: (params?: any) => api.get('/groups/', { params }),
  create: (data: GroupCreateData) => {
    // Clean the data
    const cleanData: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof GroupCreateData];
      if (value !== undefined && value !== null) {
        cleanData[key] = value;
      }
    });
    
    return api.post('/groups/create/', cleanData);
  },
  get: (id: number) => api.get(`/groups/${id}/`),
  update: (id: number, data: GroupUpdateData) => {
    // Clean the data
    const cleanData: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof GroupUpdateData];
      if (value !== undefined && value !== null) {
        cleanData[key] = value;
      }
    });
    
    return api.patch(`/groups/${id}/update/`, cleanData);
  },
  delete: (id: number) => api.delete(`/groups/${id}/delete/`),
  addMember: (id: number, userId: number) => 
    api.post(`/groups/${id}/add-member/`, { user_id: userId }),
  removeMember: (id: number, userId: number) => 
    api.delete(`/groups/${id}/remove-member/`, { data: { user_id: userId } }),
};

// ============================================
// CERTIFICATES API
// ============================================
export const certificatesAPI = {
  list: (params?: any) => api.get('/certificates/', { params }),
  create: (data: any) => api.post('/certificates/create/', data),
  get: (id: number) => api.get(`/certificates/${id}/`),
  update: (id: number, data: any) => api.patch(`/certificates/${id}/update/`, data),
  delete: (id: number) => api.delete(`/certificates/${id}/delete/`),
  issue: (id: number) => api.post(`/certificates/${id}/issue/`),
  stats: () => api.get('/certificates/stats/'),
};

// ============================================
// SERMONS API
// ============================================
export const sermonsAPI = {
  list: (params?: any) => api.get('/sermons/', { params }),
  create: (data: any) => api.post('/sermons/create/', data),
  get: (id: number) => api.get(`/sermons/${id}/`),
  update: (id: number, data: any) => api.patch(`/sermons/${id}/update/`, data),
  delete: (id: number) => api.delete(`/sermons/${id}/delete/`),
  publish: (id: number) => api.post(`/sermons/${id}/publish/`),
  stats: () => api.get('/sermons/stats/'),
};

// ============================================
// COMMENTS API
// ============================================
export const commentsAPI = {
  list: (sermonId: number) => api.get(`/comments/sermon/${sermonId}/`),
  create: (sermonId: number, data: { content: string; parent?: number }) => 
    api.post(`/comments/sermon/${sermonId}/create/`, data),
  get: (id: number) => api.get(`/comments/${id}/`),
  update: (id: number, data: { content: string }) => 
    api.patch(`/comments/${id}/update/`, data),
  delete: (id: number) => api.delete(`/comments/${id}/delete/`),
  like: (id: number) => api.post(`/comments/${id}/like/`),
  stats: (sermonId: number) => api.get(`/comments/sermon/${sermonId}/stats/`),
};

// ============================================
// EVANGELISM API
// ============================================
export const evangelismAPI = {
  

  dashboard: () => api.get('/evangelism/dashboard/'),
};

// ============================================
// EXAM SUBMISSION API (Sermon-based exams)
// ============================================
export const examAPI = {
  // Submissions
  listSubmissions: (params?: ExamFilterParams) => 
    api.get('/exam/submissions/', { params }),
  
  getSubmission: (id: number) => 
    api.get(`/exam/submissions/${id}/`),
  
  gradeSubmission: (id: number, data: { 
    answers: { questionId: string; score: number; feedback: string }[]; 
    feedback?: string 
  }) => api.post(`/exam/submissions/${id}/grade/`, data),
  
  getSubmissionStats: (sermonId: number) => 
    api.get(`/exam/sermon/${sermonId}/submissions/stats/`),
  
  getExamAnalytics: (sermonId: number) => 
    api.get(`/exam/sermon/${sermonId}/analytics/`),
  
  getStudentExams: (studentId: number) => 
    api.get(`/exam/student/?studentId=${studentId}`),
  
  // Submit exam to backend
  submitExam: (sermonId: number, data: { 
    answers: { questionId: string; answer: string | string[]; maxScore: number }[];
    timeTaken: number;
  }) => api.post(`/exam/sermon/${sermonId}/submit/`, data),
  
  // Check if user has submitted
  checkSubmission: (sermonId: number, studentId: number) => 
    api.get(`/exam/sermon/${sermonId}/check/?studentId=${studentId}`),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const setAuthTokens = (access: string, refresh?: string) => {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => !!localStorage.getItem('access_token');

export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const saveUser = (user: User) => localStorage.setItem('user', JSON.stringify(user));

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default {
  api,
  authAPI,
  crudAPI,
  studentsAPI,
  examAPI,
  evangelistsAPI,
  groupsAPI,
  certificatesAPI,
  sermonsAPI,
  commentsAPI,
  evangelismAPI,
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated,
  getCurrentUser,
  saveUser,
  getAuthHeaders,
};
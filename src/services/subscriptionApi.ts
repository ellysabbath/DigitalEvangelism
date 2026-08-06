// src/services/subscriptionApi.ts
import axios from 'axios';
import type {
  Subscription,
  SubscriptionLog,
  SubscriptionStats,
  SubscriptionCreateData,
  SubscriptionFormData
} from '../types/subscription';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hopeprojects.pythonanywhere.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const subscriptionApi = {
  // ============================================
  // PUBLIC ENDPOINTS (No Auth Required)
  // ============================================

  /**
   * Subscribe to the newsletter (Public)
   */
  subscribe: async (data: SubscriptionCreateData) => {
    const response = await api.post<{ success: boolean; message: string; data: Subscription }>(
      '/subscriptions/subscribe/',
      data
    );
    return response.data;
  },

  /**
   * Confirm subscription with token (Public)
   */
  confirmSubscription: async (token: string) => {
    const response = await api.get<{ success: boolean; message: string }>(
      `/subscriptions/confirm/${token}/`
    );
    return response.data;
  },

  /**
   * Unsubscribe from newsletter (Public)
   */
  unsubscribe: async (email: string, reason?: string) => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/subscriptions/unsubscribe/${encodeURIComponent(email)}/`,
      { reason }
    );
    return response.data;
  },

  /**
   * Resend confirmation email (Public)
   */
  resendConfirmation: async (email: string) => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/subscriptions/resend-confirmation/',
      { email }
    );
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS (Auth Required)
  // ============================================

  /**
   * Get all subscriptions with filters (Admin)
   */
  listSubscriptions: async (params?: {
    status?: string;
    subscription_type?: string;
    is_confirmed?: boolean;
    search?: string;
  }) => {
    const response = await api.get<Subscription[]>('/subscriptions/', { params });
    return response.data;
  },

  /**
   * Get a single subscription (Admin)
   */
  getSubscription: async (id: number) => {
    const response = await api.get<Subscription>(`/subscriptions/${id}/`);
    return response.data;
  },

  /**
   * Create a new subscription (Admin)
   */
  createSubscription: async (data: SubscriptionFormData) => {
    const response = await api.post<Subscription>('/subscriptions/', data);
    return response.data;
  },

  /**
   * Update a subscription (Admin)
   * Updated to accept status as well
   */
  updateSubscription: async (id: number, data: Partial<SubscriptionFormData> & { status?: string }) => {
    const response = await api.patch<Subscription>(`/subscriptions/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a subscription (Admin)
   */
  deleteSubscription: async (id: number) => {
    const response = await api.delete(`/subscriptions/${id}/`);
    return response.data;
  },

  /**
   * Get subscription statistics (Admin)
   */
  getStats: async () => {
    const response = await api.get<SubscriptionStats>('/subscriptions/stats/');
    return response.data;
  },

  /**
   * Get subscription logs (Admin)
   */
  getLogs: async (params?: { subscription_id?: number; action?: string; limit?: number }) => {
    const response = await api.get<SubscriptionLog[]>('/subscriptions/logs/', { params });
    return response.data;
  },
};

export default subscriptionApi;
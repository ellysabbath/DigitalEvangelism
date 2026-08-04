import apiClient from './apiClient';
import type { RegistrationData, UserResponse } from '../types/registration';

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  email_sent?: boolean;
  user?: UserResponse;
  errors?: Array<{ msg: string }> | Record<string, string[]>;
}

const registrationApi = {
  // Register new user
  register: async (data: RegistrationData): Promise<ApiResponse> => {
    try {
      console.log('Sending registration data to Django:', data);
      
      // Convert to Django field naming (snake_case)
      const payload: any = {
        first_name: data.firstName,
        middle_name: data.middleName || '',
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        whatsapp_number: data.whatsappNumber || '',
        email: data.email,
        date_of_birth: data.dateOfBirth,
        country: data.country,
        region: data.region,
        city: data.city,
        nin_number: data.ninNumber || '',
        national_id: data.nationalId || '',
        birth_certificate: data.birthCertificate || '',
        top_education_level: data.topEducationLevel || '',
        interests: data.interests || [],
        how_did_you_hear: data.howDidYouHear || '',
        agree_to_terms: data.agreeToTerms,
        like_platform: data.likePlatform || false,
        receive_updates: data.receiveUpdates || false,
        password: data.password, // NEW: Add password
      };

      // Handle profile picture (Base64)
      if (data.profilePicture) {
        if (data.profilePicture instanceof File) {
          const base64 = await fileToBase64(data.profilePicture);
          payload.profile_picture = base64;
        } else if (typeof data.profilePicture === 'string') {
          payload.profile_picture = data.profilePicture;
        }
      }

      const response = await apiClient.post('/registration/register', payload);
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', error);
      
      if (error.errors) {
        return {
          success: false,
          errors: error.errors,
          error: 'Validation failed'
        };
      }
      
      return {
        success: false,
        error: error.error || 'Registration failed. Please try again.',
      };
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.get(`/registration/verify-email?token=${token}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Email verification failed. Please try again.',
      };
    }
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/registration/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Failed to resend verification email.',
      };
    }
  },

  // Get user by ID
  getUser: async (userId: number): Promise<ApiResponse> => {
    try {
      const response = await apiClient.get(`/registration/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Failed to fetch user data.',
      };
    }
  },

  // Update user
  updateUser: async (userId: number, data: Partial<RegistrationData>): Promise<ApiResponse> => {
    try {
      const payload: any = {};
      
      // Convert to snake_case for Django
      const fieldMap: Record<string, string> = {
        firstName: 'first_name',
        middleName: 'middle_name',
        lastName: 'last_name',
        phoneNumber: 'phone_number',
        whatsappNumber: 'whatsapp_number',
        dateOfBirth: 'date_of_birth',
        topEducationLevel: 'top_education_level',
        howDidYouHear: 'how_did_you_hear',
        agreeToTerms: 'agree_to_terms',
        likePlatform: 'like_platform',
        receiveUpdates: 'receive_updates',
        profilePicture: 'profile_picture',
        ninNumber: 'nin_number',
        nationalId: 'national_id',
        birthCertificate: 'birth_certificate',
        password: 'password',
      };

      Object.entries(data).forEach(([key, value]) => {
        const djangoKey = fieldMap[key] || key;
        if (value !== undefined && value !== null) {
          payload[djangoKey] = value;
        }
      });

      // Handle profile picture
      if (data.profilePicture instanceof File) {
        const base64 = await fileToBase64(data.profilePicture);
        payload.profile_picture = base64;
      }

      const response = await apiClient.put(`/registration/user/${userId}/update`, payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.error || 'Failed to update user data.',
      };
    }
  },
};

// Helper function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default registrationApi;
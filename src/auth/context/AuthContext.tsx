// src/auth/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../../services/api';
import type { User, RegisterData, CheckUserCodesResponse, GenerateLoginCodesResponse } from '../../types/data';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string, code: string) => Promise<any>;
  checkUserCodes: (phoneNumber: string) => Promise<CheckUserCodesResponse>;
  generateLoginCodes: (phoneNumber: string) => Promise<GenerateLoginCodesResponse>;
  register: (data: RegisterData) => Promise<any>;
  verifyAccount: (phoneNumber: string, code: string) => Promise<any>;
  resendVerification: (phoneNumber: string) => Promise<any>;
  fetchVerificationCodes: (phoneNumber: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
  updateProfilePicture: (base64Image: string) => Promise<any>;
  checkUserExists: (phoneNumber: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshUser();
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (phoneNumber: string, code: string) => {
    setIsLoading(true);
    try {
      // Ensure phone number has + prefix
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      console.log('🔐 AuthContext - Login attempt for:', formattedPhone, 'Code:', code);
      const response = await authAPI.login(formattedPhone, code);
      
      console.log('📦 AuthContext - Login response:', response.data);
      
      // Successful login
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Clear any stored verification data
      localStorage.removeItem('verification_phone');
      localStorage.removeItem('registration_data');
      localStorage.removeItem('user_codes');
      
      toast.success('Welcome back!');
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthContext - Login error:', error);
      
      // Check if the error is due to invalid code
      if (error.response?.data?.error === 'Invalid verification code') {
        toast.error('Invalid verification code. Please try again.');
        throw new Error('Invalid verification code');
      }
      
      // For other errors, throw them
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserCodes = async (phoneNumber: string): Promise<CheckUserCodesResponse> => {
    try {
      // Ensure phone number has + prefix
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      console.log('📤 AuthContext - Checking user codes for:', formattedPhone);
      const response = await authAPI.checkUserCodes(formattedPhone);
      
      // If user has codes, store them for display
      if (response.data.exists && response.data.verification_codes) {
        localStorage.setItem('user_codes', JSON.stringify(response.data.verification_codes));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthContext - Error checking user codes:', error);
      throw error;
    }
  };

  const generateLoginCodes = async (phoneNumber: string): Promise<GenerateLoginCodesResponse> => {
    setIsLoading(true);
    try {
      // Ensure phone number has + prefix
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      console.log('📤 AuthContext - Generating login codes for:', formattedPhone);
      const response = await authAPI.generateLoginCodes(formattedPhone);
      
      // Store the new codes
      if (response.data.verification_codes) {
        localStorage.setItem('user_codes', JSON.stringify(response.data.verification_codes));
      }
      
      toast.success('New verification codes generated!');
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthContext - Error generating login codes:', error);
      const message = error.response?.data?.error || 'Failed to generate login codes';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      console.log('📤 AuthContext - Registering user with data:', data);
      
      // Format phone number - ensure it has + prefix
      let formattedPhone = data.phone_number.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      // Update data with formatted phone
      const formattedData = {
        ...data,
        phone_number: formattedPhone
      };
      
      // Validate required fields
      if (!formattedData.phone_number || formattedData.phone_number.trim() === '') {
        throw new Error('Phone number is required');
      }
      if (!formattedData.country_code || formattedData.country_code.trim() === '') {
        throw new Error('Country code is required');
      }
      if (!formattedData.full_name || formattedData.full_name.trim() === '') {
        throw new Error('Full name is required');
      }
      if (!formattedData.email || formattedData.email.trim() === '') {
        throw new Error('Email is required');
      }
      if (!formattedData.region || formattedData.region.trim() === '') {
        throw new Error('Region is required');
      }
      if (!formattedData.city || formattedData.city.trim() === '') {
        throw new Error('City is required');
      }
      
      const response = await authAPI.register(formattedData);
      
      console.log('✅ AuthContext - Registration response:', response.data);
      
      // Store registration data for verification
      localStorage.setItem('registration_data', JSON.stringify({
        phoneNumber: response.data.phone_number,
        verificationCodes: response.data.verification_codes,
      }));
      
      toast.success('Registration successful! Please verify your account.');
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthContext - Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message && !error.response) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        const data = error.response.data;
        console.log('Error response data:', data);
        
        if (typeof data === 'object') {
          const messages = [];
          for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              messages.push(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
              messages.push(value);
            } else if (typeof value === 'object' && value !== null) {
              messages.push(`${key}: ${JSON.stringify(value)}`);
            }
          }
          if (messages.length > 0) {
            errorMessage = messages.join('; ');
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAccount = async (phoneNumber: string, code: string) => {
    setIsLoading(true);
    try {
      // Ensure phone number has + prefix
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      console.log('🔐 AuthContext - Verifying account:', formattedPhone, 'Code:', code);
      const response = await authAPI.verify(formattedPhone, code);
      
      console.log('📦 AuthContext - Verify response:', response.data);
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      localStorage.removeItem('registration_data');
      localStorage.removeItem('verification_phone');
      
      toast.success('Account verified successfully!');
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthContext - Verification error:', error);
      const message = error.response?.data?.error || 'Verification failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      // Ensure phone number has + prefix
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      const response = await authAPI.resendVerification(formattedPhone);
      toast.success('New verification codes generated!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to generate new codes.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVerificationCodes = async (phoneNumber: string) => {
    try {
      // Ensure phone number has + prefix
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      console.log('AuthContext - Fetching verification codes for:', formattedPhone);
      const response = await authAPI.fetchVerificationCodes(formattedPhone);
      console.log('✅ AuthContext - Fetch codes response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthContext - Error fetching verification codes:', error);
      const message = error.response?.data?.error || 'Failed to fetch verification codes';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('registration_data');
      localStorage.removeItem('verification_phone');
      localStorage.removeItem('user_codes');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update profile.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePicture = async (base64Image: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfilePicture(base64Image);
      await refreshUser();
      toast.success('Profile picture updated!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update profile picture.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserExists = async (phoneNumber: string) => {
    try {
      // Clean the phone number - remove spaces
      let cleanNumber = phoneNumber.replace(/\s/g, '');
      
      // Ensure it has + prefix
      if (!cleanNumber.startsWith('+')) {
        cleanNumber = `+${cleanNumber}`;
      }
      
      console.log('🔍 Checking if user exists:', cleanNumber);
      
      if (!cleanNumber || cleanNumber.length < 7) {
        console.log('Phone number too short, skipping check');
        return false;
      }
      
      const response = await authAPI.checkUser(cleanNumber);
      console.log('✅ Check user response:', response.data);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        checkUserCodes,
        generateLoginCodes,
        register,
        verifyAccount,
        resendVerification,
        fetchVerificationCodes,
        logout,
        updateProfile,
        updateProfilePicture,
        checkUserExists,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
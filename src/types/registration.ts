// src/types/registration.ts

// Add the Step type
export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface RegistrationData {
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  whatsappNumber?: string;
  email: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
  country: string;
  region: string;
  city: string;
  
  // Identification
  ninNumber?: string;
  nationalId?: string;
  birthCertificate?: string;
  
  // Education & Interests
  topEducationLevel?: string;
  interests?: string[];
  howDidYouHear?: string;
  
  // Preferences & Consent
  agreeToTerms: boolean;
  likePlatform?: boolean;
  receiveUpdates?: boolean;
  
  // Profile
  profilePicture?: File | string | null;
  
  // Authentication
  password: string;
  confirmPassword?: string; // Add this field (optional since it might not be sent to API)
}

export interface UserResponse {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  whatsapp_number?: string;
  email: string;
  date_of_birth: string;
  country: string;
  region: string;
  city: string;
  nin_number?: string;
  national_id?: string;
  birth_certificate?: string;
  top_education_level?: string;
  interests: string[];
  how_did_you_hear?: string;
  agree_to_terms: boolean;
  like_platform: boolean;
  receive_updates: boolean;
  profile_picture?: string | null;
  profile_picture_thumbnail?: string | null;
  is_verified: boolean;
  is_active: boolean;
  date_joined: string;
  last_login?: string | null;
  role?: string;
  role_display?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserResponse;
  email_sent?: boolean;
  errors?: Array<{ msg: string }> | Record<string, string[]>;
}

export interface EmailVerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserResponse;
}

export interface ResendVerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
  email_sent?: boolean;
}
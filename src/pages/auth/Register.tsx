// src/pages/auth/Register.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import type { CountryCode, RegisterData } from '../../types/data';
import { 
  FaUser, FaPhone, FaEnvelope, FaChurch, FaMapMarkerAlt, 
  FaCity, FaStreetView, FaInfoCircle, FaUpload, FaSpinner,
  FaTimes, FaUserPlus, FaShieldAlt, FaChevronDown, FaSearch,
  FaCheckCircle, FaGraduationCap, FaArrowLeft,
  
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Country codes data with flags as emojis (keeping flags as they are standard)
const countryCodes: CountryCode[] = [
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
];

// Single validation schema for all fields
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(14, 'Phone number must be at most 14 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  countryCode: z.string().min(1, 'Country code is required'),
  email: z.string().email('Invalid email address'),
  churchName: z.string().optional(),
  region: z.string().min(2, 'Region is required'),
  city: z.string().min(2, 'City is required'),
  street: z.string().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading: authLoading, checkUserExists } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // Country code dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>({
    code: '+255',
    country: 'Tanzania',
    flag: '🇹🇿'
  });
  
  // Phone check
  const [isCheckingPhone, setIsCheckingPhone] = useState<boolean>(false);
  const [phoneExists, setPhoneExists] = useState<boolean>(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      countryCode: '+255',
      email: '',
      churchName: '',
      region: '',
      city: '',
      street: '',
      bio: '',
      profilePicture: '',
    },
    mode: 'onChange',
  });

  const phoneNumber = watch('phoneNumber');
  const countryCode = watch('countryCode');

  // Check if phone exists - sends FULL number to backend
  useEffect(() => {
    const checkPhone = async () => {
      const currentPhone = phoneNumber;
      const currentCountry = countryCode || selectedCountry.code;
      
      if (currentPhone && currentPhone.length >= 7) {
        setIsCheckingPhone(true);
        const cleanNumber = currentPhone.replace(/\s/g, '');
        const fullNumber = `${currentCountry}${cleanNumber}`;
        console.log('Checking phone number:', fullNumber);
        
        try {
          const exists = await checkUserExists(fullNumber);
          setPhoneExists(!!exists);
        } catch (error) {
          console.error('Error checking phone:', error);
          setPhoneExists(false);
        }
        setIsCheckingPhone(false);
      } else {
        setPhoneExists(false);
      }
    };

    const debounce = setTimeout(checkPhone, 500);
    return () => clearTimeout(debounce);
  }, [phoneNumber, countryCode, selectedCountry.code, checkUserExists]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countryCodes.filter(country =>
    country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setValue('countryCode', country.code);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfileImage(base64String);
      setValue('profilePicture', base64String);
      setIsUploading(false);
      toast.success('Profile image uploaded successfully');
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast.error('Failed to upload image');
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage('');
    setValue('profilePicture', '');
    toast.success('Profile image removed');
  };

  const onSubmit = async (data: RegisterFormData) => {
    // Check if phone exists
    if (phoneExists) {
      toast.error('This phone number is already registered. Please login instead.');
      setSubmitError('Phone number already registered');
      return;
    }

    // Validate required fields
    if (!data.phoneNumber || data.phoneNumber.length < 7) {
      toast.error('Phone number is required and must be at least 7 digits');
      setSubmitError('Phone number is required and must be at least 7 digits');
      return;
    }

    if (!data.fullName || data.fullName.length < 2) {
      toast.error('Full name is required');
      setSubmitError('Full name is required');
      return;
    }

    if (!data.email || !data.email.includes('@')) {
      toast.error('Valid email is required');
      setSubmitError('Valid email is required');
      return;
    }

    if (!data.region || data.region.length < 2) {
      toast.error('Region is required');
      setSubmitError('Region is required');
      return;
    }

    if (!data.city || data.city.length < 2) {
      toast.error('City is required');
      setSubmitError('City is required');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    
    try {
      // Clean phone number - remove spaces, keep only digits
      const cleanPhoneNumber = data.phoneNumber.replace(/\s/g, '');
      
      // Build registration data
      const registrationData: RegisterData = {
        full_name: data.fullName.trim(),
        phone_number: cleanPhoneNumber,
        email: data.email.trim().toLowerCase(),
        country_code: data.countryCode,
        church_name: data.churchName?.trim() || '',
        region: data.region.trim(),
        city: data.city.trim(),
        street: data.street?.trim() || '',
        profile: {
          bio: data.bio?.trim() || '',
          profile_picture: data.profilePicture || null,
        }
      };

      console.log('Sending registration data:', JSON.stringify(registrationData, null, 2));

      const response = await registerUser(registrationData);
      
      console.log('Registration successful:', response);
      
      // Store registration data for verification
      localStorage.setItem('registration_data', JSON.stringify({
        phoneNumber: response.phone_number,
        verificationCodes: response.verification_codes,
      }));
      
      navigate('/verify', { 
        state: { 
          phoneNumber: response.phone_number,
          codes: response.verification_codes,
        },
        replace: true
      });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMsg = error.message || 'Registration failed. Please try again.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isUploading || authLoading;

  // Get input class
  const getInputClassName = (fieldError: any) => {
    return `w-full pl-10 pr-3 py-3 border ${
      fieldError ? 'border-red-400' : 'border-gray-200'
    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400 transition-all duration-200 ${
      isLoading ? 'opacity-60 cursor-not-allowed' : ''
    }`;
  };

  const getTextAreaClassName = (fieldError: any) => {
    return `w-full pl-10 pr-3 py-3 border ${
      fieldError ? 'border-red-400' : 'border-gray-200'
    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400 transition-all duration-200 ${
      isLoading ? 'opacity-60 cursor-not-allowed' : ''
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-full text-green-800 text-sm font-medium">
            <FaGraduationCap className="mr-2" />
            Student Registration - Default Role
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <FaUserPlus className="text-3xl text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Join Digital Evangelism</h1>
            <p className="text-blue-100 text-sm">No password needed - Just your phone number!</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <FaGraduationCap className="text-white mr-2 text-xs" />
              <span className="text-white text-xs">Default Role: Student</span>
            </div>
          </div>

          <div className="p-8">
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      {...register('fullName')}
                      type="text"
                      className={getInputClassName(errors.fullName)}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Phone Number with Country Code */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="h-full px-3 py-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-2 min-w-[120px]"
                        disabled={isLoading}
                      >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                        <FaChevronDown className={`text-gray-400 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                              <input
                                type="text"
                                placeholder="Search country..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto max-h-60">
                            {filteredCountries.map((country, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                className={`w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-blue-50 transition-colors text-left ${
                                  selectedCountry.code === country.code ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                              >
                                <span className="text-xl">{country.flag}</span>
                                <span className="text-sm font-medium text-gray-700 flex-1">{country.country}</span>
                                <span className="text-sm text-gray-500">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        {...register('phoneNumber')}
                        type="tel"
                        className={`w-full pl-9 pr-3 py-3 border ${
                          errors.phoneNumber ? 'border-red-400' : 'border-gray-200'
                        } rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400 transition-all duration-200 ${
                          isLoading ? 'opacity-60 cursor-not-allowed' : ''
                        } ${phoneExists ? 'border-green-400' : ''}`}
                        placeholder="742578691"
                        disabled={isLoading}
                      />
                      {isCheckingPhone && (
                        <div className="absolute inset-y-0 right-3 flex items-center">
                          <FaSpinner className="animate-spin text-gray-400" />
                        </div>
                      )}
                      {phoneExists && !isCheckingPhone && (
                        <div className="absolute inset-y-0 right-3 flex items-center">
                          <FaCheckCircle className="text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  <input type="hidden" {...register('countryCode')} value={selectedCountry.code} />
                  {errors.phoneNumber && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                  {phoneExists && (
                    <p className="mt-1.5 text-sm text-green-600 flex items-center">
                      <FaCheckCircle className="mr-1" />
                      This number is already registered. Please login instead.
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">
                    Enter only digits. Your country code will be added automatically.
                  </p>
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className={getInputClassName(errors.email)}
                      placeholder="Enter your email address"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Church Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Church Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaChurch className="text-gray-400" />
                    </div>
                    <input
                      {...register('churchName')}
                      type="text"
                      className={getInputClassName(errors.churchName)}
                      placeholder="Enter your church name (optional)"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      {...register('region')}
                      type="text"
                      className={getInputClassName(errors.region)}
                      placeholder="Enter your region"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.region && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.region.message}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    City/Village <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCity className="text-gray-400" />
                    </div>
                    <input
                      {...register('city')}
                      type="text"
                      className={getInputClassName(errors.city)}
                      placeholder="Enter your city or village"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.city.message}</p>
                  )}
                </div>

                {/* Street */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Street Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaStreetView className="text-gray-400" />
                    </div>
                    <input
                      {...register('street')}
                      type="text"
                      className={getInputClassName(errors.street)}
                      placeholder="Enter your street address (optional)"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Profile Picture
                  </label>
                  <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-all">
                    <div className="relative">
                      {profileImage ? (
                        <div className="relative group">
                          <img
                            src={profileImage}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                            disabled={isLoading}
                          >
                            <FaTimes className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-dashed border-gray-300 hover:border-blue-400 transition-all">
                          <FaUser className="text-gray-400 text-3xl" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer inline-flex items-center px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isLoading}
                      >
                        <FaUpload className="mr-2 text-gray-500" />
                        {isUploading ? 'Uploading...' : 'Upload Photo'}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isLoading}
                      />
                      <p className="mt-1 text-xs text-gray-500 text-center">
                        JPG, PNG, or GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Bio
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <FaInfoCircle className="text-gray-400" />
                    </div>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className={getTextAreaClassName(errors.bio)}
                      placeholder="Tell us about yourself (optional)"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">Maximum 500 characters</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading || phoneExists}
                  className={`w-full flex justify-center items-center py-3.5 px-4 text-sm font-semibold text-white rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl ${
                    (isLoading || phoneExists) ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-3" />
                      {isSubmitting ? 'Creating Account...' : isUploading ? 'Uploading Image...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-3" />
                      Create Account
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center">
                      Sign in
                      <FaArrowLeft className="ml-1 text-xs transform rotate-180" />
                    </Link>
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                  <FaShieldAlt className="text-gray-300" />
                  <span>By creating an account, you agree to our</span>
                  <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                  <span>and</span>
                  <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </div>

                <div className="text-center text-xs text-gray-400">
                  <span className="inline-flex items-center">
                    <FaGraduationCap className="mr-1 text-gray-300" />
                    You are registering as a <strong className="text-gray-600">Student</strong>. 
                    Your role can be updated by an admin later.
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Register;
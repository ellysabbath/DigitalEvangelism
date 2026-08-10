// src/pages/auth/Login.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Icons
import { 
  FaPhone, 
  FaSignInAlt, 
  FaSpinner, 
  FaArrowRight,
  FaChevronDown, 
  FaSearch, 
  FaCheckCircle, 
  FaUserCheck,
  FaShieldAlt,
  FaGlobe,
  FaUserPlus,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaEnvelope,
  FaChurch,
  FaTimes,
  FaExclamationTriangle,
  FaKey,
  FaSync,
  FaHome
} from 'react-icons/fa';

// Types
interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

// Country codes
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

// Validation schema
const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9\s-]+$/, 'Invalid phone number format'),
  countryCode: z.string().min(1, 'Country code is required'),
  verificationCode: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Invalid code format'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Helper function to format phone number
const formatPhoneNumber = (countryCode: string, phoneNumber: string): string => {
  let formatted = phoneNumber.replace(/\s/g, '');
  formatted = formatted.replace(/^\+/, '');
  
  let code = countryCode;
  if (!code.startsWith('+')) {
    code = `+${code}`;
  }
  
  return `${code}${formatted}`;
};

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, checkUserCodes, generateLoginCodes, user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find(c => c.code === '+255') || countryCodes[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [userVerified, setUserVerified] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');
  const [hasCodes, setHasCodes] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [displayCodes, setDisplayCodes] = useState<string[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  
  // Code input refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [code, setCode] = useState<string[]>(Array(6).fill(''));

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: '',
      countryCode: '+255',
      verificationCode: '',
    },
  });

  const phoneNumber = watch('phoneNumber');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Focus first input when code input shows
  useEffect(() => {
    if (showCodeInput && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [showCodeInput]);

  // Check user existence and codes
  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      const cleanNumber = phoneNumber.replace(/\s/g, '');
      
      if (cleanNumber.length >= 7) {
        setIsChecking(true);
        setCodeError(false);
        
        const fullNumber = formatPhoneNumber(selectedCountry.code, cleanNumber);
        
        try {
          const response = await checkUserCodes(fullNumber);
          
          if (!isMounted) return;
          
          if (response && response.exists === true) {
            setUserExists(true);
            setUserVerified(response.is_verified || false);
            setUserName(response.full_name || 'User');
            setHasCodes(response.has_codes || false);
            setShowCodeInput(true);
            
            if (response.verification_codes && response.verification_codes.length > 0) {
              setDisplayCodes(response.verification_codes);
              setShowCodes(true);
            } else {
              setDisplayCodes([]);
              setShowCodes(false);
            }
          } else {
            setUserExists(false);
            setUserVerified(null);
            setUserName('');
            setHasCodes(null);
            setShowCodeInput(false);
            setCode(Array(6).fill(''));
            setDisplayCodes([]);
            setShowCodes(false);
          }
        } catch (error: any) {
          console.error('Error checking user:', error);
          if (!isMounted) return;
          
          setUserExists(false);
          setUserVerified(null);
          setUserName('');
          setHasCodes(null);
          setShowCodeInput(false);
          setCode(Array(6).fill(''));
          setDisplayCodes([]);
          setShowCodes(false);
        } finally {
          if (isMounted) {
            setIsChecking(false);
          }
        }
      } else {
        if (isMounted) {
          setUserExists(null);
          setUserVerified(null);
          setUserName('');
          setHasCodes(null);
          setShowCodeInput(false);
          setCode(Array(6).fill(''));
          setDisplayCodes([]);
          setShowCodes(false);
        }
      }
    };

    const timeoutId = setTimeout(checkUser, 500);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [phoneNumber, selectedCountry.code]);

  // Handle code input change
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      for (let i = 0; i < pastedCode.length && i < 6; i++) {
        newCode[i] = pastedCode[i];
      }
      setCode(newCode);
      
      const fullCode = newCode.join('');
      setValue('verificationCode', fullCode);
      
      const nextEmptyIndex = newCode.findIndex((val) => val === '');
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
        if (fullCode.length === 6) {
          handleSubmit(onSubmit)();
        }
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    const fullCode = newCode.join('');
    setValue('verificationCode', fullCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (fullCode.length === 6) {
      handleSubmit(onSubmit)();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const pastedCode = pastedData.slice(0, 6).split('');
    const newCode = [...code];
    for (let i = 0; i < pastedCode.length && i < 6; i++) {
      newCode[i] = pastedCode[i];
    }
    setCode(newCode);
    
    const fullCode = newCode.join('');
    setValue('verificationCode', fullCode);
    
    const nextEmptyIndex = newCode.findIndex((val) => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      if (fullCode.length === 6) {
        handleSubmit(onSubmit)();
      }
    }
  };

  // Handlers
  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setValue('countryCode', country.code);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleGenerateCode = async () => {
    const cleanNumber = phoneNumber.replace(/\s/g, '');
    const fullNumber = formatPhoneNumber(selectedCountry.code, cleanNumber);
    
    setIsGeneratingCode(true);
    setCodeError(false);
    try {
      const response = await generateLoginCodes(fullNumber);
      setShowCodeInput(true);
      setHasCodes(true);
      setCode(Array(6).fill(''));
      setValue('verificationCode', '');
      
      if (response.verification_codes) {
        setDisplayCodes(response.verification_codes);
        setShowCodes(true);
        toast.success(t('auth.codeGenerated') || 'New verification codes generated!');
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      toast.error(t('common.error'));
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError('');
      setCodeError(false);
      setIsLoading(true);
      
      const fullPhoneNumber = formatPhoneNumber(data.countryCode, data.phoneNumber);
      
      const response = await login(fullPhoneNumber, data.verificationCode);
      
      toast.success(t('auth.loginSuccess'));
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          t('auth.loginError');
      setLoginError(errorMessage);
      setCodeError(true);
      
      setCode(Array(6).fill(''));
      setValue('verificationCode', '');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isLoadingState = isLoading || authLoading || isGeneratingCode;

  // If user is logged in, show dashboard layout
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <FaChurch className="text-2xl text-cyan-600" />
                <span className="text-xl font-bold text-dark-600">{t('common.appName')}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  {user?.profile?.profile_picture ? (
                    <img
                      src={user.profile.profile_picture}
                      alt={user?.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-white-500 to-white-500 flex items-center justify-center text-white font-bold text-sm border-2 border-cyan-500">
                      {user?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'Student'}</p>
                  </div>
                  <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {user?.profile?.profile_picture ? (
                          <img
                            src={user.profile.profile_picture}
                            alt={user?.full_name || 'User'}
                            className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl border-2 border-cyan-500">
                            {user?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaEnvelope className="mr-1 text-gray-400 text-xs" />
                            {user?.email || 'No email'}
                          </p>
                          <p className="text-xs text-cyan-600 capitalize font-medium mt-0.5">
                            {user?.role || 'Student'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                        <FaUser className="mr-3 text-gray-400" />
                        {t('profile.title')}
                      </Link>
                      <Link to="/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                        <FaCog className="mr-3 text-gray-400" />
                        {t('profile.accountSettings')}
                      </Link>
                      <Link to="/dashboard" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                        <FaHome className="mr-3 text-gray-400" />
                        {t('nav.dashboard')}
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={authLoading}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <FaSignOutAlt className="mr-3 text-red-400" />
                      {authLoading ? t('common.loading') : t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaUserCheck className="text-3xl text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.alreadyLoggedIn')}</h2>
            <p className="text-gray-600 mb-4">{t('auth.redirectingToDashboard')}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              {t('nav.dashboard')} <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50 via-white to-white-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-white-600 to-white-600 px-8 py-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <FaGlobe className="text-3xl text-dark" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('auth.loginTitle')}</h1>
            <p className="text-dark-100 text-sm">{t('common.appName')}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <FaShieldAlt className="text-dark-100 mr-2 text-xs" />
              <span className="text-dark-100 text-xs">{t('auth.verificationLogin')}</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {loginError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg animate-fadeIn flex items-start">
                <FaExclamationTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{loginError}</p>
                <button
                  onClick={() => setLoginError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t('auth.phoneNumber')}
                </label>
                <div className="flex">
                  {/* Country Code Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="h-full px-3 py-3.5 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-2 min-w-[120px]"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                      <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
                        <div className="p-3 border-b border-gray-100">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                              type="text"
                              placeholder={t('auth.searchCountry')}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto max-h-60">
                          {countryCodes
                            .filter(country =>
                              country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              country.code.includes(searchTerm)
                            )
                            .map((country, index) => (
                              <button
                                key={`${country.code}-${index}`}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                className={`w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-blue-50 transition-colors text-left ${
                                  selectedCountry.code === country.code && selectedCountry.country === country.country
                                    ? 'bg-blue-50 border-l-4 border-blue-500'
                                    : ''
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

                  {/* Phone Number Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      {...register('phoneNumber')}
                      type="tel"
                      id="phoneNumber"
                      className={`w-full pl-9 pr-3 py-3.5 border ${
                        errors.phoneNumber ? 'border-red-400' : 'border-gray-200'
                      } rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400 transition-all duration-200 text-lg ${
                        isLoadingState ? 'opacity-60 cursor-not-allowed' : ''
                      } ${userExists ? 'border-green-400' : ''}`}
                      placeholder={t('auth.phonePlaceholder')}
                      disabled={isLoadingState}
                      autoFocus
                    />
                    {isChecking && (
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <FaSpinner className="animate-spin text-gray-400" />
                      </div>
                    )}
                    {userExists && !isChecking && (
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <FaCheckCircle className="text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
                <input type="hidden" {...register('countryCode')} value={selectedCountry.code} />
                {errors.phoneNumber && (
                  <p className="mt-1.5 text-sm text-red-500 animate-fadeIn">{errors.phoneNumber.message}</p>
                )}
                <p className="mt-1.5 text-xs text-gray-400">
                  {t('auth.phoneHelp')}
                </p>
              </div>

              {/* User Status */}
              {isChecking && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
                  <p className="text-sm text-gray-500 flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    {t('auth.checkingAccount')}
                  </p>
                </div>
              )}

              {userExists && userName && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
                  <p className="text-sm text-green-700 flex items-center">
                    <FaUserCheck className="mr-2 text-green-500" />
                    {t('auth.welcomeBack', { name: userName })}
                    {userVerified ? (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1 text-xs" />
                        {t('auth.verified')}
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <FaExclamationTriangle className="mr-1 text-xs" />
                        {t('auth.notVerified')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {hasCodes ? t('auth.enterCode') : t('auth.generateCode')}
                  </p>
                </div>
              )}

              {userExists === false && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg animate-fadeIn">
                  <p className="text-sm text-yellow-700 flex items-center">
                    <FaUserPlus className="mr-2 text-yellow-500" />
                    {t('auth.noAccount')}{' '}
                    <Link to="/join" className="font-semibold text-yellow-800 hover:underline ml-1">
                      {t('auth.createNow')}
                    </Link>
                  </p>
                </div>
              )}

              {/* Verification Code Input */}
              {userExists && showCodeInput && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t('auth.verificationCode')}
                  </label>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex justify-center space-x-3">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          onPaste={handleCodePaste}
                          disabled={isLoadingState}
                          className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            isLoadingState ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
                          } ${
                            codeError ? 'border-red-400 bg-red-50' :
                            digit ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                          }`}
                          autoFocus={index === 0 && showCodeInput}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between w-full mt-2">
                      <button
                        type="button"
                        onClick={handleGenerateCode}
                        disabled={isGeneratingCode}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors disabled:opacity-50"
                      >
                        {isGeneratingCode ? (
                          <>
                            <FaSpinner className="animate-spin mr-1" />
                            {t('auth.generating')}
                          </>
                        ) : (
                          <>
                            <FaSync className="mr-1" />
                            {t('auth.generateNewCodes')}
                          </>
                        )}
                      </button>
                      
                      <p className="text-xs text-gray-400">
                        {t('auth.enterSixDigitCode')}
                      </p>
                    </div>
                  </div>

                  {/* Display the available codes */}
                  {showCodes && displayCodes.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                        <FaKey className="mr-2" />
                        {t('auth.yourCodes')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {displayCodes.map((code, index) => (
                          <div
                            key={index}
                            className="px-3 py-1 bg-white border border-blue-300 rounded-lg font-mono text-lg font-bold text-blue-700 shadow-sm"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        {t('auth.useAnyCode')}
                      </p>
                    </div>
                  )}
                  
                  <input type="hidden" {...register('verificationCode')} />
                  {errors.verificationCode && (
                    <p className="mt-1.5 text-sm text-red-500 animate-fadeIn">{errors.verificationCode.message}</p>
                  )}
                </div>
              )}

              {userExists && !showCodeInput && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={isGeneratingCode}
                    className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isGeneratingCode ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        {t('auth.generatingCode')}
                      </>
                    ) : (
                      <>
                        <FaKey className="mr-2" />
                        {t('auth.generateVerificationCode')}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              {userExists && showCodeInput && code.every(d => d !== '') && (
                <button
                  type="submit"
                  disabled={isLoadingState}
                  className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                    !isLoadingState
                      ? 'hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {isLoadingState ? (
                    <>
                      <FaSpinner className="animate-spin mr-3" />
                      {t('auth.signingIn')}
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-3" />
                      {t('auth.signIn')}
                    </>
                  )}
                </button>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {t('auth.noAccount')}{' '}
                  <Link to="/join" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center transition-colors">
                    {t('auth.createOneNow')} <FaArrowRight className="ml-1 text-xs" />
                  </Link>
                </p>
              </div>

              <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span className="inline-flex items-center">
                  <FaShieldAlt className="mr-1 text-gray-300" />
                  {t('auth.secureLogin')}
                </span>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">© 2026 {t('common.appName')}</p>
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
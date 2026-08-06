// src/pages/auth/VerifyAccount.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCopy, 
  FaEye, 
  FaEyeSlash,
  FaSync,
  FaClock,
  FaKey,
  FaShieldAlt,
  FaArrowLeft,
  FaEnvelope,
  FaBolt,
  FaClipboard,
  FaInfoCircle,
  FaExclamationTriangle,
 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const verifySchema = z.object({
  verificationCode: z.string().length(6, 'Verification code must be 6 digits'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

const VerifyAccount: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    verifyAccount, 
    resendVerification, 
    fetchVerificationCodes, 
    isLoading: authLoading 
  } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [mockCode, setMockCode] = useState<string>('');
  const [isCodeVisible, setIsCodeVisible] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [allCodes, setAllCodes] = useState<string[]>([]);
  const [codesReceived, setCodesReceived] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      verificationCode: '',
    },
  });

  const verificationCode = watch('verificationCode');

  // Function to fetch codes from backend
  const fetchCodes = async (phone: string) => {
    if (!phone || isFetching) return;
    
    setIsFetching(true);
    try {
      console.log('Fetching codes for phone:', phone);
      const response = await fetchVerificationCodes(phone);
      console.log('Fetch codes response:', response);
      
      if (response.is_verified) {
        toast.success('Account is already verified!');
        navigate('/dashboard');
        return;
      }
      
      if (response.verification_codes && response.verification_codes.length > 0) {
        setAllCodes(response.verification_codes);
        const code = response.verification_codes[0];
        setMockCode(code);
        setValue('verificationCode', code);
        setCodesReceived(true);
        toast.success('Verification codes loaded!');
      } else {
        toast.error('No verification codes found. Please register again.');
        navigate('/join');
      }
    } catch (error: any) {
      console.error('Error fetching codes:', error);
      const errorMsg = error?.response?.data?.error || 'Failed to fetch verification codes';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsFetching(false);
      setHasInitialized(true);
    }
  };

  // Initialize component
  useEffect(() => {
    const init = async () => {
      const state = location.state as { 
        phoneNumber?: string;
        codes?: string[];
      };
      
      let phone = '';
      
      // Get phone number from state or localStorage
      if (state?.phoneNumber) {
        phone = state.phoneNumber;
        setPhoneNumber(phone);
      } else {
        const regData = localStorage.getItem('registration_data');
        if (regData) {
          try {
            const data = JSON.parse(regData);
            phone = data.phoneNumber;
            setPhoneNumber(phone);
          } catch (e) {
            console.error('Error parsing registration data:', e);
          }
        }
      }
      
      // If no phone number, redirect to register
      if (!phone) {
        toast.error('Please register first');
        navigate('/join');
        return;
      }
      
      // Check if we have codes in state or localStorage
      let hasCodes = false;
      if (state?.codes && state.codes.length > 0) {
        setAllCodes(state.codes);
        const code = state.codes[0];
        setMockCode(code);
        setValue('verificationCode', code);
        setCodesReceived(true);
        hasCodes = true;
        toast.success('Verification codes loaded!');
        setHasInitialized(true);
      } else {
        const regData = localStorage.getItem('registration_data');
        if (regData) {
          try {
            const data = JSON.parse(regData);
            if (data.verificationCodes && data.verificationCodes.length > 0) {
              setAllCodes(data.verificationCodes);
              const code = data.verificationCodes[0];
              setMockCode(code);
              setValue('verificationCode', code);
              setCodesReceived(true);
              hasCodes = true;
              toast.success('Verification codes loaded!');
              setHasInitialized(true);
            }
          } catch (e) {
            console.error('Error parsing registration data:', e);
          }
        }
      }
      
      // If no codes found, fetch from backend
      if (!hasCodes && phone) {
        await fetchCodes(phone);
      } else {
        setHasInitialized(true);
      }
    };
    
    init();
  }, [location, navigate, setValue]);

  // Timer for code expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyCode = (code: string) => {
    if (code && code.length === 6) {
      navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    }
  };

  const copyAllCodes = () => {
    if (allCodes.length > 0) {
      const codesString = allCodes.join(', ');
      navigator.clipboard.writeText(codesString);
      toast.success('All codes copied!');
    }
  };

  const onSubmit = async (data: VerifyFormData) => {
    setError('');
    setIsLoading(true);
    
    try {
      await verifyAccount(phoneNumber, data.verificationCode);
      setIsVerified(true);
      
      // Clear registration data from localStorage
      localStorage.removeItem('registration_data');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Invalid verification code. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) {
      toast.error(`Please wait ${formatTime(timeLeft)} before requesting a new code`);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await resendVerification(phoneNumber);
      if (response.verification_codes) {
        setAllCodes(response.verification_codes);
        const code = response.verification_codes[0];
        setMockCode(code);
        setValue('verificationCode', code);
        setCodesReceived(true);
        setTimeLeft(300);
        toast.success('New verification codes generated!');
      }
    } catch (error) {
      toast.error('Failed to generate new verification codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCodes = async () => {
    if (timeLeft > 0) {
      toast.error(`Please wait ${formatTime(timeLeft)} before refreshing codes`);
      return;
    }
    
    await fetchCodes(phoneNumber);
    setTimeLeft(300);
  };

  const autoVerify = () => {
    if (mockCode) {
      setValue('verificationCode', mockCode);
      toast('Auto-filling verification code...', { icon: <FaBolt className="text-yellow-500" /> });
      setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 500);
    } else {
      toast.error('No verification code available');
    }
  };

  const isLoadingState = isLoading || authLoading || isFetching;

  // Show loading state while initializing
  if (!hasInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading verification details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <FaCheckCircle className="text-3xl text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Verify Your Account</h1>
            <p className="text-green-100 text-sm">Use one of the verification codes below to activate your account</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
                <FaTimesCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {isFetching ? (
              <div className="mb-6 p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <FaSpinner className="animate-spin text-4xl text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Fetching your verification codes...</p>
              </div>
            ) : (
              <>
                {/* Verification Codes Card */}
                {codesReceived && allCodes.length > 0 && (
                  <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <FaKey className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-green-700">Your Verification Codes</h3>
                          <p className="text-xs text-gray-500">Use any of these 6-digit codes to verify your account</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleRefreshCodes}
                          disabled={timeLeft > 0 || isLoadingState}
                          className="text-xs text-green-600 hover:text-green-700 bg-white px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Refresh codes"
                        >
                          <FaSync className="mr-1" />
                          Refresh
                        </button>
                        <button
                          type="button"
                          onClick={copyAllCodes}
                          className="text-xs text-green-600 hover:text-green-700 bg-white px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-50 transition-colors flex items-center"
                        >
                          <FaClipboard className="mr-1" />
                          Copy All
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCodeVisible(!isCodeVisible)}
                          className="text-xs text-green-600 hover:text-green-700 bg-white px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-50 transition-colors flex items-center"
                        >
                          {isCodeVisible ? <FaEye className="mr-1" /> : <FaEyeSlash className="mr-1" />}
                          {isCodeVisible ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {/* Grid of verification codes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {allCodes.map((code, index) => (
                        <div
                          key={index}
                          className={`bg-white rounded-lg p-4 text-center border-2 transition-all hover:shadow-md cursor-pointer ${
                            code === mockCode 
                              ? 'border-green-500 shadow-lg shadow-green-100 bg-gradient-to-br from-green-50 to-white' 
                              : 'border-green-100 hover:border-green-300'
                          }`}
                          onClick={() => {
                            setMockCode(code);
                            setValue('verificationCode', code);
                            toast(`Using code: ${code}`, { icon: <FaKey className="text-green-500" /> });
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div className={`text-2xl font-mono font-bold tracking-wider ${
                              code === mockCode ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {isCodeVisible ? code : '●●●●●●'}
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyCode(code);
                                }}
                                className="text-xs text-gray-400 hover:text-green-600 transition-colors flex items-center"
                              >
                                <FaCopy className="mr-1" />
                                Copy
                              </button>
                              {code === mockCode && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                                  <FaCheckCircle className="mr-1 text-xs" />
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-[10px] text-gray-400">
                              Code {index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Info about codes */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 border-t border-green-100 pt-3">
                      <div className="flex items-center space-x-2">
                        <FaInfoCircle className="text-green-400" />
                        <span>Click any code to select it, or manually type below</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-green-400" />
                        <span className={timeLeft < 60 ? 'text-red-500 font-semibold' : ''}>
                          {formatTime(timeLeft)}
                        </span>
                        <span>remaining</span>
                      </div>
                    </div>

                    {allCodes.length > 1 && (
                      <div className="mt-3 flex items-start space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <FaExclamationTriangle className="text-yellow-600 text-sm mt-0.5" />
                        <p className="text-xs text-yellow-700">
                          <strong>Tip:</strong> You have {allCodes.length} verification codes available. 
                          Any one of them can be used to verify your account.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Phone number and timer */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-1.5 rounded-full">
                      <FaEnvelope className="text-blue-600 text-xs" />
                    </div>
                    <span className="text-gray-700 font-medium">{phoneNumber}</span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-green-600 flex items-center">
                      <FaCheckCircle className="mr-1" />
                      {codesReceived ? 'Codes ready' : 'Waiting for codes...'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <FaClock className="text-gray-400" />
                    <span className={timeLeft < 60 ? 'text-red-500 font-semibold' : ''}>
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs text-gray-400">remaining</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Enter Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-gray-400" />
                      </div>
                      <input
                        {...register('verificationCode')}
                        type="text"
                        id="verificationCode"
                        maxLength={6}
                        className={`w-full pl-10 pr-12 py-3.5 border ${
                          errors.verificationCode ? 'border-red-400' : 'border-gray-200'
                        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 text-center text-2xl font-mono tracking-widest transition-all duration-200 ${
                          isLoadingState ? 'opacity-60 cursor-not-allowed' : ''
                        } ${verificationCode?.length === 6 ? 'border-green-400 bg-green-50' : ''}`}
                        placeholder="000000"
                        disabled={isLoadingState}
                        autoFocus
                      />
                      {verificationCode?.length === 6 && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FaCheckCircle className="text-green-500 text-xl" />
                        </div>
                      )}
                    </div>
                    {errors.verificationCode && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.verificationCode.message}</p>
                    )}
                    <p className="mt-1.5 text-xs text-gray-400 flex items-center">
                      <FaInfoCircle className="mr-1" />
                      Type the 6-digit code from the card above, or click a code to auto-fill
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={isLoadingState || !codesReceived}
                      className={`flex-1 flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
                        isLoadingState || !codesReceived ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      {isLoadingState ? (
                        <>
                          <FaSpinner className="animate-spin mr-3" />
                          {isFetching ? 'Fetching Codes...' : 'Verifying...'}
                        </>
                      ) : isVerified ? (
                        <>
                          <FaCheckCircle className="mr-3" />
                          Verified!
                        </>
                      ) : (
                        <>
                          <FaShieldAlt className="mr-3" />
                          Verify Account
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={autoVerify}
                      className="px-6 py-3.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
                      disabled={isLoadingState || !mockCode}
                    >
                      <FaBolt className="mr-2" />
                      Auto-Verify
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={timeLeft > 0 || isLoadingState}
                      className={`text-sm font-medium transition-colors flex items-center ${
                        timeLeft > 0 || isLoadingState
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-green-600 hover:text-green-700 hover:underline'
                      }`}
                    >
                      {timeLeft > 0 ? (
                        <>
                          <FaClock className="mr-2" />
                          New codes in {formatTime(timeLeft)}
                        </>
                      ) : (
                        <>
                          <FaSync className="mr-2" />
                          Generate New Codes
                        </>
                      )}
                    </button>

                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center transition-colors">
                      <FaArrowLeft className="mr-2" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {isVerified && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl transform scale-100">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-5xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Successful!</h2>
              <p className="text-gray-600 mb-4">Your account has been verified. Welcome to Digital Evangelism!</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <FaSpinner className="animate-spin" />
                <span>Redirecting to dashboard...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
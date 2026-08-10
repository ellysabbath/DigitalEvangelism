// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dis from '../assets/dis.jpg';
import disa from '../assets/disa.jpg';
import { 
  FaSpinner, FaCheckCircle, FaTimesCircle, 
  FaEnvelope, FaUser, FaArrowRight, FaBell,
  FaNewspaper, FaPray, 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================
interface SubscriptionFormData {
  name: string;
  email: string;
  subscription_type: string;
}

interface SubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    email: string;
    name: string;
    subscription_type: string;
  };
}

// ============================================
// MAIN COMPONENT
// ============================================
const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    email: '',
    subscription_type: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  // Get translated subscription types
  const subscriptionTypes = [
    { value: 'newsletter', label: t('home.newsletterTypes.newsletter') },
    { value: 'weekly_digest', label: t('home.newsletterTypes.weekly_digest') },
    { value: 'prayer_updates', label: t('home.newsletterTypes.prayer_updates') },
    { value: 'event_notifications', label: t('home.newsletterTypes.event_notifications') },
    { value: 'sermon_updates', label: t('home.newsletterTypes.sermon_updates') },
    { value: 'all', label: t('home.newsletterTypes.all') },
  ];

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t('auth.fullName') + ' ' + t('common.error'));
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error(t('auth.email') + ' ' + t('common.error'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t('common.error'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/subscriptions/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subscription_type: formData.subscription_type,
        }),
      });

      const data: SubscriptionResponse = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          subscription_type: 'all',
        });
        toast.success(t('home.thankYou'));
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        const errorMsg = data.message || t('common.error');
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      const errorMsg = err.message || t('common.error');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Ad Banner 1 */}
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
        <a href="#" className="block">
          <img
            src={dis}
            alt={t('home.digitalEvangelism')}
            className="w-full rounded-lg hover:opacity-90 transition-opacity duration-300"
          />
        </a>
      </div>

      {/* Ad Banner 2 */}
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
        <a href="#" className="block">
          <img
            src={disa}
            alt={t('home.reaching')}
            className="w-full rounded-lg hover:opacity-90 transition-opacity duration-300"
          />
        </a>
      </div>

      {/* Subscription Form */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#0e5488]">
        <div className="flex items-center space-x-2 mb-3">
          <FaBell className="text-[#0e5488] text-xl" />
          <h4 className="text-lg font-semibold text-[#0e5488]">
            {t('home.subscribe').toUpperCase()}
          </h4>
        </div>
        
        {isSuccess ? (
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <p className="text-green-600 font-semibold text-lg">{t('home.thankYou')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {t('home.checkEmail')}
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-4 text-sm text-[#0e5488] hover:text-[#002256] font-medium transition-colors"
            >
              {t('home.subscribeAnother')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 animate-fadeIn">
                <FaTimesCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('home.name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400 text-sm" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e5488] focus:border-transparent transition-all duration-200"
                  placeholder={t('home.name')}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('home.email')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400 text-sm" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e5488] focus:border-transparent transition-all duration-200"
                  placeholder={t('home.email')}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowPreferences(!showPreferences)}
                className="text-sm text-[#0e5488] hover:text-[#002256] font-medium flex items-center transition-colors"
              >
                <FaNewspaper className="mr-1 text-xs" />
                {showPreferences ? t('home.hidePreferences') : t('home.preferences')}
              </button>
            </div>

            {showPreferences && (
              <div className="animate-fadeIn">
                <label htmlFor="subscription_type" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('home.subscriptionType')}
                </label>
                <select
                  id="subscription_type"
                  name="subscription_type"
                  value={formData.subscription_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e5488] focus:border-transparent bg-white transition-all duration-200"
                  disabled={isLoading}
                >
                  {subscriptionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r from-[#0e5488] to-[#002256] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <span>{t('home.subscribeNow')}</span>
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center">
              <FaPray className="mr-1 text-gray-400" />
              {t('home.joinCommunity')}
            </p>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
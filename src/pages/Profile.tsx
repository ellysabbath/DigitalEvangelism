// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/context/AuthContext';
import { useAdmin } from '../auth/context/AdminContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaChurch, 
  FaMapMarkerAlt, FaCity, FaStreetView, FaInfoCircle,
  FaEdit, FaSave, FaTimes, FaCamera, FaUserEdit,
  FaGraduationCap, FaAward,
  FaCheckCircle, FaSpinner, FaArrowLeft, FaCalendarAlt,
  FaUserCircle, FaCog, FaSignOutAlt, FaBook, FaCertificate
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface UserStats {
  totalExams: number;
  completedExams: number;
  certificatesEarned: number;
  groupsJoined: number;
  totalSermons: number;
  totalStudents: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateProfile, updateProfilePicture, logout, isLoading: authLoading } = useAuth();
  const { 
    students, 
    sermons, 
    examSubmissions,
    loadingStudents,
    loadingSermons,
    loadingExams
  } = useAdmin();
  
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    church_name: '',
    region: '',
    city: '',
    street: '',
    bio: '',
  });

  // ============================================
  // POPULATE FORM WITH USER DATA
  // ============================================

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        church_name: user.church_name || '',
        region: user.region || '',
        city: user.city || '',
        street: user.street || '',
        bio: user.profile?.bio || '',
      });
    }
  }, [user]);

  // ============================================
  // CALCULATE USER STATS FROM THEIR DATA
  // ============================================

  const getUserStats = (): UserStats => {
    const userSermons = sermons?.filter((s: any) => 
      s.author === user?.id || 
      s.author_name === user?.full_name
    ) || [];

    const userStudents = students?.filter((s: any) => 
      s.assigned_evangelist === user?.id
    ) || [];

    const userExams = examSubmissions?.filter((e: any) => 
      e.student === user?.id
    ) || [];

    const gradedExams = userExams.filter((e: any) => 
      e.status === 'graded' || e.status === 'reviewed'
    );

    return {
      totalExams: userExams.length || 0,
      completedExams: gradedExams.length || 0,
      certificatesEarned: userStudents.reduce((acc: number, s: any) => 
        acc + (s.certificates_earned || 0), 0
      ) || 0,
      groupsJoined: 0,
      totalSermons: userSermons.length || 0,
      totalStudents: userStudents.length || 0,
    };
  };

  const stats = getUserStats();

  // ============================================
  // HANDLERS
  // ============================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateProfile({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        church_name: formData.church_name,
        region: formData.region,
        city: formData.city,
        street: formData.street,
        profile: {
          bio: formData.bio,
        },
      });
      
      toast.success(t('profile.profileUpdated'));
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.response?.data?.error || t('profile.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.imageTypeError'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageSizeError'));
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateProfilePicture(base64String);
        toast.success(t('profile.pictureUpdated'));
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error(t('profile.readError'));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error(error?.response?.data?.error || t('profile.pictureError'));
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ============================================
  // HELPERS
  // ============================================

  const getUserInitials = () => {
    if (!user?.full_name) return '?';
    return user.full_name
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfilePicture = (): string | undefined => {
    if (user?.profile?.profile_picture) {
      return user.profile.profile_picture;
    }
    return undefined;
  };

  const getRoleDisplayName = () => {
    const role = user?.role || 'student';
    const names: Record<string, string> = {
      admin: t('dashboard.administrator'),
      evangelist: t('dashboard.evangelist'),
      student: t('dashboard.student'),
      super_admin: t('dashboard.superAdmin'),
      church_admin: t('dashboard.churchAdmin')
    };
    return names[role] || t('dashboard.member');
  };

  const getMemberSince = () => {
    if (user?.date_joined) {
      return new Date(user.date_joined).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return t('profile.na');
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (authLoading || loadingStudents || loadingSermons || loadingExams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaUserCircle className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('profile.loginToView')}</p>
          <Link to="/login" className="mt-4 inline-block text-cyan-600 hover:text-cyan-700 font-medium">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">{t('profile.title')}</h1>
            <p className="mt-1 text-gray-600">{t('profile.subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            {isEditing ? (
              <>
                <FaTimes />
                <span>{t('common.cancel')}</span>
              </>
            ) : (
              <>
                <FaEdit />
                <span>{t('profile.editProfile')}</span>
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaSignOutAlt />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-white-600 to-white-600 rounded-2xl p-8 text-dark">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-6xl font-bold border-4 border-white overflow-hidden">
              {isUploading ? (
                <FaSpinner className="animate-spin text-4xl" />
              ) : getProfilePicture() ? (
                <img
                  src={getProfilePicture()}
                  alt={user.full_name || 'User'}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <span>{getUserInitials()}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-dark-600 hover:bg-cyan-50 transition-colors cursor-pointer shadow-md">
              <FaCamera className="text-sm" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-serif font-bold">{user.full_name || 'User'}</h2>
            <p className="text-dark-100 capitalize">{getRoleDisplayName()}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-dark-100">
              <span className="flex items-center space-x-1">
                <FaChurch className="text-xs" />
                <span>{user.church_name || t('profile.noChurch')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaMapMarkerAlt className="text-xs" />
                <span>{user.city || t('profile.unknown')}, {user.region || ''}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaCalendarAlt className="text-xs" />
                <span>{t('profile.memberSince')} {getMemberSince()}</span>
              </span>
            </div>
            {user.profile?.bio && (
              <p className="mt-3 text-dark-100 text-sm max-w-md">{user.profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('profile.totalExams')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaGraduationCap className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('profile.completed')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedExams}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('profile.certificates')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.certificatesEarned}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaAward className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('profile.sermons')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSermons}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaBook className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUserEdit className="mr-2 text-cyan-500" />
            {t('profile.personalInfo')}
          </h3>
          {isEditing && (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSave />
              )}
              <span>{isSaving ? t('common.loading') : t('profile.saveChanges')}</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('auth.fullName')}</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    !isEditing && 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('auth.email')}</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    !isEditing && 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('auth.phone')}</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    !isEditing && 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Church Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('auth.churchName')}</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaChurch className="text-gray-400" />
                </div>
                <input
                  name="church_name"
                  value={formData.church_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    !isEditing && 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('auth.region')}</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    !isEditing && 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('auth.city')}</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCity className="text-gray-400" />
                </div>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    !isEditing && 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Street */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{t('auth.streetAddress')}</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaStreetView className="text-gray-400" />
                </div>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    !isEditing && 'bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{t('profile.bio')}</label>
              <div className="mt-1 relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FaInfoCircle className="text-gray-400" />
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    !isEditing && 'bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder={t('profile.bioPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Edit Mode Hint */}
          {!isEditing && (
            <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200 text-center">
              <p className="text-sm text-cyan-700">
                <FaEdit className="inline mr-2" />
                {t('profile.editHint')}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaCog className="mr-2 text-cyan-500" />
          {t('profile.accountActions')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/settings"
            className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaCog className="text-2xl text-gray-500 mr-4" />
            <div>
              <p className="font-medium text-gray-900">{t('profile.settings')}</p>
              <p className="text-sm text-gray-500">{t('profile.settingsDesc')}</p>
            </div>
          </Link>
          <Link
            to="/student/exams"
            className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaBook className="text-2xl text-gray-500 mr-4" />
            <div>
              <p className="font-medium text-gray-900">{t('profile.sermonsAndExams')}</p>
              <p className="text-sm text-gray-500">{t('profile.sermonsAndExamsDesc')}</p>
            </div>
          </Link>
          <Link
            to="/certificates"
            className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaCertificate className="text-2xl text-gray-500 mr-4" />
            <div>
              <p className="font-medium text-gray-900">{t('profile.myCertificates')}</p>
              <p className="text-sm text-gray-500">{t('profile.myCertificatesDesc')}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="text-2xl text-red-500 mr-4" />
            <div>
              <p className="font-medium text-red-700">{t('nav.logout')}</p>
              <p className="text-sm text-red-500">{t('profile.logoutDesc')}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
// src/pages/Profile.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { 
  FaUser, FaEnvelope, FaPhone, FaChurch, 
  FaMapMarkerAlt, FaCity, FaStreetView, FaInfoCircle,
  FaEdit, FaSave, FaTimes, FaCamera, FaUserEdit,
  FaGraduationCap, FaAward, FaLemon, FaUsers,
  FaCheckCircle
} from 'react-icons/fa';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    churchName: user?.churchName || '',
    region: user?.region || '',
    city: user?.city || '',
    street: user?.street || '',
    bio: user?.bio || '',
  });

  const stats = {
    totalExams: 12,
    completedExams: 8,
    certificatesEarned: 5,
    groupsJoined: 3,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update profile logic
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your personal information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-primary flex items-center space-x-2"
        >
          {isEditing ? (
            <>
              <FaTimes />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <FaEdit />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-6xl font-bold border-4 border-white">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-primary-600 hover:bg-primary-50 transition-colors">
              <FaCamera />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-serif font-bold">{user?.fullName}</h2>
            <p className="text-primary-100 capitalize">{user?.role}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-primary-100">
              <span className="flex items-center space-x-1">
                <FaChurch className="text-xs" />
                <span>{user?.churchName || 'No church specified'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaMapMarkerAlt className="text-xs" />
                <span>{user?.city || 'Unknown'}, {user?.region || ''}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExams}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FaGraduationCap className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedExams}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.certificatesEarned}</p>
            </div>
            <div className="p-3 bg-gold-100 dark:bg-yellow-900/30 rounded-full">
              <FaAward className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.groupsJoined}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <FaUsers className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
          {isEditing && (
            <button
              onClick={handleSubmit}
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              <FaSave />
              <span>Save Changes</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field pl-10 ${!isEditing && 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field pl-10 ${!isEditing && 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field pl-10 ${!isEditing && 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Church Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaChurch className="text-gray-400" />
                </div>
                <input
                  name="churchName"
                  value={formData.churchName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field pl-10 ${!isEditing && 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field pl-10 ${!isEditing && 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City/Village</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCity className="text-gray-400" />
                </div>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field pl-10 ${!isEditing && 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'}`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaStreetView className="text-gray-400" />
                </div>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-field pl-10 ${!isEditing && 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'}`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                  <FaInfoCircle className="text-gray-400" />
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`input-field pl-10 ${!isEditing && 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'}`}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
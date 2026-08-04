// src/pages/admin/CreateGroup.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaSpinner, FaSave, FaUsers, 
  FaUserGraduate, FaChurch, FaUserTie, FaPlus,
  FaTrash, FaSearch, FaCheckCircle, FaTimesCircle,
  FaUserPlus, FaEnvelope, FaPhone
} from 'react-icons/fa';
import { useAdmin } from '../../auth/context/AdminContext';
import { groupsAPI } from '../../services/api';

import toast from 'react-hot-toast';

// ============================================
// CONFIRMATION MODAL
// ============================================
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <FaCheckCircle className="text-blue-600 text-4xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CREATE GROUP COMPONENT
// ============================================
const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const { users, refreshAllGroups, loading } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  // ========== FORM STATE ==========
  const [formData, setFormData] = useState({
    name: '',
    type: 'student' as 'evangelist' | 'student' | 'mixed',
    description: '',
    leader: null as number | null,
    members: [] as number[],
    is_active: true,
  });

  // ========== FILTER USERS ==========
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.phone_number?.includes(memberSearchQuery);
    // Only show users who are not already in the group
    return matchesSearch && !formData.members.includes(user.id);
  });

  // ========== HANDLERS ==========
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleLeaderSelect = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      leader: prev.leader === userId ? null : userId,
    }));
  };

  const handleAddMember = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, userId],
    }));
    setMemberSearchQuery('');
    toast.success('Member added to group');
  };

  const handleRemoveMember = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(id => id !== userId),
    }));
    toast.info('Member removed from group');
  };

  const getMemberName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.phone_number || 'Unknown';
  };

  const getMemberEmail = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.email || '';
  };

  const getMemberPhone = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.phone_number || '';
  };

  const getLeaderName = (userId: number | null) => {
    if (!userId) return 'None';
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.phone_number || 'Unknown';
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'evangelist':
        return 'Evangelist Group';
      case 'student':
        return 'Student Group';
      case 'mixed':
        return 'Mixed Group';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'evangelist':
        return <FaChurch className="text-blue-500" />;
      case 'student':
        return <FaUserGraduate className="text-green-500" />;
      case 'mixed':
        return <FaUsers className="text-purple-500" />;
      default:
        return <FaUsers className="text-gray-500" />;
    }
  };

  // ========== SUBMIT ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (!formData.leader) {
      toast.error('Please select a group leader');
      return;
    }

    // Prepare data for backend
    const groupData = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim(),
      leader: formData.leader,
      members: formData.members,
      is_active: formData.is_active,
    };

    // Show confirmation
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const groupData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        leader: formData.leader,
        members: formData.members,
        is_active: formData.is_active,
      };

      console.log('Creating group:', groupData);
      
      const response = await groupsAPI.create(groupData);
      console.log('Group created:', response.data);
      
      toast.success(`Group "${formData.name}" created successfully!`);
      
      // Refresh groups list
      await refreshAllGroups();
      
      // Navigate back to groups management
      navigate('/admin/groups');
    } catch (error: any) {
      console.error('Error creating group:', error);
      const message = error.response?.data?.error || 'Failed to create group. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RENDER ==========
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        title="Create Group"
        message={`Are you sure you want to create the group "${formData.name}" with ${formData.members.length} member(s)?`}
        confirmText="Create Group"
        isLoading={isLoading}
      />

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/groups')}
          className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
          title="Back to Groups"
        >
          <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Group</h1>
          <p className="text-sm text-gray-600">Add a new evangelist or student group</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUsers className="mr-2 text-cyan-500" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Enter group name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Group Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                  required
                  disabled={isLoading}
                >
                  <option value="evangelist">Evangelist Group</option>
                  <option value="student">Student Group</option>
                  <option value="mixed">Mixed Group</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Describe the purpose of this group..."
                disabled={isLoading}
              />
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                disabled={isLoading}
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (group is available for use)
              </label>
            </div>
          </div>

          {/* Leader Selection */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUserTie className="mr-2 text-purple-500" />
              Select Leader <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-500 mb-3">Select a user to be the leader of this group</p>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
              {users.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No users available</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.leader === user.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleLeaderSelect(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaEnvelope className="mr-1" /> {user.email || 'No email'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaPhone className="mr-1" /> {user.phone_number || 'No phone'}
                        </p>
                        <p className="text-xs text-gray-400">Role: {user.role || 'User'}</p>
                      </div>
                      {formData.leader === user.id && (
                        <FaCheckCircle className="text-purple-500 text-xl" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {formData.leader && (
              <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">
                  <strong>Selected Leader:</strong> {getLeaderName(formData.leader)}
                </p>
              </div>
            )}
          </div>

          {/* Members Selection */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUserPlus className="mr-2 text-green-500" />
              Add Members
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Add users to this group. {formData.members.length} member(s) selected.
            </p>

            {/* Add Member Search */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowMemberSearch(!showMemberSearch)}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center"
              >
                <FaPlus className="mr-1" />
                {showMemberSearch ? 'Close Member Search' : 'Add Members'}
              </button>

              {showMemberSearch && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="relative mb-3">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email or phone..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {filteredUsers.length === 0 ? (
                      <p className="text-center text-gray-500 py-2">No users found</p>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="p-2 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                          onClick={() => handleAddMember(user.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                            </div>
                            <FaUserPlus className="text-green-500" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Members List */}
            {formData.members.length > 0 ? (
              <div className="space-y-2">
                {formData.members.map((userId) => (
                  <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{getMemberName(userId)}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FaEnvelope className="mr-1" /> {getMemberEmail(userId) || 'No email'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FaPhone className="mr-1" /> {getMemberPhone(userId) || 'No phone'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(userId)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-gray-500 text-sm">No members added yet</p>
                <p className="text-xs text-gray-400">Use the "Add Members" button above to add users</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium text-gray-700">Name:</span> {formData.name || '(Not set)'}</p>
              <p><span className="font-medium text-gray-700">Type:</span> {getTypeLabel(formData.type)}</p>
              <p><span className="font-medium text-gray-700">Leader:</span> {getLeaderName(formData.leader)}</p>
              <p><span className="font-medium text-gray-700">Members:</span> {formData.members.length} member(s)</p>
              <p><span className="font-medium text-gray-700">Status:</span> {formData.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 ${
                isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-3" />
                  Creating Group...
                </>
              ) : (
                <>
                  <FaSave className="mr-3" />
                  Create Group
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/groups')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
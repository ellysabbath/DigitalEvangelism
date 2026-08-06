// src/pages/admin/EditGroup.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft, FaSpinner, FaSave, FaUsers, 
  FaUserTie, FaPlus,
  FaTrash, FaSearch, FaCheckCircle, FaTimesCircle,
  FaUserPlus, FaEnvelope, FaPhone, FaEdit,
  FaExclamationTriangle
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
  type?: 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getStyles = () => {
    switch(type) {
      case 'danger':
        return {
          icon: <FaExclamationTriangle className="text-red-600 text-4xl" />,
          button: 'bg-red-600 hover:bg-red-700',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="text-yellow-600 text-4xl" />,
          button: 'bg-yellow-600 hover:bg-yellow-700',
          border: 'border-yellow-200'
        };
      case 'success':
        return {
          icon: <FaCheckCircle className="text-green-600 text-4xl" />,
          button: 'bg-green-600 hover:bg-green-700',
          border: 'border-green-200'
        };
      default:
        return {
          icon: <FaEdit className="text-blue-600 text-4xl" />,
          button: 'bg-blue-600 hover:bg-blue-700',
          border: 'border-blue-200'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className={`p-6 border-b ${styles.border}`}>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {styles.icon}
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
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center ${styles.button}`}
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
// EDIT GROUP COMPONENT
// ============================================
const EditGroup: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { users, refreshAllGroups, refreshUsers, loadingUsers, removeGroupMember } = useAdmin();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // ========== CONFIRMATION MODAL STATE FOR REMOVE MEMBER ==========
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  });

  // ========== FORM STATE ==========
  const [formData, setFormData] = useState({
    name: '',
    type: 'student' as 'evangelist' | 'student' | 'mixed',
    description: '',
    leader: null as number | null,
    members: [] as number[],
    is_active: true,
  });

  // ========== FETCH GROUP ==========
  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) {
        setError('Group ID not provided');
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      setError(null);
      
      try {
        // First, ensure users are loaded
        if (users.length === 0 && !loadingUsers) {
          await refreshUsers();
        }

        const response = await groupsAPI.get(parseInt(id));
        const data = response.data;
        
        const memberIds = data.members?.map((m: any) => m.id) || [];
        
        setFormData({
          name: data.name || '',
          type: data.type || 'student',
          description: data.description || '',
          leader: data.leader || null,
          members: memberIds,
          is_active: data.is_active !== undefined ? data.is_active : true,
        });
      } catch (err: any) {
        console.error('Error fetching group:', err);
        setError(err.response?.data?.error || 'Failed to load group');
        toast.error('Failed to load group');
      } finally {
        setIsFetching(false);
      }
    };

    fetchGroup();
  }, [id, users.length, loadingUsers, refreshUsers]);

  // ========== FILTER USERS ==========
  // Filter out users who are already in the group
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.phone_number?.includes(memberSearchQuery) ||
      user.id?.toString().includes(memberSearchQuery);
    // Exclude users already in the group
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
    const user = users.find(u => u.id === userId);
    if (!user) {
      toast.error('User not found');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, userId],
    }));
    setMemberSearchQuery('');
    toast.success(`${user.full_name || 'User'} added to group`);
    
    // Close search if no more users to add
    const remainingUsers = users.filter(u => 
      !formData.members.includes(u.id) && u.id !== userId
    );
    if (remainingUsers.length === 0) {
      setShowMemberSearch(false);
    }
  };

  // ========== REMOVE MEMBER WITH CONFIRMATION ==========
  const handleRemoveMemberClick = (userId: number) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.full_name || 'User';
    
    setRemoveMemberConfirm({
      isOpen: true,
      userId: userId,
      userName: userName,
    });
  };

  const handleConfirmRemoveMember = async () => {
    if (!removeMemberConfirm.userId || !id) {
      toast.error('Invalid member or group');
      setRemoveMemberConfirm({ isOpen: false, userId: null, userName: '' });
      return;
    }

    setIsRemovingMember(true);
    try {
      // Call the API to remove the member
      await removeGroupMember(parseInt(id), removeMemberConfirm.userId);
      
      // Update local state
      setFormData(prev => ({
        ...prev,
        members: prev.members.filter(mid => mid !== removeMemberConfirm.userId),
      }));
      
      toast.success(`${removeMemberConfirm.userName} removed from group successfully`);
      
      // Refresh groups data
      await refreshAllGroups();
      
    } catch (error: any) {
      console.error('Error removing member:', error);
      const message = error.response?.data?.error || 'Failed to remove member. Please try again.';
      toast.error(message);
    } finally {
      setIsRemovingMember(false);
      setRemoveMemberConfirm({ isOpen: false, userId: null, userName: '' });
    }
  };

  const handleCancelRemoveMember = () => {
    setRemoveMemberConfirm({ isOpen: false, userId: null, userName: '' });
  };

  // ========== OTHER HANDLERS ==========
  const getMemberName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.phone_number || `User #${userId}`;
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
    return user?.full_name || user?.phone_number || `User #${userId}`;
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

  // ========== SUBMIT ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (!formData.leader) {
      toast.error('Please select a group leader');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const updateData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        leader: formData.leader,
        members: formData.members,
        is_active: formData.is_active,
      };

      console.log('Updating group with data:', updateData);
      console.log('Member IDs to update:', formData.members);
      
      const response = await groupsAPI.update(parseInt(id!), updateData);
      console.log('Group updated:', response.data);
      
      toast.success(`Group "${formData.name}" updated successfully!`);
      
      await refreshAllGroups();
      navigate('/admin/groups');
    } catch (error: any) {
      console.error('Error updating group:', error);
      const message = error.response?.data?.error || 'Failed to update group. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RENDER ==========
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading group...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load group</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => navigate('/admin/groups')}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Confirmation Modal for Update */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        title="Update Group"
        message={`Are you sure you want to update the group "${formData.name}"?`}
        confirmText="Update Group"
        isLoading={isLoading}
        type="info"
      />

      {/* Confirmation Modal for Remove Member */}
      <ConfirmationModal
        isOpen={removeMemberConfirm.isOpen}
        onClose={handleCancelRemoveMember}
        onConfirm={handleConfirmRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove "${removeMemberConfirm.userName}" from this group?`}
        confirmText="Remove Member"
        cancelText="Cancel"
        isLoading={isRemovingMember}
        type="danger"
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Group</h1>
          <p className="text-sm text-gray-600">Update group details and members</p>
        </div>
      </div>

      {/* Group Info Card */}
      <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-cyan-500">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center text-gray-600">
            <FaUsers className="mr-2 text-cyan-500" />
            <strong className="text-gray-900">ID:</strong> #{id}
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center text-gray-600">
            <FaCheckCircle className="mr-2 text-green-500" />
            Status: <span className="ml-1 capitalize">{formData.is_active ? 'Active' : 'Inactive'}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center text-gray-600">
            <FaUsers className="mr-2 text-cyan-500" />
            Members: {formData.members.length}
          </span>
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

            {users.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FaExclamationTriangle className="text-3xl text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No users available</p>
                <p className="text-sm text-gray-400">Please ensure users are loaded in the system</p>
                <button
                  type="button"
                  onClick={refreshUsers}
                  className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
                >
                  <FaSpinner className={loadingUsers ? 'animate-spin inline mr-2' : 'inline mr-2'} />
                  {loadingUsers ? 'Loading...' : 'Refresh Users'}
                </button>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {users.map((user) => (
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
                        <p className="text-xs text-gray-400">Role: {user.role || 'User'} | ID: {user.id}</p>
                      </div>
                      {formData.leader === user.id && (
                        <FaCheckCircle className="text-purple-500 text-xl" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.leader && (
              <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">
                  <strong>Selected Leader:</strong> {getLeaderName(formData.leader)}
                </p>
              </div>
            )}
          </div>

          {/* Members Selection */}
          <div className="pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUserPlus className="mr-2 text-green-500" />
              Manage Members
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {formData.members.length} member(s) in this group.
              {users.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">
                  (Total users in system: {users.length})
                </span>
              )}
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
                {!showMemberSearch && formData.members.length > 0 && (
                  <span className="ml-2 text-xs text-gray-400">
                    (Total: {formData.members.length} members)
                  </span>
                )}
              </button>

              {showMemberSearch && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="relative mb-3">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, phone or ID..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {users.length === 0 ? (
                      <div className="text-center py-4">
                        <FaExclamationTriangle className="text-2xl text-yellow-500 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No users loaded in the system</p>
                        <button
                          type="button"
                          onClick={refreshUsers}
                          className="mt-2 text-sm text-cyan-600 hover:text-cyan-700"
                        >
                          Load Users
                        </button>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">
                          {memberSearchQuery ? 'No users found matching your search' : 'All available users have been added to this group'}
                        </p>
                        {formData.members.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Currently {formData.members.length} members in the group
                          </p>
                        )}
                        {!memberSearchQuery && formData.members.length === users.length && (
                          <p className="text-xs text-green-500 mt-1">
                            All {users.length} users are already in this group
                          </p>
                        )}
                      </div>
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
                              <p className="text-xs text-gray-500">{user.phone_number || 'No phone'}</p>
                              <p className="text-xs text-gray-400">Role: {user.role || 'User'} | ID: {user.id}</p>
                            </div>
                            <FaUserPlus className="text-green-500" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {filteredUsers.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400 text-center">
                      {filteredUsers.length} user(s) available to add
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Members List */}
            {formData.members.length > 0 ? (
              <div className="space-y-2">
                {formData.members.map((userId) => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {getMemberName(userId).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getMemberName(userId)}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaEnvelope className="mr-1" size={12} /> {getMemberEmail(userId) || 'No email'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaPhone className="mr-1" size={12} /> {getMemberPhone(userId) || 'No phone'}
                          </p>
                          {user && (
                            <p className="text-xs text-gray-400">Role: {user.role || 'User'} | ID: {user.id}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user?.is_online && (
                          <span className="text-xs text-green-600 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Online
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberClick(userId)}
                          disabled={isRemovingMember}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove member"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <FaUsers className="text-3xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No members in this group</p>
                <p className="text-xs text-gray-400">Click "Add Members" above to add users to this group</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <FaCheckCircle className="text-cyan-500 mr-2" />
              Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span> {formData.name || '(Not set)'}
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span> {getTypeLabel(formData.type)}
              </div>
              <div>
                <span className="font-medium text-gray-700">Leader:</span> {getLeaderName(formData.leader)}
              </div>
              <div>
                <span className="font-medium text-gray-700">Members:</span> {formData.members.length} member(s)
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Status:</span> {formData.is_active ? 'Active' : 'Inactive'}
              </div>
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
                  Updating Group...
                </>
              ) : (
                <>
                  <FaSave className="mr-3" />
                  Update Group
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

export default EditGroup;
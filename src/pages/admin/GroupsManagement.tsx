// src/pages/admin/GroupsManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaUsers, 
  FaUserGraduate, FaChurch, FaFilter, FaArrowLeft, 
  FaSpinner, FaTimesCircle, FaCheckCircle, FaSync,
  FaUserTie, FaCalendar, FaUserPlus, FaUserMinus,
  FaEnvelope, FaPhone, FaExclamationTriangle
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../auth/context/AdminContext';
import { groupsAPI } from '../../services/api';
import type { Group, User } from '../../types/data';
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
  type?: 'danger' | 'warning' | 'info' | 'success';
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
  type = 'warning',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch(type) {
      case 'danger':
        return {
          icon: <FaExclamationTriangle className="text-red-600 text-4xl" />,
          button: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="text-yellow-600 text-4xl" />,
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          border: 'border-yellow-200'
        };
      case 'success':
        return {
          icon: <FaCheckCircle className="text-green-600 text-4xl" />,
          button: 'bg-green-600 hover:bg-green-700 text-white',
          border: 'border-green-200'
        };
      default:
        return {
          icon: <FaExclamationTriangle className="text-blue-600 text-4xl" />,
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
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
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center ${styles.button}`}
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
// VIEW GROUP MEMBERS MODAL
// ============================================
interface ViewMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onRemoveMember: (groupId: number, userId: number, userName: string) => void;
}

const ViewMembersModal: React.FC<ViewMembersModalProps> = ({
  isOpen,
  onClose,
  group,
  onRemoveMember
}) => {
  if (!isOpen || !group) return null;

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaUsers className="text-cyan-600 text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Group Members</h3>
                <p className="text-sm text-gray-600">
                  {group.name} - {group.members?.length || 0} members
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimesCircle />
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!group.members || group.members.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No members in this group</p>
              <p className="text-sm text-gray-400">Add members using the "Add Member" button</p>
            </div>
          ) : (
            <div className="space-y-3">
              {group.members.map((member: User) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(member.full_name || member.phone_number)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FaEnvelope className="mr-1" /> {member.email || 'No email'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FaPhone className="mr-1" /> {member.phone_number || 'No phone'}
                      </p>
                      <p className="text-xs text-gray-400">Role: {member.role || 'User'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.is_online ? (
                      <span className="text-xs text-green-600 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Online
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Offline</span>
                    )}
                    <button
                      onClick={() => onRemoveMember(group.id, member.id, member.full_name || member.phone_number)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <FaUserMinus />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Member Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-cyan-600">{group.members?.length || 0}</p>
                <p className="text-xs text-gray-500">Total Members</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {group.members?.filter(m => m.is_online).length || 0}
                </p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {group.members?.filter(m => m.is_verified).length || 0}
                </p>
                <p className="text-xs text-gray-500">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const GroupsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { 
    groups, 
    loadingGroups, 
    groupError,
    refreshAllGroups,
    deleteGroup,
    addGroupMember,
    removeGroupMember,
    users,           // Use users instead of students
    refreshUsers     // Use refreshUsers instead of refreshAllStudents
  } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'evangelist' | 'student' | 'mixed'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedGroups] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // ========== VIEW MEMBERS MODAL STATE ==========
  const [showViewMembersModal, setShowViewMembersModal] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<Group | null>(null);
  
  // ========== CONFIRMATION MODAL STATE ==========
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'warning' as 'danger' | 'warning' | 'info' | 'success',
    onConfirm: () => {},
  });

  // ========== ADD MEMBER STATE ==========
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [currentGroupMemberIds, setCurrentGroupMemberIds] = useState<number[]>([]);

  // Load current group members when modal opens
  useEffect(() => {
    if (showAddMemberModal && selectedGroupId) {
      const group = groups.find(g => g.id === selectedGroupId);
      if (group && group.members) {
        setCurrentGroupMemberIds(group.members.map(m => m.id));
      }
    }
  }, [showAddMemberModal, selectedGroupId, groups]);

  // Filter groups
  const filteredGroups = groups.filter(group => {
    const matchesSearch = 
      group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.leader_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || group.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && group.is_active) ||
      (filterStatus === 'inactive' && !group.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filter users for member selection - EXCLUDE already added members
  const filteredUsers = users.filter(user => {
    // Check if user is already in the group
    if (currentGroupMemberIds.includes(user.id)) {
      return false;
    }
    
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.phone_number?.includes(memberSearchQuery) ||
      user.id?.toString().includes(memberSearchQuery);
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: groups.length,
    evangelist: groups.filter(g => g.type === 'evangelist').length,
    student: groups.filter(g => g.type === 'student').length,
    mixed: groups.filter(g => g.type === 'mixed').length,
    active: groups.filter(g => g.is_active).length,
    inactive: groups.filter(g => !g.is_active).length,
  };

  // ========== HANDLERS ==========
  const handleDelete = (id: number, name: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Group',
      message: `Are you sure you want to delete the group "${name}"? This action cannot be undone.`,
      confirmText: 'Delete Group',
      type: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteGroup(id);
          toast.success(`Group "${name}" deleted successfully`);
          refreshAllGroups();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to delete group');
        } finally {
          setIsDeleting(false);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedGroups.length === 0) {
      toast.error('Please select at least one group');
      return;
    }
    
    setConfirmationModal({
      isOpen: true,
      title: 'Bulk Delete Groups',
      message: `Are you sure you want to delete ${selectedGroups.length} group(s)? This action cannot be undone.`,
      confirmText: `Delete ${selectedGroups.length} Groups`,
      type: 'danger',
      onConfirm: async () => {
        setIsBulkDeleting(true);
        try {
          for (const id of selectedGroups) {
            await deleteGroup(id);
          }
          toast.success(`${selectedGroups.length} group(s) deleted successfully`);
          refreshAllGroups();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to delete groups');
        } finally {
          setIsBulkDeleting(false);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRefresh = () => {
    refreshAllGroups();
    refreshUsers();
    toast.success('Refreshed!');
  };

  const handleViewMembers = (group: Group) => {
    setSelectedGroupForMembers(group);
    setShowViewMembersModal(true);
  };

  // ========== ADD MEMBER HANDLERS ==========
  const handleOpenAddMemberModal = (groupId: number, groupName: string) => {
    // Load current group members
    const group = groups.find(g => g.id === groupId);
    if (group && group.members) {
      setCurrentGroupMemberIds(group.members.map(m => m.id));
    }
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setSelectedUserId(null);
    setSelectedUserName('');
    setMemberSearchQuery('');
    setShowAddMemberModal(true);
  };

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSelectedGroupId(null);
    setSelectedGroupName('');
    setSelectedUserId(null);
    setSelectedUserName('');
    setMemberSearchQuery('');
    setCurrentGroupMemberIds([]);
  };

  const handleSelectUser = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
  };

  const handleAddMemberClick = () => {
    if (!selectedUserId) {
      toast.error('Please select a user to add');
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: 'Add Member to Group',
      message: `Are you sure you want to add "${selectedUserName}" to "${selectedGroupName}"?`,
      confirmText: 'Add Member',
      type: 'success',
      onConfirm: handleConfirmAddMember
    });
  };

  const handleConfirmAddMember = async () => {
    if (!selectedGroupId || !selectedUserId) {
      toast.error('Missing group or user information');
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      return;
    }

    setIsAddingMember(true);
    try {
      await addGroupMember(selectedGroupId, selectedUserId);
      toast.success(`${selectedUserName} added to group successfully`);
      
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      
      // Update the current group members list
      setCurrentGroupMemberIds(prev => [...prev, selectedUserId!]);
      
      // Reset selection
      setSelectedUserId(null);
      setSelectedUserName('');
      setMemberSearchQuery('');
      
      // Refresh data
      await refreshAllGroups();
      
      if (selectedGroupId) {
        const updatedGroup = await groupsAPI.get(selectedGroupId);
        setSelectedGroupForMembers(updatedGroup.data);
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = (groupId: number, userId: number, userName: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Remove Member',
      message: `Are you sure you want to remove "${userName}" from this group?`,
      confirmText: 'Remove Member',
      type: 'warning',
      onConfirm: async () => {
        try {
          await removeGroupMember(groupId, userId);
          toast.success(`${userName} removed from group`);
          
          setCurrentGroupMemberIds(prev => prev.filter(id => id !== userId));
          
          refreshAllGroups();
          const updatedGroup = await groupsAPI.get(groupId);
          setSelectedGroupForMembers(updatedGroup.data);
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to remove member');
        } finally {
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // ========== HELPERS ==========
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'evangelist':
        return <FaChurch className="text-cyan-600" />;
      case 'student':
        return <FaUserGraduate className="text-cyan-600" />;
      case 'mixed':
        return <FaUsers className="text-cyan-600" />;
      default:
        return <FaUsers className="text-cyan-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'evangelist':
        return 'Evangelist';
      case 'student':
        return 'Student';
      case 'mixed':
        return 'Mixed';
      default:
        return type;
    }
  };

  const getStatusBadge = (group: Group) => {
    if (group.is_active) {
      return { label: 'Active', className: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="mr-1" /> };
    }
    return { label: 'Inactive', className: 'bg-red-100 text-red-700', icon: <FaTimesCircle className="mr-1" /> };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  // ========== RENDER ==========
  if (loadingGroups && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (groupError && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load groups</p>
          <p className="text-sm text-gray-400 mt-1">{groupError}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaSync className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        isLoading={isDeleting || isBulkDeleting || isAddingMember}
      />

      {/* View Members Modal */}
      <ViewMembersModal
        isOpen={showViewMembersModal}
        onClose={() => {
          setShowViewMembersModal(false);
          setSelectedGroupForMembers(null);
        }}
        group={selectedGroupForMembers}
        onRemoveMember={handleRemoveMember}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Groups Management</h2>
            <p className="text-sm text-gray-600">Manage all evangelist and student groups</p>
            <p className="text-xs text-gray-400 mt-1">{groups.length} groups found</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaSync className={loadingGroups ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link 
            to="/admin/create-group" 
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>Create Group</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-cyan-500">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Groups</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{stats.evangelist}</p>
          <p className="text-xs text-gray-500">Evangelist</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.student}</p>
          <p className="text-xs text-gray-500">Student</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-purple-600">{stats.mixed}</p>
          <p className="text-xs text-gray-500">Mixed</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-red-500">
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          <p className="text-xs text-gray-500">Inactive</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups by name, leader or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                showFilters ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            {selectedGroups.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isBulkDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                <span>Delete ({selectedGroups.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All Types</option>
                  <option value="evangelist">Evangelist</option>
                  <option value="student">Student</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGroups.map((group) => {
          const status = getStatusBadge(group);
          return (
            <div key={group.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(group.type)}
                    <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{group.description || 'No description'}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                    <span className="flex items-center text-gray-600">
                      <FaUsers className="mr-1 text-cyan-500" />
                      {group.member_count || 0} members
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600 flex items-center">
                      <FaUserTie className="mr-1 text-cyan-500" />
                      Leader: <span className="font-medium text-gray-800 ml-1">{group.leader_name || 'N/A'}</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600 flex items-center">
                      <FaCalendar className="mr-1 text-gray-400" />
                      {formatDate(group.created_at)}
                    </span>
                  </div>
                  
                  {/* Member Count Badge */}
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                      {group.member_count || 0} members
                    </span>
                    {group.members && group.members.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {group.members.filter(m => m.is_online).length} online
                      </span>
                    )}
                  </div>

                  {/* Members Preview */}
                  {group.members && group.members.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.members.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                            member.is_online ? 'bg-green-500' : 'bg-gray-400'
                          }`}>
                            {member.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          {member.is_online && (
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-0.5"></span>
                          )}
                        </div>
                      ))}
                      {group.members.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{group.members.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center ${status.className}`}>
                  {status.icon}
                  {status.label}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500 capitalize">
                  Type: <span className="font-medium">{getTypeLabel(group.type)}</span>
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewMembers(group)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    title="View Members"
                  >
                    <FaUsers />
                  </button>
                  <button
                    onClick={() => handleOpenAddMemberModal(group.id, group.name)}
                    className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                    title="Add Member"
                  >
                    <FaUserPlus />
                  </button>
                  <Link 
                    to={`/admin/groups/${group.id}`} 
                    className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                    title="View Group"
                  >
                    <FaEye />
                  </Link>
                  <Link 
                    to={`/admin/groups/edit/${group.id}`} 
                    className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                    title="Edit Group"
                  >
                    <FaEdit />
                  </Link>
                  <button 
                    onClick={() => handleDelete(group.id, group.name)} 
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                    title="Delete Group"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUsers className="text-4xl text-cyan-400" />
          </div>
          <p className="text-gray-500 font-medium">No groups found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
          <Link 
            to="/admin/create-group" 
            className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
          >
            <FaPlus className="mr-2" />
            Create your first group
          </Link>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Add Member to Group</h3>
                <button
                  onClick={handleCloseAddMemberModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimesCircle />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Add a user to <strong>{selectedGroupName}</strong></p>
              <p className="text-xs text-cyan-600 mt-1">
                {currentGroupMemberIds.length} members currently in group
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Search Users */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email or ID..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Users List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {users.length === 0 ? (
                  <div className="text-center py-4">
                    <FaExclamationTriangle className="text-2xl text-yellow-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No users loaded in the system</p>
                    <button
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
                    {currentGroupMemberIds.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {currentGroupMemberIds.length} members already in this group
                      </p>
                    )}
                    {!memberSearchQuery && users.length === currentGroupMemberIds.length && (
                      <p className="text-xs text-green-500 mt-1">
                        All {users.length} users are already in this group
                      </p>
                    )}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUserId === user.id
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectUser(user.id, user.full_name)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaEnvelope className="mr-1" /> {user.email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaPhone className="mr-1" /> {user.phone_number}
                          </p>
                          <p className="text-xs text-gray-400">Role: {user.role || 'User'} | ID: {user.id}</p>
                        </div>
                        {selectedUserId === user.id && (
                          <FaCheckCircle className="text-cyan-500 text-xl" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Show counts */}
              <div className="text-xs text-gray-400 text-center flex justify-center gap-4">
                <span>Total users: {users.length}</span>
                <span>In group: {currentGroupMemberIds.length}</span>
                <span>Available: {filteredUsers.length}</span>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseAddMemberModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleAddMemberClick}
                disabled={!selectedUserId || isAddingMember}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
              >
                {isAddingMember ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaUserPlus className="mr-2" />
                )}
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      {filteredGroups.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 bg-white rounded-xl shadow-md px-6 py-3">
          <span>Showing {filteredGroups.length} of {groups.length} groups</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              Evangelist: {stats.evangelist}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Student: {stats.student}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
              Mixed: {stats.mixed}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
              Active: {stats.active}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              Inactive: {stats.inactive}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;
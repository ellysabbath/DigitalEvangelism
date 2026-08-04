// src/pages/admin/GroupsView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaSpinner, FaUsers, FaUserGraduate, 
  FaChurch, FaUserTie, FaEnvelope, FaPhone, 
  FaCheckCircle, FaTimesCircle, FaCalendar, 
  FaEdit, FaTrash, FaUserPlus, FaUserMinus,
  FaExclamationTriangle, FaSync, FaMapMarkerAlt,
  FaUser, FaMailBulk, FaPhoneAlt
} from 'react-icons/fa';
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
// MAIN COMPONENT
// ============================================
const GroupsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { users, refreshAllGroups, loading } = useAdmin();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'warning' as 'danger' | 'warning' | 'info' | 'success',
    onConfirm: () => {},
  });

  // ========== FETCH GROUP ==========
  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) {
        setError('Group ID not provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await groupsAPI.get(parseInt(id));
        setGroup(response.data);
      } catch (err: any) {
        console.error('Error fetching group:', err);
        setError(err.response?.data?.error || 'Failed to load group');
        toast.error('Failed to load group');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  // ========== HANDLERS ==========
  const handleDelete = () => {
    if (!group) return;
    
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Group',
      message: `Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`,
      confirmText: 'Delete Group',
      type: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await groupsAPI.delete(group.id);
          toast.success(`Group "${group.name}" deleted successfully`);
          await refreshAllGroups();
          navigate('/admin/groups');
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to delete group');
        } finally {
          setIsDeleting(false);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRefresh = () => {
    if (id) {
      groupsAPI.get(parseInt(id))
        .then(response => setGroup(response.data))
        .catch(err => toast.error('Failed to refresh group'));
    }
  };

  // ========== HELPERS ==========
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'evangelist':
        return <FaChurch className="text-blue-500 text-2xl" />;
      case 'student':
        return <FaUserGraduate className="text-green-500 text-2xl" />;
      case 'mixed':
        return <FaUsers className="text-purple-500 text-2xl" />;
      default:
        return <FaUsers className="text-gray-500 text-2xl" />;
    }
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

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'evangelist':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'student':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'mixed':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusBadge = () => {
    if (!group) return null;
    if (group.is_active) {
      return { label: 'Active', className: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="mr-1" /> };
    }
    return { label: 'Inactive', className: 'bg-red-100 text-red-700', icon: <FaTimesCircle className="mr-1" /> };
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.phone_number || 'Unknown';
  };

  const getUserEmail = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.email || '';
  };

  const getUserPhone = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.phone_number || '';
  };

  const getUserRole = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.role || 'User';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // ========== RENDER ==========
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load group</p>
          <p className="text-sm text-gray-400 mt-1">{error || 'Group not found'}</p>
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

  const status = getStatusBadge();
  const memberCount = group.members?.length || 0;

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
        isLoading={isDeleting}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/groups')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
            title="Back to Groups"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <span>{group.name}</span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center ${status?.className}`}>
                {status?.icon}
                {status?.label}
              </span>
            </h1>
            <p className="text-sm text-gray-600">View group details and members</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
            title="Refresh"
          >
            <FaSync />
          </button>
          <Link
            to={`/admin/groups/edit/${group.id}`}
            className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
            title="Edit Group"
          >
            <FaEdit />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
            title="Delete Group"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Group Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Group Info Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className={`p-6 border-b ${getTypeColor(group.type)}`}>
              <div className="flex items-center space-x-3">
                {getTypeIcon(group.type)}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{getTypeLabel(group.type)}</h2>
                  <p className="text-sm text-gray-600">Group Type</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{group.description || 'No description provided'}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Group ID</p>
                  <p className="text-sm font-mono text-gray-900">#{group.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Count</p>
                  <p className="text-sm font-semibold text-gray-900">{memberCount} members</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{formatDate(group.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{formatDate(group.updated_at)}</p>
                </div>
              </div>

              {/* Leader Info */}
              {group.leader && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaUserTie className="mr-2 text-purple-500" />
                    Group Leader
                  </h3>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-purple-600 font-bold text-lg">
                        {getUserName(group.leader).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getUserName(group.leader)}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaEnvelope className="mr-1" /> {getUserEmail(group.leader)}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <FaPhone className="mr-1" /> {getUserPhone(group.leader)}
                        </p>
                        <p className="text-xs text-purple-600">Role: {getUserRole(group.leader)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Members */}
        <div className="space-y-6">
          {/* Members Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUsers className="mr-2 text-cyan-500" />
                  Members
                </h3>
                <span className="px-2.5 py-1 text-xs font-medium bg-cyan-100 text-cyan-700 rounded-full">
                  {memberCount}
                </span>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {memberCount === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">No members</p>
                  <p className="text-xs text-gray-400">This group has no members yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {group.members?.map((member: User) => (
                    <div key={member.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-sm">
                          {member.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {member.full_name || 'Unknown'}
                            {member.id === group.leader && (
                              <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                Leader
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center truncate">
                            <FaEnvelope className="mr-1 flex-shrink-0" />
                            <span className="truncate">{member.email || 'No email'}</span>
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaPhone className="mr-1 flex-shrink-0" />
                            {member.phone_number || 'No phone'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {member.is_online ? (
                            <span className="text-xs text-green-600 flex items-center">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                              Online
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Offline</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Member Button */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <Link
                to={`/admin/groups/edit/${group.id}`}
                className="w-full flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <FaUserPlus className="mr-2" />
                Manage Members
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FaCheckCircle className="mr-2 text-green-500" />
              Quick Stats
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Total Members</span>
                <span className="font-medium text-gray-900">{memberCount}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${group.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {group.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Type</span>
                <span className="font-medium text-gray-900 capitalize">{group.type}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Leader</span>
                <span className="font-medium text-gray-900 truncate max-w-[150px]">
                  {group.leader ? getUserName(group.leader) : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white rounded-xl shadow-md p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Group ID: <span className="font-mono text-gray-700">#{group.id}</span></span>
          <span className="text-gray-300">|</span>
          <span>Created: {formatDate(group.created_at)}</span>
          {group.updated_at !== group.created_at && (
            <>
              <span className="text-gray-300">|</span>
              <span>Updated: {formatDate(group.updated_at)}</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/admin/groups/edit/${group.id}`}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaEdit />
            <span>Edit Group</span>
          </Link>
          <Link
            to="/admin/groups"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Groups
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GroupsView;
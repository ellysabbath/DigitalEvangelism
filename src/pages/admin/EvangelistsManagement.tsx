// src/pages/admin/EvangelistsManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaUserTie, 
  FaEnvelope, FaPhone, FaChurch, FaArrowLeft, FaUsers, 
  FaSpinner, FaTimesCircle, FaCheckCircle, FaSync,
  FaMapMarkerAlt, FaFilter, FaCalendar, FaChartBar,
  FaUserCheck, FaUserTimes, FaExclamationTriangle,
  FaTimes, FaSave, FaUser
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../auth/context/AdminContext';
import { evangelistsAPI, crudAPI } from '../../services/api';
import type { Evangelist, UserCRUD } from '../../types/data';
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
// ADD/EDIT MODAL
// ============================================
interface EvangelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  evangelist?: Evangelist | null;
  users: UserCRUD[];
  isLoading?: boolean;
}

const EvangelistModal: React.FC<EvangelistModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  evangelist,
  users,
  isLoading = false
}) => {
  const isEdit = !!evangelist;
  const [formData, setFormData] = useState({
    user_id: null as number | null,
    ordination_date: '',
    years_of_service: 0,
    ministry_name: '',
    ministry_focus: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && evangelist) {
      setFormData({
        user_id: evangelist.user?.id || null,
        ordination_date: evangelist.ordination_date ? evangelist.ordination_date.split('T')[0] : '',
        years_of_service: evangelist.years_of_service || 0,
        ministry_name: evangelist.ministry_name || '',
        ministry_focus: evangelist.ministry_focus || '',
      });
    } else if (isOpen) {
      setFormData({
        user_id: null,
        ordination_date: '',
        years_of_service: 0,
        ministry_name: '',
        ministry_focus: '',
      });
    }
  }, [isOpen, evangelist]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'years_of_service' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id) {
      toast.error('Please select a user');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && evangelist) {
        await evangelistsAPI.update(evangelist.id, {
          ordination_date: formData.ordination_date || undefined,
          years_of_service: formData.years_of_service,
          ministry_name: formData.ministry_name,
          ministry_focus: formData.ministry_focus,
        });
        toast.success('Evangelist updated successfully');
      } else {
        await evangelistsAPI.create({
          user_id: formData.user_id,
          ordination_date: formData.ordination_date || undefined,
          years_of_service: formData.years_of_service,
          ministry_name: formData.ministry_name,
          ministry_focus: formData.ministry_focus,
        });
        toast.success('Evangelist created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableUsers = users.filter(u => u.role === 'evangelist');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaUserTie className="text-cyan-600 text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEdit ? 'Edit Evangelist' : 'Add New Evangelist'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEdit ? 'Update evangelist details' : 'Create a new evangelist record'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                User <span className="text-red-500">*</span>
              </label>
              <select
                name="user_id"
                value={formData.user_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                disabled={isEdit || isSubmitting}
                required
              >
                <option value="">Select a user</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email} - {user.phone_number})
                  </option>
                ))}
              </select>
              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">User cannot be changed after creation</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ordination Date
                </label>
                <input
                  type="date"
                  name="ordination_date"
                  value={formData.ordination_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Years of Service
                </label>
                <input
                  type="number"
                  name="years_of_service"
                  value={formData.years_of_service}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ministry Name
              </label>
              <input
                type="text"
                name="ministry_name"
                value={formData.ministry_name}
                onChange={handleChange}
                placeholder="e.g., Gospel Team Africa"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ministry Focus
              </label>
              <input
                type="text"
                name="ministry_focus"
                value={formData.ministry_focus}
                onChange={handleChange}
                placeholder="e.g., Youth Evangelism"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex justify-center items-center py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isEdit ? 'Update Evangelist' : 'Create Evangelist'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// VIEW MODAL
// ============================================
interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  evangelist: Evangelist | null;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, evangelist }) => {
  if (!isOpen || !evangelist) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getYearsOfService = (years: number) => {
    if (years === 0) return 'New';
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaUserTie className="text-cyan-600 text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Evangelist Details</h3>
                <p className="text-sm text-gray-600">View complete evangelist information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Basic Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {evangelist.full_name?.charAt(0) || 'E'}
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{evangelist.full_name || 'Unknown'}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <FaEnvelope className="mr-1" /> {evangelist.email || 'No email'}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <FaPhone className="mr-1" /> {evangelist.phone || 'No phone'}
              </p>
              <p className="text-sm text-gray-500">
                ID: <span className="font-mono">{evangelist.evangelist_id}</span>
              </p>
            </div>
          </div>

          {/* Ministry Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Ministry Name</p>
              <p className="text-lg font-semibold text-gray-900">{evangelist.ministry_name || 'N/A'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Ministry Focus</p>
              <p className="text-lg font-semibold text-gray-900">{evangelist.ministry_focus || 'N/A'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <FaUsers className="text-green-500 text-2xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{evangelist.total_students || 0}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
              <FaChurch className="text-indigo-500 text-2xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{evangelist.total_groups || 0}</p>
              <p className="text-xs text-gray-500">Groups</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
              <FaCheckCircle className="text-yellow-500 text-2xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{evangelist.total_certificates_issued || 0}</p>
              <p className="text-xs text-gray-500">Certificates</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Ordination Date</p>
              <p className="font-medium text-gray-900">{formatDate(evangelist.ordination_date)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Years of Service</p>
              <p className="font-medium text-gray-900">{getYearsOfService(evangelist.years_of_service || 0)}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-gray-500">Status:</span>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center ${
              evangelist.user?.is_active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {evangelist.user?.is_active ? 'Active' : 'Inactive'}
            </span>
            {evangelist.user?.is_online && (
              <span className="text-xs text-green-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                Online
              </span>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
            <p>Created: {formatDate(evangelist.created_at)}</p>
            <p>Updated: {formatDate(evangelist.updated_at)}</p>
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
const EvangelistsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { 
    evangelists, 
    evangelistStats, 
    loadingEvangelists, 
    evangelistError,
    refreshAllEvangelists,
    deleteEvangelist,
    users,
    refreshUsers
  } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedEvangelists, setSelectedEvangelists] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvangelist, setSelectedEvangelist] = useState<Evangelist | null>(null);
  
  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'warning' as 'danger' | 'warning' | 'info' | 'success',
    onConfirm: () => {},
  });

  // Filter evangelists
  const filteredEvangelists = evangelists.filter(evangelist => {
    const matchesSearch = 
      evangelist.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evangelist.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evangelist.phone?.includes(searchQuery) ||
      evangelist.ministry_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evangelist.evangelist_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isActive = evangelist.user?.is_active ?? false;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'inactive' && !isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: evangelists.length,
    active: evangelists.filter(e => e.user?.is_active).length,
    inactive: evangelists.filter(e => !e.user?.is_active).length,
    totalStudents: evangelists.reduce((sum, e) => sum + (e.total_students || 0), 0),
    totalGroups: evangelists.reduce((sum, e) => sum + (e.total_groups || 0), 0),
    totalCertificates: evangelists.reduce((sum, e) => sum + (e.total_certificates_issued || 0), 0),
  };

  // ========== HANDLERS ==========
  const handleDelete = (id: number, name: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Evangelist',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete Evangelist',
      type: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteEvangelist(id);
          toast.success(`Evangelist "${name}" deleted successfully`);
          refreshAllEvangelists();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to delete evangelist');
        } finally {
          setIsDeleting(false);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedEvangelists.length === 0) {
      toast.error('Please select at least one evangelist');
      return;
    }
    
    setConfirmationModal({
      isOpen: true,
      title: 'Bulk Delete Evangelists',
      message: `Are you sure you want to delete ${selectedEvangelists.length} evangelist(s)? This action cannot be undone.`,
      confirmText: `Delete ${selectedEvangelists.length} Evangelists`,
      type: 'danger',
      onConfirm: async () => {
        setIsBulkDeleting(true);
        try {
          for (const id of selectedEvangelists) {
            await deleteEvangelist(id);
          }
          toast.success(`${selectedEvangelists.length} evangelist(s) deleted successfully`);
          setSelectedEvangelists([]);
          refreshAllEvangelists();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to delete evangelists');
        } finally {
          setIsBulkDeleting(false);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvangelists(filteredEvangelists.map(e => e.id));
    } else {
      setSelectedEvangelists([]);
    }
  };

  const handleSelectEvangelist = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedEvangelists(prev => [...prev, id]);
    } else {
      setSelectedEvangelists(prev => prev.filter(eid => eid !== id));
    }
  };

  const handleRefresh = () => {
    refreshAllEvangelists();
    refreshUsers();
    toast.success('Refreshed!');
  };

  const handleOpenView = (evangelist: Evangelist) => {
    setSelectedEvangelist(evangelist);
    setShowViewModal(true);
  };

  const handleOpenEdit = (evangelist: Evangelist) => {
    setSelectedEvangelist(evangelist);
    setShowEditModal(true);
  };

  const handleModalSuccess = () => {
    refreshAllEvangelists();
    refreshUsers();
  };

  // ========== HELPERS ==========
  const getStatusBadge = (evangelist: Evangelist) => {
    const isActive = evangelist.user?.is_active ?? false;
    if (isActive) {
      return { label: 'Active', className: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="mr-1" /> };
    }
    return { label: 'Inactive', className: 'bg-red-100 text-red-700', icon: <FaTimesCircle className="mr-1" /> };
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getYearsOfService = (years: number) => {
    if (years === 0) return 'New';
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  // ========== RENDER ==========
  if (loadingEvangelists && evangelists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading evangelists...</p>
        </div>
      </div>
    );
  }

  if (evangelistError && evangelists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load evangelists</p>
          <p className="text-sm text-gray-400 mt-1">{evangelistError}</p>
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
        isLoading={isDeleting || isBulkDeleting}
      />

      {/* Add Modal */}
      <EvangelistModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
        users={users}
      />

      {/* Edit Modal */}
      <EvangelistModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEvangelist(null);
        }}
        onSuccess={handleModalSuccess}
        evangelist={selectedEvangelist}
        users={users}
      />

      {/* View Modal */}
      <ViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedEvangelist(null);
        }}
        evangelist={selectedEvangelist}
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
            <h2 className="text-2xl font-bold text-gray-900">Evangelists Management</h2>
            <p className="text-sm text-gray-600">Manage all evangelists in the system</p>
            <p className="text-xs text-gray-400 mt-1">{evangelists.length} evangelists found</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaSync className={loadingEvangelists ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Evangelist</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-cyan-500">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Evangelists</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-red-500">
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          <p className="text-xs text-gray-500">Inactive</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
          <p className="text-xs text-gray-500">Total Students</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-indigo-500">
          <p className="text-2xl font-bold text-indigo-600">{stats.totalGroups}</p>
          <p className="text-xs text-gray-500">Groups Led</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{stats.totalCertificates}</p>
          <p className="text-xs text-gray-500">Certificates</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search evangelists by name, email, ministry..."
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
            {selectedEvangelists.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isBulkDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                <span>Delete ({selectedEvangelists.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

      {/* Evangelists Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedEvangelists.length === filteredEvangelists.length && filteredEvangelists.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evangelist</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ministry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvangelists.map((evangelist) => {
                const status = getStatusBadge(evangelist);
                return (
                  <tr key={evangelist.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEvangelists.includes(evangelist.id)}
                        onChange={(e) => handleSelectEvangelist(evangelist.id, e.target.checked)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-cyan-50 rounded-full flex-shrink-0">
                          <FaUserTie className="text-cyan-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{evangelist.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaEnvelope className="mr-1 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{evangelist.email || 'No email'}</span>
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaPhone className="mr-1 text-gray-400 flex-shrink-0" />
                            <span>{evangelist.phone || 'No phone'}</span>
                          </p>
                          {evangelist.ordination_date && (
                            <p className="text-xs text-gray-400 flex items-center">
                              <FaCalendar className="mr-1 text-gray-400" />
                              Ordained: {formatDate(evangelist.ordination_date)}
                            </p>
                          )}
                          {evangelist.years_of_service > 0 && (
                            <p className="text-xs text-gray-400">
                              {getYearsOfService(evangelist.years_of_service)} of service
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-600">{evangelist.evangelist_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{evangelist.ministry_name || 'N/A'}</p>
                        {evangelist.ministry_focus && (
                          <p className="text-xs text-gray-500">{evangelist.ministry_focus}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className="text-sm text-gray-700 flex items-center">
                          <FaUsers className="mr-1 text-cyan-500" />
                          {evangelist.total_students || 0} students
                        </span>
                        <span className="text-sm text-gray-700 flex items-center">
                          <FaChurch className="mr-1 text-cyan-500" />
                          {evangelist.total_groups || 0} groups
                        </span>
                        <span className="text-sm text-gray-700 flex items-center">
                          <FaCheckCircle className="mr-1 text-green-500" />
                          {evangelist.total_certificates_issued || 0} certificates
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        {evangelist.user?.is_online && (
                          <span className="text-xs text-green-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            Online
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => handleOpenView(evangelist)}
                          className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                          title="View Evangelist"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(evangelist)}
                          className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                          title="Edit Evangelist"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(evangelist.id, evangelist.full_name || 'Unknown')}
                          disabled={isDeleting}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                          title="Delete Evangelist"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEvangelists.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserTie className="text-4xl text-cyan-400" />
            </div>
            <p className="text-gray-500 font-medium">No evangelists found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              <FaPlus className="mr-2" />
              Add your first evangelist
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 bg-white rounded-xl shadow-md px-6 py-3">
        <span>Showing {filteredEvangelists.length} of {evangelists.length} evangelists</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Active: {stats.active}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            Inactive: {stats.inactive}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
            Students: {stats.totalStudents}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-1"></span>
            Groups: {stats.totalGroups}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
            Certificates: {stats.totalCertificates}
          </span>
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

export default EvangelistsManagement;
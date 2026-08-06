// src/pages/admin/SubscriptionsManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, 
  FaCheckCircle, FaTimesCircle, FaSync, FaSpinner,
  FaArrowLeft, FaEnvelope, FaUser, FaClock,
  FaExclamationTriangle, FaUserPlus, FaEnvelopeOpen,
  FaBan, FaSave, FaTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import subscriptionApi from '../../services/subscriptionApi';
import type { Subscription, SubscriptionStats, SubscriptionLog } from '../../types/subscription';
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
          icon: <FaCheckCircle className="text-blue-600 text-4xl" />,
          button: 'bg-blue-600 hover:bg-blue-700',
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
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all ${styles.button} disabled:opacity-50`}
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
// SUBSCRIPTION FORM MODAL
// ============================================
interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  subscription?: Subscription | null;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subscription,
  isLoading = false,
  mode
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    subscription_type: 'all',
  });

  useEffect(() => {
    if (subscription && mode === 'edit') {
      setFormData({
        email: subscription.email || '',
        name: subscription.name || '',
        subscription_type: subscription.subscription_type || 'all',
      });
    } else if (mode === 'create') {
      setFormData({
        email: '',
        name: '',
        subscription_type: 'all',
      });
    }
  }, [subscription, mode]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const subscriptionTypes = [
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'weekly_digest', label: 'Weekly Digest' },
    { value: 'prayer_updates', label: 'Prayer Updates' },
    { value: 'event_notifications', label: 'Event Notifications' },
    { value: 'sermon_updates', label: 'Sermon Updates' },
    { value: 'all', label: 'All Updates' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {mode === 'create' ? (
                <FaUserPlus className="text-cyan-600 text-2xl" />
              ) : (
                <FaEdit className="text-cyan-600 text-2xl" />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {mode === 'create' ? 'Add New Subscriber' : 'Edit Subscriber'}
                </h3>
                <p className="text-sm text-gray-600">
                  {mode === 'create' ? 'Add a new subscriber to the newsletter' : 'Update subscriber information'}
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter full name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Subscription Type
              </label>
              <select
                name="subscription_type"
                value={formData.subscription_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                disabled={isLoading}
              >
                {subscriptionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {mode === 'create' ? 'Add Subscriber' : 'Update Subscriber'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
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
// VIEW SUBSCRIPTION DETAILS MODAL
// ============================================
interface ViewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  logs: SubscriptionLog[];
  loadingLogs: boolean;
}

const ViewSubscriptionModal: React.FC<ViewSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  logs,
  loadingLogs,
}) => {
  if (!isOpen || !subscription) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      unsubscribed: 'bg-red-100 text-red-700',
    };
    return styles[status] || styles.inactive;
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      subscribed: 'bg-green-100 text-green-700',
      confirmed: 'bg-blue-100 text-blue-700',
      unsubscribed: 'bg-red-100 text-red-700',
      resubscribed: 'bg-purple-100 text-purple-700',
      updated: 'bg-yellow-100 text-yellow-700',
      email_sent: 'bg-indigo-100 text-indigo-700',
      email_opened: 'bg-cyan-100 text-cyan-700',
      email_clicked: 'bg-orange-100 text-orange-700',
    };
    return styles[action] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <FaEye className="text-white text-xl" />
            <div>
              <h3 className="text-white font-bold text-lg">Subscriber Details</h3>
              <p className="text-cyan-100 text-sm">{subscription.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Subscriber Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{subscription.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{subscription.name || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Subscription Type</p>
              <p className="font-medium text-gray-900">{subscription.subscription_type_display}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(subscription.status)}`}>
                {subscription.status_display}
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Confirmed</p>
              <span className="inline-flex items-center">
                {subscription.is_confirmed ? (
                  <FaCheckCircle className="text-green-500 mr-1" />
                ) : (
                  <FaTimesCircle className="text-red-500 mr-1" />
                )}
                <span className="font-medium">{subscription.is_confirmed ? 'Yes' : 'No'}</span>
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Active</p>
              <span className="inline-flex items-center">
                {subscription.is_active ? (
                  <FaCheckCircle className="text-green-500 mr-1" />
                ) : (
                  <FaTimesCircle className="text-red-500 mr-1" />
                )}
                <span className="font-medium">{subscription.is_active ? 'Yes' : 'No'}</span>
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Created</p>
              <p className="font-medium text-gray-900">{formatDate(subscription.created_at)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Confirmed At</p>
              <p className="font-medium text-gray-900">{formatDate(subscription.confirmed_at)}</p>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <FaClock className="mr-2 text-cyan-500" />
              Activity Logs
            </h4>
            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-cyan-500" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No activity logs found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadge(log.action)}`}>
                        {log.action.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {log.details?.message || 'No details'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
const SubscriptionsManagement: React.FC = () => {
  const navigate = useNavigate();

  // ============================================
  // STATE
  // ============================================
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [logs, setLogs] = useState<SubscriptionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterConfirmed, setFilterConfirmed] = useState<string>('all');

  // Selection states
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'activate' | 'deactivate' | 'resend';
    id: number;
    title: string;
    message: string;
  } | null>(null);

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.subscription_type = filterType;
      if (filterConfirmed !== 'all') params.is_confirmed = filterConfirmed === 'true';

      const data = await subscriptionApi.listSubscriptions(params);
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      setError(error.message || 'Failed to load subscriptions');
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await subscriptionApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLogs = async (subscriptionId: number) => {
    setLoadingLogs(true);
    try {
      const data = await subscriptionApi.getLogs({ subscription_id: subscriptionId, limit: 50 });
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  const handleCreate = async (data: any) => {
    setIsProcessing(true);
    try {
      await subscriptionApi.createSubscription(data);
      toast.success('Subscriber added successfully!');
      setShowFormModal(false);
      await fetchSubscriptions();
      await fetchStats();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add subscriber';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedSubscription) return;
    setIsProcessing(true);
    try {
      await subscriptionApi.updateSubscription(selectedSubscription.id, data);
      toast.success('Subscriber updated successfully!');
      setShowFormModal(false);
      await fetchSubscriptions();
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update subscriber';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsProcessing(true);
    try {
      await subscriptionApi.deleteSubscription(id);
      toast.success('Subscriber deleted successfully!');
      setShowConfirmModal(false);
      setConfirmAction(null);
      await fetchSubscriptions();
      await fetchStats();
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to delete subscriber';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================
  // NEW: Function to update subscription status
  // ============================================
  const updateSubscriptionStatus = async (id: number, status: string) => {
    setIsProcessing(true);
    try {
      // Get the full subscription data first
      const subscription = subscriptions.find(s => s.id === id);
      if (!subscription) {
        toast.error('Subscription not found');
        return;
      }

      // Update with the full data including status
      await subscriptionApi.updateSubscription(id, {
        email: subscription.email,
        name: subscription.name,
        subscription_type: subscription.subscription_type,
        status: status
      });
      
      const action = status === 'active' ? 'activated' : 'deactivated';
      toast.success(`Subscriber ${action} successfully!`);
      setShowConfirmModal(false);
      setConfirmAction(null);
      await fetchSubscriptions();
      await fetchStats();
    } catch (error: any) {
      console.error(`Error ${status} subscription:`, error);
      const errorMsg = error.response?.data?.error || error.message || `Failed to ${status} subscriber`;
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivate = async (id: number) => {
    await updateSubscriptionStatus(id, 'active');
  };

  const handleDeactivate = async (id: number) => {
    await updateSubscriptionStatus(id, 'inactive');
  };

  const handleResendConfirmation = async (id: number) => {
    setIsProcessing(true);
    try {
      const subscription = subscriptions.find(s => s.id === id);
      if (!subscription) {
        toast.error('Subscription not found');
        return;
      }
      
      await subscriptionApi.resendConfirmation(subscription.email);
      toast.success('Confirmation email sent successfully!');
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to send confirmation email';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleView = async (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    await fetchLogs(subscription.id);
    setShowViewModal(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormMode('edit');
    setShowFormModal(true);
  };

  const handleOpenCreate = () => {
    setSelectedSubscription(null);
    setFormMode('create');
    setShowFormModal(true);
  };

  const handleConfirmAction = (action: 'delete' | 'activate' | 'deactivate' | 'resend', subscription: Subscription) => {
    const actions = {
      delete: {
        title: 'Delete Subscriber',
        message: `Are you sure you want to delete "${subscription.email}"? This action cannot be undone.`,
        confirmText: 'Delete',
        type: 'danger' as const,
      },
      activate: {
        title: 'Activate Subscriber',
        message: `Are you sure you want to activate "${subscription.email}"?`,
        confirmText: 'Activate',
        type: 'success' as const,
      },
      deactivate: {
        title: 'Deactivate Subscriber',
        message: `Are you sure you want to deactivate "${subscription.email}"?`,
        confirmText: 'Deactivate',
        type: 'warning' as const,
      },
      resend: {
        title: 'Resend Confirmation',
        message: `Send a new confirmation email to "${subscription.email}"?`,
        confirmText: 'Send Email',
        type: 'info' as const,
      },
    };

    const actionConfig = actions[action];
    setConfirmAction({
      type: action,
      id: subscription.id,
      title: actionConfig.title,
      message: actionConfig.message,
    });
    setShowConfirmModal(true);
  };

  const handleRefresh = async () => {
    await fetchSubscriptions();
    await fetchStats();
    toast.success('Refreshed!');
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      unsubscribed: 'bg-red-100 text-red-700',
    };
    return styles[status] || styles.inactive;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <FaCheckCircle className="text-green-500" />;
      case 'inactive': return <FaTimesCircle className="text-gray-500" />;
      case 'unsubscribed': return <FaBan className="text-red-500" />;
      default: return <FaExclamationTriangle className="text-yellow-500" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSubscriptions(), fetchStats()]);
    };
    loadData();
  }, []);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (!confirmAction) return;
          switch(confirmAction.type) {
            case 'delete':
              handleDelete(confirmAction.id);
              break;
            case 'activate':
              handleActivate(confirmAction.id);
              break;
            case 'deactivate':
              handleDeactivate(confirmAction.id);
              break;
            case 'resend':
              handleResendConfirmation(confirmAction.id);
              break;
          }
        }}
        title={confirmAction?.title || 'Confirm'}
        message={confirmAction?.message || 'Are you sure?'}
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : 
                     confirmAction?.type === 'activate' ? 'Activate' :
                     confirmAction?.type === 'deactivate' ? 'Deactivate' : 'Send'}
        type={confirmAction?.type === 'delete' ? 'danger' :
              confirmAction?.type === 'activate' ? 'success' :
              confirmAction?.type === 'deactivate' ? 'warning' : 'info'}
        isLoading={isProcessing}
      />

      {/* Form Modal */}
      <SubscriptionFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedSubscription(null);
        }}
        onSave={formMode === 'create' ? handleCreate : handleUpdate}
        subscription={selectedSubscription}
        isLoading={isProcessing}
        mode={formMode}
      />

      {/* View Modal */}
      <ViewSubscriptionModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedSubscription(null);
          setLogs([]);
        }}
        subscription={selectedSubscription}
        logs={logs}
        loadingLogs={loadingLogs}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscriptions Management</h1>
            <p className="text-sm text-gray-600">Manage newsletter subscribers</p>
            <p className="text-xs text-gray-400 mt-1">{subscriptions.length} subscribers total</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-cyan-500">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-gray-500">
            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            <p className="text-xs text-gray-500">Inactive</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-red-500">
            <p className="text-2xl font-bold text-red-600">{stats.unsubscribed}</p>
            <p className="text-xs text-gray-500">Unsubscribed</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            <p className="text-xs text-gray-500">Confirmed</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by email or name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
            <select
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="newsletter">Newsletter</option>
              <option value="weekly_digest">Weekly Digest</option>
              <option value="prayer_updates">Prayer Updates</option>
              <option value="event_notifications">Event Notifications</option>
              <option value="sermon_updates">Sermon Updates</option>
              <option value="all">All Updates</option>
            </select>
            <select
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
              value={filterConfirmed}
              onChange={(e) => setFilterConfirmed(e.target.value)}
            >
              <option value="all">All Confirmation</option>
              <option value="true">Confirmed</option>
              <option value="false">Unconfirmed</option>
            </select>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterType('all');
                setFilterConfirmed('all');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-cyan-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <FaEnvelope className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p>No subscribers found</p>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{subscription.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{subscription.name || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-600">{subscription.subscription_type_display}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(subscription.status)}`}>
                          {getStatusIcon(subscription.status)}
                          <span>{subscription.status_display}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {subscription.is_confirmed ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaTimesCircle className="text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{formatDate(subscription.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleView(subscription)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEdit(subscription)}
                            className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          {!subscription.is_confirmed && (
                            <button
                              onClick={() => handleConfirmAction('resend', subscription)}
                              className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                              title="Resend Confirmation"
                            >
                              <FaEnvelopeOpen />
                            </button>
                          )}
                          {subscription.status === 'active' ? (
                            <button
                              onClick={() => handleConfirmAction('deactivate', subscription)}
                              className="p-2 text-gray-500 hover:text-yellow-600 transition-colors rounded-lg hover:bg-yellow-50"
                              title="Deactivate"
                            >
                              <FaTimesCircle />
                            </button>
                          ) : subscription.status === 'inactive' ? (
                            <button
                              onClick={() => handleConfirmAction('activate', subscription)}
                              className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                              title="Activate"
                            >
                              <FaCheckCircle />
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleConfirmAction('delete', subscription)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 bg-white rounded-xl shadow-md px-6 py-3">
        <span>Showing {subscriptions.length} subscribers</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Active: {stats?.active || 0}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
            Inactive: {stats?.inactive || 0}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            Unsubscribed: {stats?.unsubscribed || 0}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
            Confirmed: {stats?.confirmed || 0}
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

export default SubscriptionsManagement;
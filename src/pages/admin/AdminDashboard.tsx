// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaUsers, FaGraduationCap, FaPlus, FaEye, FaEdit, FaTrash, FaSearch,
  FaUserPlus, FaFileAlt, FaChartBar, FaClipboardList,
  FaCertificate, FaBell, FaArchive,
  FaCheckCircle,
  FaExclamationTriangle, FaFire,
  FaUserTie, FaUserGraduate, FaSpinner,
  FaShare, FaHeart, FaBible, FaTimes,
} from 'react-icons/fa';
import { useAdmin } from '../../auth/context/AdminContext';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================
interface Group {
  id: string;
  name: string;
  type: 'evangelist' | 'student';
  memberCount: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface RecentActivity {
  id: string;
  type: 'sermon' | 'group' | 'student' | 'exam' | 'certificate';
  title: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'active' | 'warning';
  sermonId?: number;
  author?: string;
  views?: number;
  likes?: number;
}

interface SermonActivity {
  id: number;
  title: string;
  topic: string;
  author_name: string;
  author: number;
  views: number;
  likes: number;
  shares: number;
  status: string;
  created_at: string;
  published_at: string | null;
  content: string;
  questions_count: number;
}

// ============================================
// CONFIRMATION MODAL COMPONENT
// ============================================
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  icon
}) => {
  
  
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch(type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          iconBg: 'bg-cyan-100',
          iconColor: 'text-cyan-600',
          buttonBg: 'bg-cyan-600 hover:bg-cyan-700',
          borderColor: 'border-cyan-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${styles.iconBg}`}>
                {icon || <FaExclamationTriangle className={`text-2xl ${styles.iconColor}`} />}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// VIEW SERMON MODAL
// ============================================
interface ViewSermonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: SermonActivity | null;
}

const ViewSermonModal: React.FC<ViewSermonModalProps> = ({ isOpen, onClose, sermon }) => {
  const { t } = useTranslation();
  
  if (!isOpen || !sermon) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <FaBible className="text-white text-xl" />
            <div>
              <h3 className="text-white font-bold text-lg">{sermon.title}</h3>
              <p className="text-cyan-100 text-sm">{t('admin.sermonDetails')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded">
              {sermon.topic || t('sermons.general')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              sermon.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {sermon.status === 'published' ? t('sermons.published') : t('sermons.draft')}
            </span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold">
              {sermon.author_name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{sermon.author_name || t('sermons.unknown')}</p>
              <p className="text-xs text-gray-500">
                {t('admin.publishedOn')}: {sermon.published_at ? new Date(sermon.published_at).toLocaleDateString() : t('admin.notPublished')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <FaEye className="text-cyan-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{sermon.views || 0}</p>
              <p className="text-xs text-gray-500">{t('dashboard.views')}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <FaHeart className="text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{sermon.likes || 0}</p>
              <p className="text-xs text-gray-500">{t('dashboard.likes')}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <FaShare className="text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{sermon.shares || 0}</p>
              <p className="text-xs text-gray-500">{t('sermons.shares')}</p>
            </div>
          </div>

          {sermon.content && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('admin.contentPreview')}</h4>
              <p className="text-sm text-gray-600 line-clamp-5">
                {sermon.content.substring(0, 300)}...
              </p>
            </div>
          )}

          {sermon.questions_count !== undefined && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-sm text-gray-600">{t('admin.questions')}</span>
              <span className="text-lg font-bold text-purple-600">{sermon.questions_count || 0}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onClose();
                window.open(`/sermons/${sermon.id}`, '_blank');
              }}
              className="flex-1 flex items-center justify-center px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <FaEye className="mr-2" />
              {t('admin.viewFullSermon')}
            </button>
            <button
              onClick={() => {
                onClose();
                window.open(`/admin/sermons/edit/${sermon.id}`, '_blank');
              }}
              className="flex-1 flex items-center justify-center px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <FaEdit className="mr-2" />
              {t('admin.editSermon')}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    sermons, 
    sermonStats,
    refreshAllSermons,
    refreshSermonStats,
    refreshExamSubmissions,
    students,
    evangelists,
    groups,
    examSubmissions,
    deleteSermon,
    publishSermon,
    updateSermon
  } = useAdmin();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'evangelists' | 'students' | 'sermons'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // ========== MODAL STATES ==========
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'publish' | 'archive';
    id: number;
    title: string;
    message: string;
  } | null>(null);
  const [selectedSermon, setSelectedSermon] = useState<SermonActivity | null>(null);

  // ========== FETCH DATA ==========
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshAllSermons(),
          refreshSermonStats(),
          refreshExamSubmissions()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // ========== BUILD ACTIVITIES FROM SERMONS ==========
  useEffect(() => {
    if (sermons && sermons.length > 0) {
      const sermonActivities: RecentActivity[] = sermons
        .filter((s: any) => s.status === 'published')
        .slice(0, 10)
        .map((sermon: any) => ({
          id: `sermon-${sermon.id}`,
          type: 'sermon',
          title: sermon.title,
          timestamp: sermon.published_at || sermon.created_at,
          status: 'completed',
          sermonId: sermon.id,
          author: sermon.author_name,
          views: sermon.views,
          likes: sermon.likes,
        }));

      const draftActivities: RecentActivity[] = sermons
        .filter((s: any) => s.status === 'draft')
        .slice(0, 5)
        .map((sermon: any) => ({
          id: `draft-${sermon.id}`,
          type: 'sermon',
          title: `${t('dashboard.draft')}: ${sermon.title}`,
          timestamp: sermon.created_at,
          status: 'pending',
          sermonId: sermon.id,
          author: sermon.author_name,
        }));

      const allActivities = [...sermonActivities, ...draftActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      setRecentActivities(allActivities);
    }
  }, [sermons, t]);

  // ========== STATS ==========
  const stats = {
    totalEvangelists: evangelists?.length || 0,
    totalStudents: students?.length || 0,
    totalGroups: groups?.length || 0,
    totalSermons: sermonStats?.total || sermons?.length || 0,
    pendingExams: examSubmissions?.filter((e: any) => e.status === 'pending').length || 0,
    certificatesIssued: 156,
    activeUsers: students?.filter((s: any) => s.status === 'active').length || 0,
    totalViews: sermonStats?.total_views || 0,
    publishedSermons: sermonStats?.published || sermons?.filter((s: any) => s.status === 'published').length || 0,
    draftSermons: sermonStats?.draft || sermons?.filter((s: any) => s.status === 'draft').length || 0,
  };

  // ========== GROUPS DATA ==========
  const groupsData: Group[] = groups?.map((g: any) => ({
    id: String(g.id),
    name: g.name,
    type: g.type || 'student',
    memberCount: g.member_count || 0,
    createdAt: g.created_at,
    status: g.is_active ? 'active' : 'inactive'
  })) || [];

  // ========== HELPERS ==========
  const getActivityIcon = (type: string) => {
    const icons = {
      sermon: <FaBible className="text-cyan-500" />,
      group: <FaUsers className="text-cyan-500" />,
      student: <FaGraduationCap className="text-cyan-500" />,
      exam: <FaClipboardList className="text-cyan-500" />,
      certificate: <FaCertificate className="text-cyan-500" />,
    };
    return icons[type as keyof typeof icons] || <FaBell className="text-cyan-500" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      active: 'bg-cyan-100 text-cyan-700',
      warning: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: t('admin.published'),
      pending: t('admin.draft'),
      active: t('admin.active'),
      warning: t('admin.warning'),
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('dashboard.justNow');
    if (diffMins < 60) return t('dashboard.minAgo', { count: diffMins });
    if (diffHours < 24) return t('dashboard.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('dashboard.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  // ========== ACTION HANDLERS WITH MODALS ==========
  
  const handleViewSermon = (sermon: any) => {
    setSelectedSermon(sermon);
    setShowViewModal(true);
  };

  const handleEditSermon = (sermonId: number) => {
    navigate(`/admin/sermons/edit/${sermonId}`);
  };

  const handlePublishSermonAction = (sermon: any) => {
    setConfirmAction({
      type: 'publish',
      id: sermon.id,
      title: sermon.title,
      message: t('admin.publishConfirm', { title: sermon.title })
    });
    setShowConfirmModal(true);
  };

  const handleArchiveSermonAction = (sermon: any) => {
    setConfirmAction({
      type: 'archive',
      id: sermon.id,
      title: sermon.title,
      message: t('admin.archiveConfirm', { title: sermon.title })
    });
    setShowConfirmModal(true);
  };

  // ========== CONFIRM ACTION EXECUTION ==========
  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'delete':
          await deleteSermon(confirmAction.id);
          toast.success(t('admin.sermonDeleted', { title: confirmAction.title }));
          break;
        case 'publish':
          await publishSermon(confirmAction.id);
          toast.success(t('admin.sermonPublished', { title: confirmAction.title }));
          break;
        case 'archive':
          await updateSermon(confirmAction.id, { status: 'archived' } as any);
          toast.success(t('admin.sermonArchived', { title: confirmAction.title }));
          break;
      }
      
      await refreshAllSermons();
      await refreshSermonStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('admin.actionFailed'));
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  // ========== QUICK ACTIONS ==========
  const quickActions = [
    { icon: <FaUserPlus />, label: t('admin.addEvangelist'), color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin/evangelists' },
    { icon: <FaPlus />, label: t('admin.createSermon'), color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin/create-sermon' },
    { icon: <FaUsers />, label: t('admin.createGroup'), color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin/create-group' },
    { icon: <FaFileAlt />, label: t('admin.viewReports'), color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin' },
    { icon: <FaCertificate />, label: t('admin.certificates'), color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin/issue-certificate' },
    { icon: <FaBell />, label: t('admin.notifications'), color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin' },
  ];

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            {t('admin.dashboard')}
          </h1>
          <p className="mt-1 text-gray-600">
            {t('admin.dashboardDesc')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/admin/create-group" 
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaUserPlus />
            <span>{t('admin.createGroup')}</span>
          </Link>
          <Link 
            to="/admin/create-sermon" 
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>{t('admin.newSermon')}</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('admin.evangelists')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvangelists}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaUsers className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('admin.students')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaGraduationCap className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('admin.sermons')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSermons}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-green-600">{t('admin.published')}: {stats.publishedSermons}</span>
                <span className="text-xs text-yellow-600">{t('admin.drafts')}: {stats.draftSermons}</span>
              </div>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaBible className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.totalViews')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaEye className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaFire className="text-cyan-500 mr-2" />
          {t('admin.quickActions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className={`flex flex-col items-center justify-center p-4 ${action.bg} rounded-xl hover:shadow-md transition-all transform hover:-translate-y-1`}
            >
              <span className={`${action.color} text-2xl mb-2`}>{action.icon}</span>
              <span className={`text-xs font-medium ${action.color}`}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <nav className="flex flex-wrap gap-2">
          {['overview', 'groups', 'evangelists', 'students', 'sermons'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as any);
                if (tab !== 'overview') {
                  navigate(`/admin/${tab}`);
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t(`admin.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaBell className="text-cyan-500 mr-2" />
                  {t('dashboard.recentActivity')}
                </h3>
                <button 
                  onClick={() => navigate('/admin/sermons')}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  {t('admin.viewAllSermons')}
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-4 border-cyan-200"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 rounded-full bg-cyan-50">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            {activity.type === 'sermon' && activity.author && (
                              <span className="text-xs text-gray-400">
                                {t('dashboard.by')} {activity.author}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.timestamp)}
                            </span>
                            {activity.type === 'sermon' && (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                {activity.views !== undefined && (
                                  <span className="flex items-center">
                                    <FaEye className="mr-1 text-xs" /> {activity.views}
                                  </span>
                                )}
                                {activity.likes !== undefined && (
                                  <span className="flex items-center">
                                    <FaHeart className="mr-1 text-xs text-red-400" /> {activity.likes}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                          {getStatusLabel(activity.status)}
                        </span>
                        {activity.type === 'sermon' && activity.sermonId && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                const sermon = sermons.find((s: any) => s.id === activity.sermonId);
                                if (sermon) handleViewSermon(sermon);
                              }}
                              className="p-1.5 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                              title={t('admin.viewSermon')}
                            >
                              <FaEye size={12} />
                            </button>
                            <button
                              onClick={() => handleEditSermon(activity.sermonId!)}
                              className="p-1.5 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                              title={t('admin.editSermon')}
                            >
                              <FaEdit size={12} />
                            </button>
                            {activity.status === 'pending' && (
                              <button
                                onClick={() => {
                                  const sermon = sermons.find((s: any) => s.id === activity.sermonId);
                                  if (sermon) handlePublishSermonAction(sermon);
                                }}
                                className="p-1.5 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                                title={t('admin.publishSermon')}
                              >
                                <FaCheckCircle size={12} />
                              </button>
                            )}
                            {activity.status === 'completed' && (
                              <button
                                onClick={() => {
                                  const sermon = sermons.find((s: any) => s.id === activity.sermonId);
                                  if (sermon) handleArchiveSermonAction(sermon);
                                }}
                                className="p-1.5 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                title={t('admin.archiveSermon')}
                              >
                                <FaArchive size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FaBible className="text-4xl text-cyan-200 mx-auto mb-3" />
                    <p className="text-gray-500">{t('admin.noSermonsYet')}</p>
                    <Link 
                      to="/admin/create-sermon" 
                      className="text-cyan-600 hover:text-cyan-700 font-medium inline-block mt-2"
                    >
                      {t('admin.createFirstSermon')}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartBar className="text-cyan-500 mr-2" />
                {t('admin.quickStats')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('admin.activeUsers')}</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('dashboard.pendingExams')}</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.pendingExams}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('admin.publishedSermons')}</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.publishedSermons}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('admin.draftSermons')}</span>
                  <span className="text-lg font-bold text-yellow-600">{stats.draftSermons}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t('dashboard.totalViews')}</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.totalViews.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('admin.searchGroups')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link to="/admin/create-group" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaPlus />
                <span>{t('admin.newGroup')}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupsData.length > 0 ? (
                groupsData.map((group) => (
                  <div key={group.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                        <p className="text-sm text-gray-600">
                          {group.type === 'evangelist' ? t('admin.evangelistGroup') : t('admin.studentGroup')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full bg-cyan-100 text-cyan-700`}>
                        {group.memberCount} {t('admin.members')}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {t('admin.created')}: {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Link to={`/admin/groups/${group.id}`} className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50">
                          <FaEye />
                        </Link>
                        <Link to={`/admin/groups/edit/${group.id}`} className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50">
                          <FaEdit />
                        </Link>
                        <button className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white rounded-xl shadow-md p-8 text-center">
                  <FaUsers className="text-4xl text-cyan-400 mx-auto mb-3" />
                  <p className="text-gray-500">{t('admin.noGroupsFound')}</p>
                  <Link to="/admin/create-group" className="text-cyan-600 hover:text-cyan-700 font-medium inline-block mt-2">
                    {t('admin.createFirstGroup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'evangelists' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('admin.searchEvangelists')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <Link to="/admin/evangelists" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaUserPlus />
                <span>{t('admin.addEvangelist')}</span>
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaUserTie className="text-4xl text-cyan-400 mx-auto mb-3" />
              <p className="text-gray-500">{t('admin.evangelistsRegistered', { count: evangelists?.length || 0 })}</p>
              <Link to="/admin/evangelists" className="text-cyan-600 hover:text-cyan-700 font-medium inline-block mt-2">
                {t('admin.viewAllEvangelists')}
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('admin.searchStudents')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <Link to="/admin/students" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaPlus />
                <span>{t('admin.addStudent')}</span>
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaUserGraduate className="text-4xl text-cyan-400 mx-auto mb-3" />
              <p className="text-gray-500">{t('admin.studentsRegistered', { count: students?.length || 0 })}</p>
              <Link to="/admin/students" className="text-cyan-600 hover:text-cyan-700 font-medium inline-block mt-2">
                {t('admin.viewAllStudents')}
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'sermons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('admin.searchSermons')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <Link to="/admin/create-sermon" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaPlus />
                <span>{t('admin.newSermon')}</span>
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaBible className="text-4xl text-cyan-400 mx-auto mb-3" />
              <p className="text-gray-500">{t('admin.sermonsCreated', { count: sermons?.length || 0 })}</p>
              <p className="text-sm text-gray-400">
                {t('admin.publishedCount', { count: stats.publishedSermons })} · {t('admin.draftCount', { count: stats.draftSermons })}
              </p>
              <Link to="/admin/sermons" className="text-cyan-600 hover:text-cyan-700 font-medium inline-block mt-2">
                {t('admin.viewAllSermons')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ============================================
          CONFIRMATION MODAL
          ============================================ */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={executeConfirmAction}
        title={confirmAction?.type === 'delete' ? t('admin.deleteSermon') : 
               confirmAction?.type === 'publish' ? t('admin.publishSermon') : 
               t('admin.archiveSermon')}
        message={confirmAction?.message || t('admin.areYouSure')}
        confirmText={confirmAction?.type === 'delete' ? t('admin.delete') : 
                     confirmAction?.type === 'publish' ? t('admin.publish') : 
                     t('admin.archive')}
        type={confirmAction?.type === 'delete' ? 'danger' : 
              confirmAction?.type === 'publish' ? 'info' : 
              'warning'}
        icon={confirmAction?.type === 'delete' ? <FaTrash className="text-red-600 text-2xl" /> :
              confirmAction?.type === 'publish' ? <FaCheckCircle className="text-green-600 text-2xl" /> :
              <FaArchive className="text-yellow-600 text-2xl" />}
      />

      {/* ============================================
          VIEW SERMON MODAL
          ============================================ */}
      <ViewSermonModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedSermon(null);
        }}
        sermon={selectedSermon}
      />

      {/* Animation Styles */}
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

export default AdminDashboard;
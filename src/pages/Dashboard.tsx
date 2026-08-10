// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/context/AuthContext';
import { useAdmin } from '../auth/context/AdminContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaBook, 
  FaClock, FaArrowRight,
  FaBell, 
  FaCertificate, FaBible,
  FaEye, 
  FaUserGraduate, 
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaHome,
  FaSignOutAlt,
  FaUserTie,
  FaGraduationCap,
  FaClipboardList,
  FaNewspaper,
  FaShare,
  FaHeart,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaChevronRight,
  FaCog,
} from 'react-icons/fa';

// ============================================
// TYPES
// ============================================

interface RecentSermon {
  id: string;
  title: string;
  topic: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  shares: number;
  status: 'new' | 'ongoing' | 'completed';
}

// ============================================
// NAVIGATION ITEMS BY ROLE
// ============================================

const getNavigationItems = (role: string, t: any) => {
  const commonItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: <FaHome />, description: t('dashboard.mainOverview') },
    { to: '/sermons', label: t('nav.sermons'), icon: <FaBible />, description: t('dashboard.browseSermons') },
    { to: '/profile', label: t('nav.profile'), icon: <FaUser />, description: t('dashboard.profileSettings') },
    { to: '/certificates', label: t('nav.certificates'), icon: <FaCertificate />, description: t('dashboard.earnedCertificates') },
    { to: '/settings', label: t('profile.accountSettings'), icon: <FaCog />, description: t('dashboard.languageSettings') },
  ];
  
  const roleBasedItems: Record<string, any[]> = {
    admin: [
      ...commonItems,
      { to: '/admin/users', label: t('dashboard.userManagement'), icon: <FaUsers />, description: t('dashboard.manageUsers') },
      { to: '/admin/students', label: t('dashboard.students'), icon: <FaGraduationCap />, description: t('dashboard.manageStudents') },
      { to: '/admin/evangelists', label: t('dashboard.evangelists'), icon: <FaUserTie />, description: t('dashboard.manageEvangelists') },
      { to: '/admin/groups', label: t('dashboard.groups'), icon: <FaUsers />, description: t('dashboard.manageGroups') },
      { to: '/admin/sermons', label: t('dashboard.sermons'), icon: <FaBook />, description: t('dashboard.manageSermons') },
      { to: '/admin/subscriptions', label: t('dashboard.subscriptions'), icon: <FaNewspaper />, description: t('dashboard.manageNewsletter') },
      { to: '/admin/issue-certificate', label: t('dashboard.issueCertificate'), icon: <FaCertificate />, description: t('dashboard.issueNewCertificates') },
    ],
    evangelist: [
      ...commonItems,
      { to: '/ev/dashboard', label: t('dashboard.evangelistDashboard'), icon: <FaChartBar />, description: t('dashboard.evangelistOverview') },
      { to: '/admin/users', label: t('dashboard.userManagement'), icon: <FaUsers />, description: t('dashboard.manageUsers') },
      { to: '/ev/dashboard', label: t('dashboard.myStudents'), icon: <FaGraduationCap />, description: t('dashboard.yourStudents') },
      { to: '/admin/groups', label: t('dashboard.myGroups'), icon: <FaUsers />, description: t('dashboard.yourGroups') },
      { to: '/admin/students', label: t('dashboard.students'), icon: <FaGraduationCap />, description: t('dashboard.manageStudents') },
      { to: '/admin/issue-certificate', label: t('dashboard.issueCertificate'), icon: <FaCertificate />, description: t('dashboard.issueNewCertificates') },
      { to: '/admin/sermons', label: t('dashboard.mySermons'), icon: <FaBook />, description: t('dashboard.yourSermons') },
      { to: '/evangelist/exams', label: t('dashboard.examManagement'), icon: <FaClipboardList />, description: t('dashboard.gradeExams') },
    ],
    student: [
      ...commonItems,
      { to: '/students', label: t('dashboard.studentDashboard'), icon: <FaChartBar />, description: t('dashboard.studentOverview') },
      { to: '/student/exams', label: t('dashboard.myExams'), icon: <FaClipboardList />, description: t('dashboard.viewExams') },
      { to: '/admin/groups', label: t('dashboard.myGroups'), icon: <FaUsers />, description: t('dashboard.yourGroups') },
    ],
    church_admin: [
      ...commonItems,
      { to: '/admin/students', label: t('dashboard.students'), icon: <FaGraduationCap />, description: t('dashboard.manageStudents') },
      { to: '/admin/evangelists', label: t('dashboard.evangelists'), icon: <FaUserTie />, description: t('dashboard.manageEvangelists') },
      { to: '/admin/groups', label: t('dashboard.groups'), icon: <FaUsers />, description: t('dashboard.manageGroups') },
      { to: '/admin/sermons', label: t('dashboard.sermons'), icon: <FaBook />, description: t('dashboard.manageSermons') },
    ],
    super_admin: [
      ...commonItems,
      { to: '/admin/users', label: t('dashboard.userManagement'), icon: <FaUsers />, description: t('dashboard.manageUsers') },
      { to: '/admin/students', label: t('dashboard.students'), icon: <FaGraduationCap />, description: t('dashboard.manageStudents') },
      { to: '/admin/evangelists', label: t('dashboard.evangelists'), icon: <FaUserTie />, description: t('dashboard.manageEvangelists') },
      { to: '/admin/groups', label: t('dashboard.groups'), icon: <FaUsers />, description: t('dashboard.manageGroups') },
      { to: '/admin/sermons', label: t('dashboard.sermons'), icon: <FaBook />, description: t('dashboard.manageSermons') },
      { to: '/admin/subscriptions', label: t('dashboard.subscriptions'), icon: <FaNewspaper />, description: t('dashboard.manageNewsletter') },
      { to: '/admin/issue-certificate', label: t('dashboard.issueCertificate'), icon: <FaCertificate />, description: t('dashboard.issueNewCertificates') },
    ],
  };
  
  return roleBasedItems[role] || commonItems;
};

// ============================================
// MAIN COMPONENT
// ============================================

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { 
    sermons, 
    students, 
    evangelists, 
    examSubmissions,
    loadingSermons,
    loadingStudents,
    loadingExams,
    refreshAllSermons,
    refreshAllStudents,
    refreshExamSubmissions,
    refreshEvangelists
  } = useAdmin();
  
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          refreshAllSermons(),
          refreshAllStudents(),
          refreshExamSubmissions(),
          refreshEvangelists()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();
  }, []);

  // ============================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ============================================
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // PUBLIC STATS FROM ALL DATA
  // ============================================

  const publicStats = {
    totalSermons: sermons?.length || 0,
    totalStudents: students?.length || 0,
    totalEvangelists: evangelists?.length || 0,
    pendingExams: examSubmissions?.filter((e: any) => e.status === 'pending').length || 0,
    certificatesIssued: students?.reduce((acc: number, s: any) => acc + (s.certificates_earned || 0), 0) || 0,
    totalViews: sermons?.reduce((acc: number, s: any) => acc + (s.views || 0), 0) || 0,
    totalLikes: sermons?.reduce((acc: number, s: any) => acc + (s.likes || 0), 0) || 0,
  };

  // ============================================
  // PUBLIC RECENT SERMONS
  // ============================================

  const recentSermons: RecentSermon[] = (sermons || [])
    .slice(0, 6)
    .map((sermon: any) => ({
      id: String(sermon.id),
      title: sermon.title || t('sermons.untitled'),
      topic: sermon.topic || t('sermons.general'),
      author: sermon.author_name || t('sermons.unknown'),
      date: sermon.published_at || sermon.created_at || new Date().toISOString(),
      views: sermon.views || 0,
      likes: sermon.likes || 0,
      shares: sermon.shares || 0,
      status: sermon.status === 'published' ? 'ongoing' : 
               sermon.status === 'draft' ? 'new' : 'completed'
    }));

  // ============================================
  // PUBLIC RECENT ACTIVITIES
  // ============================================

  const recentActivities = (sermons || [])
    .slice(0, 10)
    .map((sermon: any) => ({
      id: sermon.id,
      title: sermon.title || t('sermons.untitled'),
      type: sermon.status === 'published' ? 'published' : 'created',
      timestamp: sermon.published_at || sermon.created_at || new Date().toISOString(),
      author: sermon.author_name || t('sermons.unknown'),
      views: sermon.views || 0,
      likes: sermon.likes || 0,
    }));

  // ============================================
  // HANDLERS
  // ============================================

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const handleViewSermon = (sermonId: string, sermonTitle: string) => {
    navigate(`/join/sermon-${sermonId}?sermon=${encodeURIComponent(sermonTitle)}`);
  };

  // ============================================
  // HELPERS
  // ============================================

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">{t('dashboard.status.new')}</span>;
      case 'ongoing':
        return <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{t('dashboard.status.ongoing')}</span>;
      case 'completed':
        return <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">{t('dashboard.status.completed')}</span>;
      default:
        return null;
    }
  };

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

  const userRole = user?.role || 'student';
  const navigationItems = getNavigationItems(userRole, t);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loadingSermons || loadingStudents || loadingExams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-cyan-600">{t('common.appName')}</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  {getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt={user?.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm border-2 border-cyan-500">
                      {getUserInitials()}
                    </div>
                  )}
                  
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {getRoleDisplayName()}
                    </p>
                  </div>
                  
                  <span className="hidden md:block text-gray-400 text-sm">
                    {isDropdownOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-gray-100">
                    <style>{`
                      .scrollbar-thin::-webkit-scrollbar {
                        width: 6px;
                      }
                      .scrollbar-thin::-webkit-scrollbar-track {
                        background: #f3f4f6;
                        border-radius: 3px;
                      }
                      .scrollbar-thin::-webkit-scrollbar-thumb {
                        background: #c4d1d9;
                        border-radius: 3px;
                      }
                      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                        background: #a0b3c4;
                      }
                    `}</style>

                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                      <div className="flex items-center space-x-3">
                        {getProfilePicture() ? (
                          <img
                            src={getProfilePicture()}
                            alt={user?.full_name || 'User'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-cyan-500">
                            {getUserInitials()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.email || 'No email'}
                          </p>
                          <p className="text-xs text-cyan-600 capitalize">
                            {getRoleDisplayName()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Items with Scroll */}
                    <div className="py-1">
                      {navigationItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.to}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-3 text-gray-400 group-hover:text-cyan-500 transition-colors text-lg">
                            {item.icon}
                          </span>
                          <div className="flex-1">
                            <span className="font-medium">{item.label}</span>
                            {item.description && (
                              <p className="text-xs text-gray-400 group-hover:text-gray-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <FaChevronRight className="text-gray-300 group-hover:text-cyan-400 text-xs transition-colors" />
                        </Link>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      disabled={authLoading}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 group"
                    >
                      <FaSignOutAlt className="mr-3 text-red-400 group-hover:text-red-500 transition-colors text-lg" />
                      <span className="font-medium">{authLoading ? t('common.loading') : t('nav.logout')}</span>
                      {authLoading && <FaSpinner className="ml-2 animate-spin" />}
                    </button>

                    {/* Scroll Indicator */}
                    <div className="px-4 py-2 text-center border-t border-gray-100 sticky bottom-0 bg-white">
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                        <FaChevronUp className="text-gray-300" size={10} />
                        <span>{t('dashboard.scrollForMore')}</span>
                        <FaChevronDown className="text-gray-300" size={10} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-white-600 to-white-600 rounded-2xl p-8 text-dark">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold">
                  {t('dashboard.welcomeBack', { name: user?.full_name || t('dashboard.believer') })}
                </h1>
                <p className="mt-2 text-dark-100">
                  {userRole === 'admin' && t('dashboard.adminDesc')}
                  {userRole === 'evangelist' && t('dashboard.evangelistDesc')}
                  {userRole === 'student' && t('dashboard.studentDesc')}
                  {userRole === 'super_admin' && t('dashboard.superAdminDesc')}
                  {userRole === 'church_admin' && t('dashboard.churchAdminDesc')}
                  {!userRole && t('dashboard.joinCommunity')}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-dark-100">
                  <span className="flex items-center">
                    <FaUser className="mr-1" /> {getRoleDisplayName()}
                  </span>
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-1" /> 
                    {t('dashboard.memberSince')} {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <span className="text-6xl opacity-20">✝</span>
              </div>
            </div>

            {/* Public Stats for User */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-sm text-dark-100">{t('dashboard.totalSermons')}</p>
                <p className="text-2xl font-bold">{publicStats.totalSermons}</p>
              </div>
              <div>
                <p className="text-sm text-dark-100">{t('dashboard.totalStudents')}</p>
                <p className="text-2xl font-bold">{publicStats.totalStudents}</p>
              </div>
              <div>
                <p className="text-sm text-dark-100">{t('dashboard.pendingExams')}</p>
                <p className="text-2xl font-bold">{publicStats.pendingExams}</p>
              </div>
              <div>
                <p className="text-sm text-dark-100">{t('dashboard.totalViews')}</p>
                <p className="text-2xl font-bold">{publicStats.totalViews}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.totalSermons')}</p>
                  <p className="text-2xl font-bold text-gray-900">{publicStats.totalSermons}</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-full">
                  <FaBook className="text-cyan-600 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  {publicStats.totalSermons > 0 
                    ? t('dashboard.sermonsShared', { count: publicStats.totalSermons }) 
                    : t('dashboard.noSermonsYet')}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.totalStudents')}</p>
                  <p className="text-2xl font-bold text-gray-900">{publicStats.totalStudents}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUserGraduate className="text-blue-600 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  {publicStats.totalStudents > 0 
                    ? t('dashboard.studentsEnrolled', { count: publicStats.totalStudents }) 
                    : t('dashboard.noStudentsYet')}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.pendingExams')}</p>
                  <p className="text-2xl font-bold text-gray-900">{publicStats.pendingExams}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaClock className="text-yellow-600 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-yellow-600">
                  {publicStats.pendingExams > 0 
                    ? t('dashboard.examsNeedGrading', { count: publicStats.pendingExams }) 
                    : t('dashboard.allGraded')}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.totalViews')}</p>
                  <p className="text-2xl font-bold text-gray-900">{publicStats.totalViews}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaEye className="text-purple-600 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-purple-600">
                  {publicStats.totalViews > 0 
                    ? t('dashboard.totalViewsCount', { count: publicStats.totalViews }) 
                    : t('dashboard.noViewsYet')}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Sermons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FaBible className="mr-2 text-cyan-500" />
                {t('dashboard.recentSermons')}
              </h2>
              <Link to="/sermons" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center">
                {t('dashboard.viewAll')} <FaArrowRight className="ml-1" />
              </Link>
            </div>
            
            {recentSermons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentSermons.map((sermon) => (
                  <div key={sermon.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <FaBible className="text-cyan-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{sermon.title}</h4>
                          <p className="text-sm text-gray-600">{t('sermons.topic')}: {sermon.topic}</p>
                          <p className="text-xs text-gray-500 mt-1">{t('dashboard.by')} {sermon.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusBadge(sermon.status)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center">
                        <FaEye className="inline mr-1 text-gray-400" />
                        {sermon.views} {t('dashboard.views')}
                      </span>
                      <span className="text-gray-500 flex items-center">
                        <FaHeart className="inline mr-1 text-red-400" />
                        {sermon.likes} {t('dashboard.likes')}
                      </span>
                      <span className="text-gray-500">
                        <FaCalendarAlt className="inline mr-1 text-gray-400" />
                        {new Date(sermon.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleViewSermon(sermon.id, sermon.title)}
                        className="flex-1 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('sermons.viewSermon')}
                      </button>
                      <button className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium transition-colors">
                        <FaShare />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('dashboard.noSermons')}</p>
                <Link to="/admin/create-sermon" className="inline-block mt-2 text-cyan-600 hover:text-cyan-700 font-medium">
                  {t('dashboard.createFirst')}
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaBell className="mr-2 text-cyan-500" />
              {t('dashboard.recentActivity')}
            </h2>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                      <FaBible className="text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.type === 'published' ? t('dashboard.published') : t('dashboard.created')}: "{activity.title}"
                        </p>
                        {activity.views > 0 && (
                          <span className="text-xs text-gray-400 flex items-center whitespace-nowrap">
                            <FaEye className="mr-1 text-xs" />
                            {activity.views}
                          </span>
                        )}
                        {activity.likes > 0 && (
                          <span className="text-xs text-gray-400 flex items-center whitespace-nowrap">
                            <FaHeart className="mr-1 text-red-400 text-xs" />
                            {activity.likes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">{t('dashboard.by')} {activity.author || 'Unknown'}</p>
                        <span className="text-xs text-gray-300">•</span>
                        <p className="text-xs text-gray-400">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewSermon(activity.id, activity.title)}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer whitespace-nowrap flex-shrink-0"
                    >
                      {t('dashboard.view')}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>{t('dashboard.noActivity')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(userRole === 'admin' || userRole === 'super_admin') && (
              <>
                <Link to="/admin/users" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 text-center group hover:bg-cyan-50">
                  <FaUsers className="text-3xl text-cyan-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-700">{t('dashboard.userManagement')}</p>
                </Link>
                <Link to="/admin/subscriptions" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 text-center group hover:bg-cyan-50">
                  <FaNewspaper className="text-3xl text-cyan-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-700">{t('dashboard.subscriptions')}</p>
                </Link>
              </>
            )}
            
            {userRole === 'evangelist' && (
              <Link to="/ev/dashboard" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 text-center group hover:bg-cyan-50">
                <FaChartBar className="text-3xl text-cyan-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-700">{t('dashboard.evangelistDashboard')}</p>
              </Link>
            )}
            
            {userRole === 'student' && (
              <Link to="/students" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 text-center group hover:bg-cyan-50">
                <FaGraduationCap className="text-3xl text-cyan-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-700">{t('dashboard.studentDashboard')}</p>
              </Link>
            )}
            
            <Link to="/certificates" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 text-center group hover:bg-cyan-50">
              <FaCertificate className="text-3xl text-cyan-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700">{t('dashboard.myCertificates')}</p>
            </Link>
            
            <Link to="/profile" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 text-center group hover:bg-cyan-50">
              <FaUser className="text-3xl text-cyan-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700">{t('dashboard.myProfile')}</p>
            </Link>
            
            <Link to="/settings" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 text-center group hover:bg-cyan-50">
              <FaCog className="text-3xl text-cyan-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700">{t('profile.accountSettings')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
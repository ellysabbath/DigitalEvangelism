// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { useAdmin } from '../auth/context/AdminContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaUsers, FaBook, FaGraduationCap, 
  FaClock, FaPlus, FaQrcode, FaArrowRight,
  FaBell, FaChartLine, FaUserCircle, FaSignOutAlt,
  FaCog, FaFileAlt, FaCertificate, FaBible,
  FaEye, FaHeart, FaShare, FaSpinner,
  FaChevronDown, FaChevronUp, FaHome,
  FaUserGraduate, FaChalkboardTeacher, FaBookOpen,
  FaCheckCircle, FaExclamationTriangle, FaCalendarAlt,
  FaFire, FaTag, FaUserTie
} from 'react-icons/fa';
import toast from 'react-hot-toast';

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
  students: number;
  status: 'new' | 'ongoing' | 'completed';
}

// ============================================
// MAIN COMPONENT
// ============================================

const Dashboard: React.FC = () => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================
  // FETCH DATA ON MOUNT - ONLY LOGGED-IN USER
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
  // FILTER DATA FOR LOGGED-IN USER ONLY
  // ============================================

  // Get only sermons created by the logged-in user
  const userSermons = sermons?.filter((sermon: any) => 
    sermon.author === user?.id || 
    sermon.author_name === user?.full_name
  ) || [];

  // Get only students assigned to this evangelist
  const userStudents = students?.filter((student: any) => 
    student.assigned_evangelist === user?.id ||
    student.assigned_evangelist === evangelists?.find((e: any) => e.user === user?.id)?.id
  ) || [];

  // Get only exams for this user's students
  const userExams = examSubmissions?.filter((exam: any) => {
    // If user is evangelist or admin, show exams of their students
    if (user?.role === 'evangelist' || user?.role === 'admin') {
      const studentIds = userStudents.map((s: any) => s.id);
      return studentIds.includes(exam.student);
    }
    // If user is student, show their own exams
    if (user?.role === 'student') {
      return exam.student === user?.id;
    }
    return false;
  }) || [];

  // ============================================
  // STATS FROM USER'S DATA ONLY
  // ============================================

  const stats = {
    totalSermons: userSermons.length,
    totalStudents: userStudents.length,
    totalEvangelists: evangelists?.filter((e: any) => e.user === user?.id).length || 0,
    pendingExams: userExams.filter((e: any) => e.status === 'pending').length || 0,
    certificatesIssued: userStudents.reduce((acc: number, s: any) => acc + (s.certificates_earned || 0), 0) || 0,
  };

  // ============================================
  // RECENT SERMONS FROM USER'S DATA ONLY
  // ============================================

  const recentSermons: RecentSermon[] = userSermons
    .slice(0, 3)
    .map((sermon: any) => ({
      id: String(sermon.id),
      title: sermon.title || 'Untitled Sermon',
      topic: sermon.topic || 'General',
      author: sermon.author_name || 'Unknown',
      date: sermon.published_at || sermon.created_at || new Date().toISOString(),
      views: sermon.views || 0,
      students: 0,
      status: sermon.status === 'published' ? 'ongoing' : 
               sermon.status === 'draft' ? 'new' : 'completed'
    }));

  // If no user sermons, show fallback or empty state
  const displaySermons = recentSermons.length > 0 ? recentSermons : [];

  // ============================================
  // RECENT ACTIVITIES FROM USER'S DATA ONLY
  // ============================================

  const recentActivities = userSermons
    .slice(0, 5)
    .map((sermon: any) => ({
      id: sermon.id,
      title: sermon.title || 'Untitled Sermon',
      type: sermon.status === 'published' ? 'published' : 'created',
      timestamp: sermon.published_at || sermon.created_at || new Date().toISOString(),
      author: sermon.author_name || 'Unknown'
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
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">New</span>;
      case 'ongoing':
        return <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">Ongoing</span>;
      case 'completed':
        return <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">Completed</span>;
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

  const getProfilePicture = () => {
    if (user?.profile?.profile_picture) {
      return user.profile.profile_picture;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getRoleDisplayName = () => {
    const role = user?.role || 'student';
    const names: Record<string, string> = {
      admin: 'Administrator',
      evangelist: 'Evangelist',
      student: 'Student',
      super_admin: 'Super Admin',
      church_admin: 'Church Admin'
    };
    return names[role] || 'Member';
  };

  const userRole = user?.role || 'student';

  // ============================================
  // LOADING STATE
  // ============================================

  if (loadingSermons || loadingStudents || loadingExams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
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
            <div className="flex items-center">
              <span className="text-xl font-bold text-cyan-600">Digital Evangelism</span>
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
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
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

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUser className="mr-3 text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaCog className="mr-3 text-gray-400" />
                        Settings
                      </Link>
                      <Link
                        to="/sermons"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaBook className="mr-3 text-gray-400" />
                        My Sermons
                      </Link>
                      <Link
                        to="/certificates"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaCertificate className="mr-3 text-gray-400" />
                        My Certificates
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      disabled={authLoading}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <FaSignOutAlt className="mr-3 text-red-400" />
                      {authLoading ? 'Logging out...' : 'Logout'}
                    </button>
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
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold">
                  Welcome back, {user?.full_name || 'Believer'}! 
                </h1>
                <p className="mt-2 text-cyan-100">
                  {userRole === 'admin' && 'Manage the evangelism network effectively'}
                  {userRole === 'evangelist' && 'Continue spreading the Gospel through your group'}
                  {userRole === 'student' && 'Grow in faith through learning and exams'}
                  {!userRole && 'Join the Digital Evangelism community'}
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-cyan-100">
                  <span className="flex items-center">
                    <FaUser className="mr-1" /> {getRoleDisplayName()}
                  </span>
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-1" /> 
                    Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <span className="text-6xl opacity-20">✝</span>
              </div>
            </div>

            {/* Quick Stats for User */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-sm text-cyan-100">My Sermons</p>
                <p className="text-2xl font-bold">{stats.totalSermons}</p>
              </div>
              <div>
                <p className="text-sm text-cyan-100">My Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div>
                <p className="text-sm text-cyan-100">Pending Exams</p>
                <p className="text-2xl font-bold">{stats.pendingExams}</p>
              </div>
              <div>
                <p className="text-sm text-cyan-100">Certificates</p>
                <p className="text-2xl font-bold">{stats.certificatesIssued}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Sermons</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSermons}</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-full">
                  <FaBook className="text-cyan-600 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  {stats.totalSermons > 0 ? `${stats.totalSermons} sermons shared` : 'No sermons yet'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUserGraduate className="text-blue-600 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  {stats.totalStudents > 0 ? `${stats.totalStudents} students assigned` : 'No students yet'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingExams}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaClock className="text-yellow-600 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-yellow-600">
                  {stats.pendingExams > 0 ? 'Need grading' : 'All graded'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.certificatesIssued}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaCertificate className="text-purple-600 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-purple-600">
                  {stats.certificatesIssued > 0 ? `${stats.certificatesIssued} issued` : 'No certificates'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Sermons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FaBible className="mr-2 text-cyan-500" />
                My Recent Sermons
              </h2>
              <Link to="/sermons" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center">
                View All <FaArrowRight className="ml-1" />
              </Link>
            </div>
            
            {displaySermons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displaySermons.map((sermon) => (
                  <div key={sermon.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <FaBible className="text-cyan-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{sermon.title}</h4>
                          <p className="text-sm text-gray-600">Topic: {sermon.topic}</p>
                          <p className="text-xs text-gray-500 mt-1">By {sermon.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusBadge(sermon.status)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <FaEye className="inline mr-1 text-gray-400" />
                        {sermon.views} views
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
                        View Sermon
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No sermons yet</p>
                <Link to="#" className="inline-block mt-2 text-cyan-600 hover:text-cyan-700 font-medium">
                  waitfor comming sermons
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaBell className="mr-2 text-cyan-500" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <FaBible className="text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'published' ? 'Published' : 'Created'}: "{activity.title}"
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                    <button 
                      onClick={() => handleViewSermon(activity.id, activity.title)}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
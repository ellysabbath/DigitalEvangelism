// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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

const Dashboard: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [recentSermons] = useState<RecentSermon[]>([
    {
      id: '1',
      title: 'The Power of Faith',
      topic: 'Faith',
      author: 'Evangelist Peter',
      date: '2026-01-15',
      views: 456,
      students: 128,
      status: 'ongoing'
    },
    {
      id: '2',
      title: 'Walking in Love',
      topic: 'Love',
      author: 'Evangelist Mary',
      date: '2026-01-12',
      views: 389,
      students: 96,
      status: 'new'
    },
    {
      id: '3',
      title: 'Spiritual Growth',
      topic: 'Spiritual Growth',
      author: 'Evangelist John',
      date: '2026-01-10',
      views: 567,
      students: 156,
      status: 'completed'
    },
  ]);

  const stats = {
    totalSermons: 24,
    totalGroups: 8,
    totalStudents: 156,
    totalEvangelists: 12,
    pendingExams: 23,
    certificatesIssued: 45,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickActions = {
    admin: [
      { to: '/admin/create-sermon', label: 'Create Sermon', color: 'bg-cyan-500' },
      { to: '/admin/create-group', label: 'Create Group', color: 'bg-blue-500' },
      { to: '/admin/certificates', label: 'Generate Certificates', color: 'bg-purple-500' },
    ],
    evangelist: [
      { to: '/admin/students', label: 'View Students', color: 'bg-blue-500' },
      { to: '/evangelist/exams', label: 'Grade Exams', color: 'bg-green-500' },
      { to: '/ev/dashboard', label: 'Share Sermon', color: 'bg-orange-500' },
    ],
    student: [
      { to: '/sermons', label: 'Browse Sermons', color: 'bg-blue-500' },
      { to: '/student/exams', label: 'My Exams', color: 'bg-green-500' },
      { to: '/certificates', label: 'My Certificates', color: 'bg-purple-500' },
    ],
  };

  const userRole = user?.role || 'student';
  const actions = quickActions[userRole as keyof typeof quickActions] || quickActions.student;

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const handleJoinSermon = (sermonId: string, sermonTitle: string) => {
    if (!user) {
      toast.error('Please login or register to join this sermon');
      navigate('/login', { state: { from: `/join/sermon-${sermonId}?sermon=${encodeURIComponent(sermonTitle)}` } });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      toast.success(`You have joined "${sermonTitle}" successfully!`);
      setIsLoading(false);
      navigate(`/join/sermon-${sermonId}?sermon=${encodeURIComponent(sermonTitle)}`);
    }, 1000);
  };

  const handleViewSermon = (sermonId: string, sermonTitle: string) => {
    navigate(`/join/sermon-${sermonId}?sermon=${encodeURIComponent(sermonTitle)}`);
  };

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
      .map(name => name[0])
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

  return (
    <div className="min-h-screen bg-gray-50">
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
                      {user?.role || 'Student'}
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
                            {user?.role || 'Student'}
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
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <Link
                        to="/sermons"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Sermons
                      </Link>
                      <Link
                        to="/certificates"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Certificates
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      disabled={authLoading}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {authLoading ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-white-600 to-white-600 rounded-2xl p-8 text-dark">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold">
                  Welcome back, {user?.full_name || 'Believer'}! 
                </h1>
                <p className="mt-2 text-dark-100">
                  {userRole === 'admin' && 'Manage the evangelism network effectively'}
                  {userRole === 'evangelist' && 'Continue spreading the Gospel through your group'}
                  {userRole === 'student' && 'Grow in faith through learning and exams'}
                  {!userRole && 'Join the Digital Evangelism community'}
                </p>
              </div>
              <div className="hidden md:block">
                <span className="text-6xl opacity-20"></span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-sm text-dark/80">Total Sermons</p>
                <p className="text-2xl font-bold">{stats.totalSermons}</p>
              </div>
              <div>
                <p className="text-sm text-dark/80">Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div>
                <p className="text-sm text-dark/80">Evangelists</p>
                <p className="text-2xl font-bold">{stats.totalEvangelists}</p>
              </div>
              <div>
                <p className="text-sm text-dark/80">Certificates</p>
                <p className="text-2xl font-bold">{stats.certificatesIssued}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sermons</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSermons}</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-full">
                  <span className="text-cyan-600 text-xl"></span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-600">+12% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Groups</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-blue-600 text-xl"></span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-600">+3 new this month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-purple-600 text-xl"></span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-green-600">+45 new this month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingExams}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <span className="text-orange-600 text-xl"></span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-yellow-600">Need grading</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actions.map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500 hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 ${action.color} rounded-full text-white text-xl flex items-center justify-center w-12 h-12`}>
                    </div>
                    <span className="font-medium text-gray-900">{action.label}</span>
                    <span className="ml-auto text-gray-400"></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Sermons</h2>
              <Link to="/sermons" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSermons.map((sermon) => (
                <div key={sermon.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <span className="text-cyan-600"></span>
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
                      <span className="inline mr-1 text-cyan-500"></span>
                      {sermon.students} students
                    </span>
                    <span className="text-gray-500">
                      <span className="inline mr-1 text-cyan-500"></span>
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
                    <button
                      onClick={() => handleJoinSermon(sermon.id, sermon.title)}
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        'Join'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2 text-cyan-500"></span>
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                    <span className="text-cyan-600"></span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      New sermon published: "The Gospel of Grace"
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <span className="text-xs text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer">
                    View
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-cyan-100 rounded-full">
                  <span className="text-2xl text-cyan-600"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Join via QR Code</h3>
                  <p className="text-sm text-gray-600">Scan QR code to join a sermon</p>
                </div>
              </div>
              <Link 
                to={userRole === 'evangelist' ? '/ev/dashboard' : '/sermons'}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
              >
                <span className="mr-2"></span>
                Generate QR
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
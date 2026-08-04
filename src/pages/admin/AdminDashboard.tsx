// src/pages/admin/AdminDashboard.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaLemon, FaGraduationCap, FaAward, 
  FaPlus, FaEye, FaEdit, FaTrash, FaSearch,
  FaUserPlus, FaFileAlt, FaChartBar, FaCog,
  FaHome, FaUserFriends, FaBook, FaClipboardList,
  FaCertificate, FaBell, FaEnvelope, FaUserCircle,
  FaArrowRight, FaCheckCircle, FaClock,
  FaExclamationTriangle, FaStar, FaFire, FaCalendarAlt,
  FaChurch, FaUserTie, FaUserGraduate
} from 'react-icons/fa';
import toast from 'react-hot-toast';

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
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'evangelists' | 'students' | 'sermons'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stats = {
    totalEvangelists: 45,
    totalStudents: 234,
    totalGroups: 12,
    totalSermons: 67,
    pendingExams: 23,
    certificatesIssued: 156,
    activeUsers: 189,
    totalViews: 12456,
  };

  const groups: Group[] = [
    { id: '1', name: 'Gospel Team Africa', type: 'evangelist', memberCount: 15, createdAt: '2026-01-10', status: 'active' },
    { id: '2', name: 'Youth Discipleship', type: 'student', memberCount: 45, createdAt: '2026-01-12', status: 'active' },
    { id: '3', name: 'Women of Faith', type: 'student', memberCount: 38, createdAt: '2026-01-15', status: 'active' },
    { id: '4', name: 'Online Evangelists', type: 'evangelist', memberCount: 22, createdAt: '2026-01-18', status: 'inactive' },
  ];

  const recentActivities: RecentActivity[] = [
    { id: '1', type: 'sermon', title: 'New sermon published: "The Power of Prayer"', timestamp: '2 hours ago', status: 'completed' },
    { id: '2', type: 'group', title: 'New evangelist group created: "Campus Ministry"', timestamp: '5 hours ago', status: 'active' },
    { id: '3', type: 'student', title: 'Student John Doe completed 5 exams', timestamp: '1 day ago', status: 'completed' },
    { id: '4', type: 'exam', title: '23 exams pending grading', timestamp: '2 days ago', status: 'pending' },
    { id: '5', type: 'certificate', title: '15 certificates issued to students', timestamp: '3 days ago', status: 'completed' },
  ];

  const quickActions = [
    { icon: <FaUserPlus />, label: 'Add Evangelist', color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin/evangelists' },
    { icon: <FaPlus />, label: 'Create Sermon', color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin/create-sermon' },
    { icon: <FaUsers />, label: 'Create Group', color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin/create-group' },
    { icon: <FaFileAlt />, label: 'View Reports', color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin' },
    { icon: <FaCertificate />, label: 'Certificates', color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin/issue-certificate' },
    { icon: <FaBell />, label: 'Notifications', color: 'text-cyan-600', bg: 'bg-cyan-50', path: '/admin' },
  ];

  const getActivityIcon = (type: string) => {
    const icons = {
      sermon: <FaLemon className="text-cyan-500" />,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Manage the entire evangelism network
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/admin/create-group" 
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaUserPlus />
            <span>Create Group</span>
          </Link>
          <Link 
            to="/admin/create-sermon" 
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>New Sermon</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid - White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Evangelists</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvangelists}</p>
              <p className="text-xs text-green-600 mt-1"> 12% this month</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaUsers className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              <p className="text-xs text-green-600 mt-1">↑ 18% this month</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaGraduationCap className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sermons</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSermons}</p>
              <p className="text-xs text-green-600 mt-1">↑ 8% this month</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaLemon className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates</p>
              <p className="text-3xl font-bold text-gray-900">{stats.certificatesIssued}</p>
              <p className="text-xs text-green-600 mt-1"> 25% this month</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaAward className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaFire className="text-cyan-500 mr-2" />
          Quick Actions
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

      {/* Tabs - Cyan Color */}
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                  Recent Activities
                </h3>
                <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">View All</button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-4 border-cyan-200">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'sermon' ? 'bg-cyan-50' :
                        activity.type === 'group' ? 'bg-cyan-50' :
                        activity.type === 'student' ? 'bg-cyan-50' :
                        activity.type === 'exam' ? 'bg-cyan-50' :
                        'bg-cyan-50'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartBar className="text-cyan-500 mr-2" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">Pending Exams</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.pendingExams}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-gray-600">Certificates Issued</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.certificatesIssued}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-cyan-600">📈 Growth Rate</span>
                  <span className="text-lg font-bold text-cyan-600">+15.8%</span>
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
                  placeholder="Search groups..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link to="/admin/create-group" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaPlus />
                <span>New Group</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                      <p className="text-sm text-gray-600">
                        {group.type === 'evangelist' ? 'Evangelist Group' : 'Student Group'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      group.type === 'evangelist' ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-100 text-cyan-700'
                    }`}>
                      {group.memberCount} members
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Link to={`/admin/groups/edit/${group.id}`} className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50">
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
              ))}
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
                  placeholder="Search evangelists..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <Link to="/admin/evangelists" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaUserPlus />
                <span>Add Evangelist</span>
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaUserTie className="text-4xl text-cyan-400 mx-auto mb-3" />
              <p className="text-gray-500">Evangelist list will be displayed here</p>
              <Link to="/admin/evangelists" className="text-cyan-600 hover:text-cyan-700 font-medium inline-block mt-2">
                View all evangelists
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
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <Link to="/admin/students" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaPlus />
                <span>Add Student</span>
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaUserGraduate className="text-4xl text-cyan-400 mx-auto mb-3" />
              <p className="text-gray-500">Student list will be displayed here</p>
              <Link to="/admin/students" className="text-cyan-600 hover:text-cyan-700 font-medium inline-block mt-2">
                View all students
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
                  placeholder="Search sermons..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <Link to="/admin/create-sermon" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaPlus />
                <span>New Sermon</span>
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaLemon className="text-4xl text-cyan-400 mx-auto mb-3" />
              <p className="text-gray-500">Sermon list will be displayed here</p>
              <Link to="/admin/sermons" className="text-cyan-600 hover:text-cyan-700 font-medium inline-block mt-2">
                View all sermons
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
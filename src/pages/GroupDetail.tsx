// src/pages/GroupDetail.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaUsers, FaUserPlus, FaEnvelope,
  FaLemon, FaChartLine, FaGraduationCap, FaAward,
  FaSearch, FaEye, FaEdit, FaTrash, FaDownload,
  FaShare, FaQrcode, FaClock, FaCheckCircle,
  FaExclamationCircle, FaUserGraduate
} from 'react-icons/fa';
import { useAuth } from '../auth/context/AuthContext';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  status: 'active' | 'inactive';
  progress?: number;
  examsCompleted?: number;
}

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'sermons' | 'exams'>('overview');
  const [showAddMember, setShowAddMember] = useState(false);

  // Mock group data
  const group = {
    id: id || '1',
    name: 'Gospel Team Africa',
    type: 'evangelist' as const,
    description: 'A dedicated group of evangelists spreading the Gospel across Africa through digital and traditional means.',
    createdAt: '2026-01-10',
    createdBy: 'Pastor John Doe',
    memberCount: 15,
    totalSermons: 24,
    avgProgress: 78,
  };

  const members: Member[] = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah@email.com', role: 'Evangelist', joinedAt: '2026-01-10', status: 'active', progress: 85, examsCompleted: 8 },
    { id: '2', name: 'Michael Kim', email: 'michael@email.com', role: 'Evangelist', joinedAt: '2026-01-12', status: 'active', progress: 92, examsCompleted: 10 },
    { id: '3', name: 'Grace Mwangi', email: 'grace@email.com', role: 'Evangelist', joinedAt: '2026-01-15', status: 'active', progress: 65, examsCompleted: 5 },
    { id: '4', name: 'David Ochieng', email: 'david@email.com', role: 'Evangelist', joinedAt: '2026-01-18', status: 'inactive', progress: 30, examsCompleted: 2 },
  ];

  const sermons = [
    { id: '1', title: 'The Power of Faith', date: '2026-01-20', views: 156, likes: 45, hasExam: true },
    { id: '2', title: 'Walking in Love', date: '2026-01-18', views: 134, likes: 38, hasExam: true },
    { id: '3', title: 'Spiritual Growth', date: '2026-01-15', views: 98, likes: 29, hasExam: false },
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'inactive':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const canManageGroup = userRole === 'admin' || userRole === 'evangelist';

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <button
        onClick={() => navigate('/groups')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <FaArrowLeft />
        <span>Back to Groups</span>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaUsers className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold">{group.name}</h1>
                <p className="text-primary-100 mt-1">
                  {group.type === 'evangelist' ? 'Evangelist Group' : 'Student Group'} • {group.memberCount} members
                </p>
              </div>
            </div>
            <p className="mt-3 text-primary-100 max-w-2xl">{group.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-primary-100">
              <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>By: {group.createdBy}</span>
              <span>•</span>
              <span>{group.totalSermons} Sermons</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <FaShare />
              <span>Share</span>
            </button>
            <button className="bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <FaQrcode />
              <span>QR Code</span>
            </button>
            {canManageGroup && (
              <Link
                to={`/groups/${id}/edit`}
                className="bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FaEdit />
                <span>Edit Group</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{group.memberCount}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sermons</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{group.totalSermons}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <FaLemon className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{group.avgProgress}%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FaChartLine className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {['overview', 'members', 'sermons', 'exams'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <FaLemon className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">New sermon shared: "The Gospel of Grace"</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago by Pastor John Doe</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                className="input-field pl-10"
              />
            </div>
            {canManageGroup && (
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="btn-primary flex items-center space-x-2"
              >
                <FaUserPlus />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {showAddMember && (
            <div className="card border-2 border-primary-200 dark:border-primary-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Add Member to Group</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter email address..."
                  className="input-field flex-1"
                />
                <button className="btn-primary">Add</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Type the email of the person you want to add to this group
              </p>
            </div>
          )}

          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exams</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{member.role}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 rounded-full h-2 transition-all"
                            style={{ width: `${member.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{member.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{member.examsCompleted}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(member.status)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-primary-600 transition-colors">
                          <FaEye />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <FaEnvelope />
                        </button>
                        {canManageGroup && (
                          <button className="text-gray-400 hover:text-red-600 transition-colors">
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                className="input-field pl-10"
              />
            </div>
            {canManageGroup && (
              <Link
                to={`/sermons/create`}
                className="btn-primary flex items-center space-x-2"
              >
                <FaLemon />
                <span>Share Sermon</span>
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {sermons.map((sermon) => (
              <div key={sermon.id} className="card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/sermons/${sermon.id}`}>
                      <h4 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {sermon.title}
                      </h4>
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(sermon.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sermon.hasExam 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400'
                    }`}>
                      {sermon.hasExam ? 'Has Exam' : 'No Exam'}
                    </span>
                    <Link
                      to={`/sermons/${sermon.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{sermon.views} views</span>
                  <span>{sermon.likes} likes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search exams..."
                className="input-field pl-10"
              />
            </div>
            <select className="input-field max-w-xs">
              <option value="all">All Exams</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sermon</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">Sarah Johnson</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">The Power of Faith</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">85%</td>
                    <td className="py-3 px-4 text-sm text-green-600">B</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Completed</span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-sm text-primary-600 hover:text-primary-700">View</button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">Michael Kim</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Walking in Love</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">92%</td>
                    <td className="py-3 px-4 text-sm text-green-600">A</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Completed</span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-sm text-primary-600 hover:text-primary-700">View</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">Grace Mwangi</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Spiritual Growth</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">-</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">-</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-sm text-primary-600 hover:text-primary-700">Grade</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
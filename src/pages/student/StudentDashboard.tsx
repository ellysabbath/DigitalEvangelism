// src/pages/student/StudentDashboard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLemon, FaGraduationCap, FaAward, 
  FaClock, FaCheckCircle, FaExclamationCircle,
  FaSearch, FaPlay, FaBookOpen, FaShare,
  FaChartLine, FaFileAlt
} from 'react-icons/fa';

interface Exam {
  id: string;
  title: string;
  sermonTitle: string;
  date: string;
  score?: number;
  grade?: string;
  status: 'pending' | 'completed' | 'in-progress';
  feedback?: string;
}

interface Certificate {
  id: string;
  title: string;
  issuedDate: string;
  certificateNumber: string;
  status: 'issued' | 'pending';
}

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'certificates' | 'sermons'>('overview');

  const stats = {
    totalExams: 12,
    completedExams: 8,
    pendingExams: 2,
    averageScore: 82,
    certificatesEarned: 5,
    progress: 75,
  };

  const recentExams: Exam[] = [
    { id: '1', title: 'The Power of Faith Exam', sermonTitle: 'The Power of Faith', date: '2026-01-20', score: 85, grade: 'B', status: 'completed', feedback: 'Good understanding of faith concepts' },
    { id: '2', title: 'Walking in Love Exam', sermonTitle: 'Walking in Love', date: '2026-01-18', score: 92, grade: 'A', status: 'completed' },
    { id: '3', title: 'Spiritual Growth Exam', sermonTitle: 'Spiritual Growth', date: '2026-01-15', status: 'pending' },
  ];

  const certificates: Certificate[] = [
    { id: '1', title: 'The Power of Faith', issuedDate: '2026-01-20', certificateNumber: 'DES-2026-001', status: 'issued' },
    { id: '2', title: 'Walking in Love', issuedDate: '2026-01-18', certificateNumber: 'DES-2026-002', status: 'issued' },
    { id: '3', title: 'Spiritual Growth', issuedDate: '2026-01-15', certificateNumber: 'DES-2026-003', status: 'pending' },
  ];

  const availableSermons = [
    { id: '1', title: 'The Power of Faith', author: 'Pastor John Doe', progress: 100 },
    { id: '2', title: 'Walking in Love', author: 'Pastor Mary Smith', progress: 100 },
    { id: '3', title: 'Spiritual Growth', author: 'Pastor David Kim', progress: 65 },
    { id: '4', title: 'Grace and Mercy', author: 'Pastor Sarah Johnson', progress: 0 },
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'in-progress':
        return <FaPlay className="text-blue-500" />;
      default:
        return <FaExclamationCircle className="text-red-500" />;
    }
  };

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
            Student Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Track your learning progress and certifications
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/sermons" className="btn-primary flex items-center space-x-2">
            <FaBookOpen />
            <span>Browse Sermons</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exams Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedExams}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FaGraduationCap className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            of {stats.totalExams} total
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FaChartLine className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            +8% improvement
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.certificatesEarned}</p>
            </div>
            <div className="p-3 bg-gold-100 dark:bg-yellow-900/30 rounded-full">
              <FaAward className="text-yellow-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 text-sm text-yellow-600">
            Earned certificates
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.progress}%</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <FaBookOpen className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 rounded-full h-2 transition-all"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {['overview', 'exams', 'certificates', 'sermons'].map((tab) => (
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
          {/* Recent Exams */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Exams</h3>
              <Link to="/student/exams" className="text-sm text-primary-600 hover:text-primary-700">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <FaFileAlt className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{exam.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{exam.sermonTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {exam.status === 'completed' ? (
                      <div className="text-right">
                        <div className={`font-bold ${getGradeColor(exam.grade || '')}`}>
                          {exam.grade}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{exam.score}%</div>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                        Pending
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(exam.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Sermons */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Sermons</h3>
              <Link to="/sermons" className="text-sm text-primary-600 hover:text-primary-700">
                Browse All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableSermons.map((sermon) => (
                <div key={sermon.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-card transition-shadow">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sermon.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sermon.author}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {sermon.progress > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {sermon.progress}%
                      </div>
                    )}
                    <Link
                      to={`/sermons/${sermon.id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {sermon.progress === 100 ? 'Review' : sermon.progress > 0 ? 'Continue' : 'Start'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <div className="space-y-4">
            {recentExams.map((exam) => (
              <div key={exam.id} className="card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{exam.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exam.sermonTitle}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(exam.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {exam.status === 'completed' && (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getGradeColor(exam.grade || '')}`}>
                          {exam.grade}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{exam.score}%</div>
                      </div>
                    )}
                    {getStatusIcon(exam.status)}
                  </div>
                </div>
                {exam.feedback && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Feedback: </span>
                      {exam.feedback}
                    </p>
                  </div>
                )}
                <div className="mt-3 flex space-x-2">
                  <Link
                    to={`/student/exams/${exam.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {exam.status === 'pending' ? 'Take Exam' : 'View Details'}
                  </Link>
                  {exam.status === 'completed' && (
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <FaShare className="inline mr-1" /> Share
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search certificates..."
                className="input-field pl-10"
              />
            </div>
            <select className="input-field max-w-xs">
              <option value="all">All Certificates</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="card hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gold-100 dark:bg-yellow-900/30 rounded-full">
                    <FaAward className="text-yellow-600 text-2xl" />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    cert.status === 'issued' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {cert.status}
                  </span>
                </div>
                <h4 className="mt-3 font-semibold text-gray-900 dark:text-white">{cert.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Certificate #{cert.certificateNumber}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                </p>
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/certificates/${cert.id}`}
                    className="flex-1 text-center text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:text-primary-700 py-2 rounded-lg transition-colors"
                  >
                    View Certificate
                  </Link>
                  {cert.status === 'issued' && (
                    <button className="flex-1 text-center text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-gray-700 py-2 rounded-lg transition-colors">
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
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
            <select className="input-field max-w-xs">
              <option value="all">All Sermons</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSermons.map((sermon) => (
              <div key={sermon.id} className="card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{sermon.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{sermon.author}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {sermon.progress}%
                    </div>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-primary-600 rounded-full h-1.5 transition-all"
                        style={{ width: `${sermon.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/sermons/${sermon.id}`}
                    className="flex-1 text-center text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:text-primary-700 py-2 rounded-lg transition-colors"
                  >
                    {sermon.progress === 100 ? 'Review' : sermon.progress > 0 ? 'Continue' : 'Start'}
                  </Link>
                  <button className="flex-1 text-center text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-gray-700 py-2 rounded-lg transition-colors">
                    <FaShare className="inline mr-1" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
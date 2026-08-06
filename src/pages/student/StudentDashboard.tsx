// src/pages/student/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap, FaAward, 
  FaClock, FaCheckCircle, FaExclamationCircle,
  FaSearch,  FaBookOpen, FaShare,
  FaChartLine, FaFileAlt, FaSpinner, FaArrowLeft
} from 'react-icons/fa';
import { useAuth } from '../../auth/context/AuthContext';
import { useAdmin } from '../../auth/context/AdminContext';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface Exam {
  id: number;
  sermon_title: string;
  sermon: number;
  status: 'pending' | 'graded' | 'reviewed';
  percentage: number;
  total_score: number;
  max_possible_score: number;
  is_passed: boolean;
  submitted_at: string;
  time_taken: number;
}

interface Certificate {
  id: string;
  title: string;
  issuedDate: string;
  certificateNumber: string;
  status: 'issued' | 'pending';
}



interface StudentStats {
  totalExams: number;
  completedExams: number;
  pendingExams: number;
  averageScore: number;
  certificatesEarned: number;
  progress: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    examSubmissions, 
    
    sermons,
    loadingExams,
    loadingStudents,
    loadingSermons,
    refreshExamSubmissions,
    refreshAllStudents,
    refreshAllSermons,
    
  } = useAdmin();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'certificates' | 'sermons'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'in-progress'>('all');
  const [studentStats, setStudentStats] = useState<StudentStats>({
    totalExams: 0,
    completedExams: 0,
    pendingExams: 0,
    averageScore: 0,
    certificatesEarned: 0,
    progress: 0,
  });

  // ============================================
  // FETCH DATA
  // ============================================
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshExamSubmissions(),
          refreshAllStudents(),
          refreshAllSermons()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // ============================================
  // COMPUTE USER-SPECIFIC DATA
  // ============================================
  
  // Get user's exams
  const userExams = examSubmissions.filter(
    (exam: any) => exam.student === user?.id
  ) as Exam[];

  // Get user's sermons (sermons they have access to)
  const userSermons = sermons || [];

  // Get user's certificates (from exam submissions)
  const userCertificates: Certificate[] = userExams
    .filter((exam: any) => exam.status === 'graded' && exam.is_passed)
    .map((exam: any, index: number) => ({
      id: `cert-${exam.id}`,
      title: exam.sermon_title || 'Certificate',
      issuedDate: exam.submitted_at || new Date().toISOString(),
      certificateNumber: `DES-2026-${String(index + 1).padStart(3, '0')}`,
      status: 'issued' as const,
    }));

  // Compute stats
  useEffect(() => {
    const total = userExams.length;
    const completed = userExams.filter((e: any) => e.status === 'graded' || e.status === 'reviewed').length;
    const pending = userExams.filter((e: any) => e.status === 'pending').length;
    
    const gradedExams = userExams.filter((e: any) => e.status === 'graded' || e.status === 'reviewed');
    const avgScore = gradedExams.length > 0 
      ? gradedExams.reduce((acc: number, e: any) => acc + (e.percentage || 0), 0) / gradedExams.length 
      : 0;

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    setStudentStats({
      totalExams: total,
      completedExams: completed,
      pendingExams: pending,
      averageScore: avgScore,
      certificatesEarned: userCertificates.length,
      progress: progress,
    });
  }, [userExams]);

  // ============================================
  // FILTERED DATA
  // ============================================

  const filteredExams = userExams.filter((exam: any) => {
    const matchesSearch = exam.sermon_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exam.sermon_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'completed' && (exam.status === 'graded' || exam.status === 'reviewed')) ||
      (filterStatus === 'pending' && exam.status === 'pending');
    return matchesSearch && matchesStatus;
  });

  const filteredSermons = userSermons.filter((sermon: any) => {
    const matchesSearch = sermon.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sermon.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // ============================================
  // HELPERS
  // ============================================

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'graded':
      case 'reviewed':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaExclamationCircle className="text-red-500" />;
    }
  };

  const getStatusLabel = (exam: Exam) => {
    if (exam.status === 'pending') return 'Pending';
    if (exam.status === 'reviewed') return 'Reviewed';
    if (exam.status === 'graded') {
      return exam.is_passed ? 'Passed' : 'Failed';
    }
    return 'Unknown';
  };

  const getStatusBadgeClass = (exam: Exam) => {
    if (exam.status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (exam.status === 'reviewed') return 'bg-blue-100 text-blue-700';
    if (exam.status === 'graded') {
      return exam.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSermonProgress = (sermonId: number) => {
    const exam = userExams.find((e: any) => e.sermon === sermonId);
    if (!exam) return 0;
    if (exam.status === 'graded' || exam.status === 'reviewed') return 100;
    return 50;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // ============================================
  // RENDER LOADING
  // ============================================

  if (isLoading || loadingExams || loadingStudents || loadingSermons) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-cyan-100 rounded-lg transition-colors group"
            >
              <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
            </button>
            <div>
              <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="mt-1 text-gray-600">
                Track your learning progress and certifications
              </p>
              <p className="text-xs text-cyan-600 mt-0.5">
                {user?.full_name || 'Student'} · {userExams.length} exams attempted
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link to="/sermons" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
              <FaBookOpen />
              <span>Browse Sermons</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Exams Completed</p>
                <p className="text-2xl font-bold text-gray-900">{studentStats.completedExams}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaGraduationCap className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              of {studentStats.totalExams} total
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{studentStats.averageScore.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaChartLine className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{studentStats.certificatesEarned}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaAward className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{studentStats.progress}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaBookOpen className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 rounded-full h-2 transition-all"
                  style={{ width: `${studentStats.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2">
          <nav className="flex flex-wrap gap-2">
            {['overview', 'exams', 'certificates', 'sermons'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
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

        {/* ============================================
            OVERVIEW TAB
            ============================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Exams */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaFileAlt className="mr-2 text-cyan-500" />
                  Recent Exams
                </h3>
                <button
                  onClick={() => setActiveTab('exams')}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {userExams.slice(0, 3).map((exam: any) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FaFileAlt className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{exam.sermon_title}</p>
                        <p className="text-xs text-gray-500">Submitted: {formatDate(exam.submitted_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {exam.status !== 'pending' ? (
                        <div className="text-right">
                          <div className={`font-bold ${getGradeColor(exam.percentage || 0)}`}>
                            {exam.percentage?.toFixed(1) || 0}%
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(exam.status)}
                      </div>
                    </div>
                  </div>
                ))}
                {userExams.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No exams attempted yet</p>
                    <Link to="/sermons" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm mt-2 inline-block">
                      Browse Sermons →
                  </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Available Sermons */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaBookOpen className="mr-2 text-cyan-500" />
                  Available Sermons
                </h3>
                <button
                  onClick={() => setActiveTab('sermons')}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userSermons.slice(0, 4).map((sermon: any) => {
                  const progress = getSermonProgress(sermon.id);
                  return (
                    <div key={sermon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div>
                        <p className="font-medium text-gray-900">{sermon.title}</p>
                        <p className="text-xs text-gray-500">{sermon.author_name || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {progress > 0 && (
                          <div className="text-xs text-gray-500">
                            {progress}%
                          </div>
                        )}
                        <Link
                          to={`/sermons/${sermon.id}`}
                          className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          {progress === 100 ? 'Review' : progress > 0 ? 'Continue' : 'Start'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
                {userSermons.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <p>No sermons available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            EXAMS TAB
            ============================================ */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search exams..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">All Exams</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredExams.map((exam: any) => (
                <div key={exam.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{exam.sermon_title}</h4>
                      <p className="text-sm text-gray-600">Submitted: {formatDate(exam.submitted_at)}</p>
                      {exam.time_taken > 0 && (
                        <p className="text-xs text-gray-400">Time taken: {exam.time_taken} min</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {exam.status !== 'pending' ? (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getGradeColor(exam.percentage || 0)}`}>
                            {exam.percentage?.toFixed(1) || 0}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {exam.total_score || 0}/{exam.max_possible_score || 0}
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                          Pending
                        </span>
                      )}
                      {getStatusIcon(exam.status)}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(exam)}`}>
                      {getStatusLabel(exam)}
                    </span>
                    {exam.status === 'pending' && (
                      <span className="text-xs text-yellow-600">Awaiting grading</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredExams.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No exams found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            CERTIFICATES TAB
            ============================================ */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search certificates..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCertificates.map((cert) => (
                <div key={cert.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <FaAward className="text-yellow-600 text-2xl" />
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      {cert.status}
                    </span>
                  </div>
                  <h4 className="mt-3 font-semibold text-gray-900">{cert.title}</h4>
                  <p className="text-sm text-gray-600">
                    Certificate #{cert.certificateNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Issued: {formatDate(cert.issuedDate)}
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/certificates/${cert.id}`}
                      className="flex-1 text-center text-sm bg-cyan-50 text-cyan-600 hover:text-cyan-700 py-2 rounded-lg transition-colors"
                    >
                      View Certificate
                    </Link>
                    <button className="flex-1 text-center text-sm bg-gray-100 text-gray-600 hover:text-gray-700 py-2 rounded-lg transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              ))}
              {userCertificates.length === 0 && (
                <div className="col-span-3 bg-white rounded-xl shadow-md p-12 text-center">
                  <FaAward className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No certificates earned yet</p>
                  <p className="text-sm text-gray-400">Complete exams to earn certificates</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            SERMONS TAB
            ============================================ */}
        {activeTab === 'sermons' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search sermons..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSermons.map((sermon: any) => {
                const progress = getSermonProgress(sermon.id);
                return (
                  <div key={sermon.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{sermon.title}</h4>
                        <p className="text-sm text-gray-600">{sermon.author_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 mt-1">Topic: {sermon.topic}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {progress}%
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-cyan-600 rounded-full h-1.5 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Link
                        to={`/sermons/${sermon.id}`}
                        className="flex-1 text-center text-sm bg-cyan-50 text-cyan-600 hover:text-cyan-700 py-2 rounded-lg transition-colors"
                      >
                        {progress === 100 ? 'Review' : progress > 0 ? 'Continue' : 'Start'}
                      </Link>
                      <button className="flex-1 text-center text-sm bg-gray-100 text-gray-600 hover:text-gray-700 py-2 rounded-lg transition-colors">
                        <FaShare className="inline mr-1" /> Share
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredSermons.length === 0 && (
                <div className="col-span-2 bg-white rounded-xl shadow-md p-12 text-center">
                  <FaBookOpen className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No sermons available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
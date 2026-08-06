// src/pages/student/MyExams.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBook, FaCheckCircle, FaClock, 
  FaExclamationCircle, FaEye, FaSearch,
  FaStar, FaStarHalf, FaRegStar, FaCalendarAlt,
  FaArrowLeft, FaSpinner, FaTimes,
  FaQuestionCircle, FaShare
} from 'react-icons/fa';
import { useAuth } from '../../auth/context/AuthContext';
import { useAdmin } from '../../auth/context/AdminContext';
import toast from 'react-hot-toast';

// ===================== TYPES =====================

interface Question {
  id: string;
  text: string;
  type: 'short_answer' | 'long_answer' | 'checkbox' | 'radio' | 'true_false';
  options?: string[];
  correctAnswer?: string | string[];
  required: boolean;
  maxScore?: number;
}

interface StudentAnswer {
  questionId: string;
  answer: string | string[];
  score: number;
  maxScore: number;
  feedback: string;
  isCorrect?: boolean;
}

interface ExamAttempt {
  id: number;
  sermon: number;
  sermon_title: string;
  sermon_topic?: string;
  sermon_description?: string;
  student: number;
  student_name: string;
  student_email: string;
  answers: StudentAnswer[];
  total_score: number;
  max_possible_score: number;
  percentage: number;
  is_passed: boolean;
  status: 'pending' | 'graded' | 'reviewed';
  status_display: string;
  feedback: string;
  graded_by: number | null;
  graded_by_name: string | null;
  graded_at: string | null;
  time_taken: number;
  submitted_at: string;
  updated_at: string;
  questions: Question[];
}

interface ExamFilter {
  status: 'all' | 'pending' | 'graded' | 'reviewed' | 'passed' | 'failed';
  search: string;
  sortBy: 'date' | 'score' | 'title';
  sortOrder: 'asc' | 'desc';
}

// ===================== MAIN COMPONENT =====================

const MyExams: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { examSubmissions, loadingExams, examError, refreshExamSubmissions } = useAdmin();
  
  const [selectedExam, setSelectedExam] = useState<ExamAttempt | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState<ExamFilter>({
    status: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ========== FETCH EXAMS ==========
  useEffect(() => {
    if (user) {
      refreshExamSubmissions();
    }
  }, [user, refreshExamSubmissions]);

  // ========== FILTER USER'S EXAMS ==========
  const userExams = examSubmissions.filter(
    (exam: any) => exam.student === user?.id
  );

  // ========== FILTER AND SORT ==========
  const filteredExams = userExams.filter((exam: any) => {
    const matchesStatus = filter.status === 'all' || 
      (filter.status === 'passed' && exam.status === 'graded' && exam.is_passed) ||
      (filter.status === 'failed' && exam.status === 'graded' && !exam.is_passed) ||
      exam.status === filter.status;
    
    const matchesSearch = exam.sermon_title?.toLowerCase().includes(filter.search.toLowerCase()) ||
                          exam.sermon_topic?.toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const sortedExams = [...filteredExams].sort((a: any, b: any) => {
    let comparison = 0;
    switch(filter.sortBy) {
      case 'date':
        comparison = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
        break;
      case 'score':
        comparison = (a.percentage || 0) - (b.percentage || 0);
        break;
      case 'title':
        comparison = (a.sermon_title || '').localeCompare(b.sermon_title || '');
        break;
      default:
        comparison = 0;
    }
    return filter.sortOrder === 'asc' ? comparison : -comparison;
  });

  // ========== STATS ==========
  const stats = {
    total: userExams.length,
    pending: userExams.filter((e: any) => e.status === 'pending').length,
    graded: userExams.filter((e: any) => e.status === 'graded').length,
    reviewed: userExams.filter((e: any) => e.status === 'reviewed').length,
    passed: userExams.filter((e: any) => e.status === 'graded' && e.is_passed).length,
    failed: userExams.filter((e: any) => e.status === 'graded' && !e.is_passed).length,
    averageScore: userExams
      .filter((e: any) => e.status !== 'pending' && e.percentage > 0)
      .reduce((acc: number, e: any) => acc + (e.percentage || 0), 0) / 
      (userExams.filter((e: any) => e.status !== 'pending' && e.percentage > 0).length || 1),
  };

  // ========== HELPERS ==========
  
  const calculateMaxPossibleScore = (exam: ExamAttempt): number => {
    if (exam.max_possible_score && exam.max_possible_score > 0) {
      return exam.max_possible_score;
    }
    
    if (exam.questions && exam.questions.length > 0) {
      return exam.questions.reduce((sum: number, q: Question) => sum + (q.maxScore || 0), 0);
    }
    
    if (exam.answers && exam.answers.length > 0) {
      return exam.answers.reduce((sum: number, a: StudentAnswer) => sum + (a.maxScore || 0), 0);
    }
    
    return 0;
  };

  const calculateTotalScore = (exam: ExamAttempt): number => {
    if (exam.total_score !== undefined && exam.total_score > 0) {
      return exam.total_score;
    }
    
    if (exam.answers && exam.answers.length > 0) {
      return exam.answers.reduce((sum: number, a: StudentAnswer) => sum + (a.score || 0), 0);
    }
    
    return 0;
  };

  // ========== FIXED: PASS/FAIL LOGIC ==========
  const isExamPassed = (exam: ExamAttempt): boolean => {
    if (exam.status === 'pending') return false;
    if (exam.is_passed) return true;
    const percentage = exam.percentage || 0;
    if (percentage >= 30) return true;
    return false;
  };

  // ========== FIXED: getStatusLabel ==========
  const getStatusLabel = (exam: ExamAttempt): string => {
    if (exam.status === 'pending') return 'Pending';
    if (exam.status === 'reviewed') return 'Reviewed';
    if (exam.status === 'graded') {
      return isExamPassed(exam) ? 'Passed' : 'Failed';
    }
    return 'Unknown';
  };

  const getStatusBadge = (exam: ExamAttempt) => {
    if (exam.status === 'pending') {
      return 'bg-yellow-100 text-yellow-700';
    }
    
    if (exam.status === 'reviewed') {
      return 'bg-blue-100 text-blue-700';
    }
    
    if (exam.status === 'graded') {
      return isExamPassed(exam) 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700';
    }
    
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (exam: ExamAttempt) => {
    if (exam.status === 'pending') {
      return <FaClock className="text-yellow-500" />;
    }
    
    if (exam.status === 'reviewed') {
      return <FaStar className="text-blue-500" />;
    }
    
    if (exam.status === 'graded') {
      return isExamPassed(exam) 
        ? <FaCheckCircle className="text-green-500" />
        : <FaExclamationCircle className="text-red-500" />;
    }
    
    return <FaQuestionCircle className="text-gray-500" />;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-green-500';
    if (percentage >= 30) return 'text-blue-600';
    if (percentage >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Very Good';
    if (percentage >= 60) return 'Good';
    if (percentage >= 50) return 'Satisfactory';
    if (percentage >= 30) return 'Pass';
    return 'Needs Improvement';
  };

  const renderStars = (percentage: number) => {
    const stars = [];
    const fullStars = Math.floor(percentage / 20);
    const hasHalfStar = percentage % 20 >= 10;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  // ========== HANDLERS ==========
  const handleViewDetails = (exam: ExamAttempt) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
  };

  const handleRetakeExam = (sermonId: number) => {
    toast.success('Redirecting to exam...');
    navigate(`/sermons/${sermonId}`);
  };

  const handleShare = (exam: ExamAttempt) => {
    const url = `${window.location.origin}/sermons/${exam.sermon}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Sermon link copied to clipboard!');
    }).catch(() => {
      toast.success(`Share this sermon: ${url}`);
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshExamSubmissions();
      toast.success('Refreshed!');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ========== LOADING STATE ==========
  if (loadingExams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your exams...</p>
        </div>
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (examError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="text-4xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Exams</h2>
          <p className="text-gray-600 mb-6">{examError}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors inline-flex items-center"
          >
            <FaSpinner className={`animate-spin mr-2 ${!isRefreshing ? 'hidden' : ''}`} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
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
                My Exams
              </h1>
              <p className="text-sm text-gray-600">View all your attempted sermons and exams</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaSpinner className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-cyan-500">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Exams</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
            <p className="text-xs text-gray-500">Graded</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
            <p className="text-xs text-gray-500">Reviewed</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-xs text-gray-500">Failed</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
            <p className="text-2xl font-bold text-purple-600">{stats.averageScore.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Avg Score</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by sermon title or topic..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="graded">Graded</option>
                <option value="reviewed">Reviewed</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
              <select
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                value={filter.sortBy}
                onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="title">Sort by Title</option>
              </select>
              <button
                onClick={() => setFilter({ ...filter, sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
              >
                {filter.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>
        </div>

        {/* Exam Cards */}
        {sortedExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedExams.map((exam: any) => {
              const maxPossible = calculateMaxPossibleScore(exam);
              const totalScore = calculateTotalScore(exam);
              const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;
              const passed = isExamPassed(exam);
              
              return (
                <div key={exam.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group">
                  {/* Card Header */}
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <FaBook className="text-cyan-500 text-lg" />
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{exam.sermon_title}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Topic: {exam.sermon_topic || 'General'}</p>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(exam)}`}>
                        {getStatusIcon(exam)}
                        <span>{getStatusLabel(exam)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Score */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Score</p>
                        {exam.status !== 'pending' ? (
                          <p className={`text-xl font-bold ${getGradeColor(percentage)}`}>
                            {percentage.toFixed(1)}%
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-600 font-medium">Awaiting Grading</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Grade</p>
                        {exam.status !== 'pending' ? (
                          <p className="text-sm font-semibold text-gray-800">
                            {getGradeLabel(percentage)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </div>
                    </div>

                    {/* Stars Rating */}
                    {exam.status !== 'pending' && percentage > 0 && (
                      <div className="flex items-center space-x-1">
                        {renderStars(percentage)}
                        <span className="text-xs text-gray-500 ml-2">
                          ({totalScore}/{maxPossible})
                        </span>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(exam.submitted_at).toLocaleDateString()}
                      </span>
                      {exam.time_taken > 0 && (
                        <span>{exam.time_taken} min</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleViewDetails(exam)}
                        className="flex-1 flex items-center justify-center px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FaEye className="mr-1" />
                        View
                      </button>
                      {exam.status === 'graded' && !passed && (
                        <button
                          onClick={() => handleRetakeExam(exam.sermon)}
                          className="flex-1 flex items-center justify-center px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FaCheckCircle className="mr-1" />
                          Retake
                        </button>
                      )}
                      <button
                        onClick={() => handleShare(exam)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                        title="Share Sermon"
                      >
                        <FaShare />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBook className="text-4xl text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Found</h3>
            <p className="text-gray-500">
              {filter.search ? 'Try adjusting your search or filters' : 'You haven\'t attempted any exams yet'}
            </p>
            {!filter.search && (
              <Link to="/sermons" className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-medium">
                <FaBook className="mr-2" />
                Browse Sermons
              </Link>
            )}
          </div>
        )}

        {/* Exam Details Modal */}
        {showDetailsModal && selectedExam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                  <FaBook className="text-white text-xl" />
                  <div>
                    <h3 className="text-white font-bold text-lg">{selectedExam.sermon_title}</h3>
                    <p className="text-cyan-100 text-sm">Exam Results</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedExam)}`}>
                      {getStatusIcon(selectedExam)}
                      <span>{getStatusLabel(selectedExam)}</span>
                    </span>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Score</p>
                    {selectedExam.status !== 'pending' ? (
                      <p className={`text-xl font-bold ${getGradeColor(selectedExam.percentage || 0)}`}>
                        {(selectedExam.percentage || 0).toFixed(1)}%
                      </p>
                    ) : (
                      <p className="text-sm text-yellow-600">Pending</p>
                    )}
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="text-xl font-bold text-gray-900">{selectedExam.questions?.length || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-xl font-bold text-gray-900">{selectedExam.time_taken || 0} min</p>
                  </div>
                </div>

                {/* Pass/Fail Indicator */}
                {selectedExam.status === 'graded' && (
                  <div className={`p-4 rounded-lg border ${
                    isExamPassed(selectedExam)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {isExamPassed(selectedExam) ? (
                        <FaCheckCircle className="text-3xl text-green-500" />
                      ) : (
                        <FaExclamationCircle className="text-3xl text-red-500" />
                      )}
                      <div>
                        <h4 className={`text-lg font-bold ${
                          isExamPassed(selectedExam) ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {isExamPassed(selectedExam) ? 'Passed' : 'Failed'}
                        </h4>
                        <p className={`text-sm ${
                          isExamPassed(selectedExam) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isExamPassed(selectedExam) 
                            ? `Congratulations! You scored ${selectedExam.percentage?.toFixed(1)}% which is above the passing mark.`
                            : `You scored ${selectedExam.percentage?.toFixed(1)}%. The passing mark is 30%.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {selectedExam.feedback && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Feedback</h4>
                    <p className="text-sm text-gray-700">{selectedExam.feedback}</p>
                    {selectedExam.graded_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Graded by {selectedExam.graded_by_name || 'Unknown'} on {new Date(selectedExam.graded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Questions and Answers */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Questions & Answers</h4>
                  <div className="space-y-4">
                    {(selectedExam.questions || []).map((question: any, index: number) => {
                      const answer = (selectedExam.answers || []).find((a: any) => a.questionId === question.id);
                      
                      return (
                        <div key={question.id} className="p-4 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                                <span className="text-xs text-gray-400">({question.type?.replace('_', ' ') || 'short_answer'})</span>
                                {question.required && (
                                  <span className="text-xs text-red-500">*Required</span>
                                )}
                                {question.maxScore && question.maxScore > 0 && (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                    Max: {question.maxScore} pts
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900">{question.text}</p>
                              
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Your Answer:</p>
                                {Array.isArray(answer?.answer) ? (
                                  <ul className="list-disc list-inside text-sm text-gray-700">
                                    {(answer?.answer as string[]).map((item: string, i: number) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-700">{answer?.answer || 'No answer provided'}</p>
                                )}
                              </div>

                              {selectedExam.status !== 'pending' && (
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                                  <div>
                                    <span className="text-sm text-gray-600">Score: </span>
                                    <span className={`font-bold ${
                                      (answer?.score || 0) === (answer?.maxScore || 0) 
                                        ? 'text-green-600' 
                                        : (answer?.score || 0) > 0 
                                          ? 'text-yellow-600' 
                                          : 'text-red-600'
                                    }`}>
                                      {answer?.score || 0}/{answer?.maxScore || 0}
                                    </span>
                                  </div>
                                  {answer?.feedback && (
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Feedback:</span> {answer.feedback}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  {selectedExam.status === 'graded' && !isExamPassed(selectedExam) && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleRetakeExam(selectedExam.sermon);
                      }}
                      className="flex-1 flex items-center justify-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      <FaCheckCircle className="mr-2" />
                      Retake Exam
                    </button>
                  )}
                  <button
                    onClick={() => handleShare(selectedExam)}
                    className="flex-1 flex items-center justify-center px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <FaShare className="mr-2" />
                    Share Sermon
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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

export default MyExams;
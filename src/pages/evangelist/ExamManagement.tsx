// src/pages/evangelist/ExamManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaSearch, FaEye, FaEdit, 
  FaCheckCircle, FaClock, FaExclamationCircle,
  FaSpinner, FaDownload, FaPrint,
  FaSave, FaTimes, FaComment, FaChartBar,
  FaFileAlt, FaExclamationTriangle, FaStar
} from 'react-icons/fa';
import { useAdmin } from '../../auth/context/AdminContext';
import { useAuth } from '../../auth/context/AuthContext';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================
interface ExamFilter {
  status: 'all' | 'pending' | 'graded' | 'reviewed';
  search: string;
  sermonId: string;
}

interface EditingAnswer {
  score: number;
  feedback: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  required: boolean;
  maxScore?: number;
}

interface Answer {
  questionId: string;
  answer: string | string[];
  score: number;
  maxScore: number;
  feedback: string;
}

interface Submission {
  id: number;
  sermon: number;
  sermon_title: string;
  student: number;
  student_name: string;
  student_email: string;
  questions: Question[];
  answers: Answer[];
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
}

// ============================================
// MAIN COMPONENT
// ============================================
const ExamManagement: React.FC = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  const { 
    examSubmissions, 
    loadingExams, 
    examError,
    sermons,
    refreshExamSubmissions,
    gradeExamSubmission,
    getExamAnalytics
  } = useAdmin();
  
  // ============================================
  // STATE
  // ============================================
  const [filter, setFilter] = useState<ExamFilter>({
    status: 'all',
    search: '',
    sermonId: '',
  });
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAnswers, setEditingAnswers] = useState<Record<string, EditingAnswer>>({});
  const [analytics, setAnalytics] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    graded: 0,
    reviewed: 0,
    averageScore: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================
  // HELPER: Normalize IDs for comparison
  // ============================================
  const normalizeId = (id: any): string => String(id).trim();

  // ============================================
  // HELPER: Find answer by question ID (normalized)
  // ============================================
  const findAnswerForQuestion = useCallback((submission: Submission, questionId: string): Answer | undefined => {
    if (!submission.answers || submission.answers.length === 0) {
      return undefined;
    }
    
    const normalizedQuestionId = normalizeId(questionId);
    return submission.answers.find((a: Answer) => 
      normalizeId(a.questionId) === normalizedQuestionId
    );
  }, []);

  // ============================================
  // EFFECTS
  // ============================================
  
  // Load submissions on mount and filter changes
  useEffect(() => {
    refreshExamSubmissions(filter);
  }, [filter, refreshExamSubmissions]);

  // Update stats when submissions change
  useEffect(() => {
    const total = examSubmissions.length;
    const pending = examSubmissions.filter((s: any) => s.status === 'pending').length;
    const graded = examSubmissions.filter((s: any) => s.status === 'graded').length;
    const reviewed = examSubmissions.filter((s: any) => s.status === 'reviewed').length;
    
    const gradedSubmissions = examSubmissions.filter(
      (s: any) => s.status === 'graded' || s.status === 'reviewed'
    );
    
    const avgScore = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((acc: number, s: any) => acc + (s.percentage || 0), 0) / gradedSubmissions.length 
      : 0;
    
    setStats({
      total,
      pending,
      graded,
      reviewed,
      averageScore: avgScore,
    });
  }, [examSubmissions]);

  // ============================================
  // HELPERS
  // ============================================
  
  const calculateMaxPossibleScore = (submission: Submission): number => {
    if (submission.max_possible_score && submission.max_possible_score > 0) {
      return submission.max_possible_score;
    }
    
    if (submission.questions && submission.questions.length > 0) {
      return submission.questions.reduce((sum: number, q: Question) => sum + (q.maxScore || 0), 0);
    }
    
    if (submission.answers && submission.answers.length > 0) {
      return submission.answers.reduce((sum: number, a: Answer) => sum + (a.maxScore || 0), 0);
    }
    
    return 0;
  };

  const calculateTotalScore = (submission: Submission): number => {
    if (submission.total_score !== undefined && submission.total_score > 0) {
      return submission.total_score;
    }
    
    if (submission.answers && submission.answers.length > 0) {
      return submission.answers.reduce((sum: number, a: Answer) => sum + (a.score || 0), 0);
    }
    
    return 0;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      graded: 'bg-green-100 text-green-700',
      reviewed: 'bg-blue-100 text-blue-700',
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'graded': return <FaCheckCircle className="text-green-500" />;
      case 'reviewed': return <FaStar className="text-blue-500" />;
      default: return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      short_answer: 'Short Answer',
      long_answer: 'Long Answer',
      checkbox: 'Multiple Choice',
      radio: 'Single Choice',
      true_false: 'True / False',
    };
    return labels[type] || type;
  };

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshExamSubmissions(filter);
      toast.success('Refreshed!');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGradeExam = (submission: Submission) => {
    setSelectedSubmission(submission);
    const edits: Record<string, EditingAnswer> = {};
    
    if (submission.answers && submission.answers.length > 0) {
      submission.answers.forEach((a: Answer) => {
        edits[a.questionId] = { 
          score: a.score || 0, 
          feedback: a.feedback || '' 
        };
      });
    } else if (submission.questions && submission.questions.length > 0) {
      submission.questions.forEach((q: Question) => {
        edits[q.id] = { 
          score: 0, 
          feedback: '' 
        };
      });
    }
    
    setEditingAnswers(edits);
    setShowGradeModal(true);
  };

  const handleScoreChange = (questionId: string, score: number) => {
    setEditingAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], score }
    }));
  };

  const handleFeedbackChange = (questionId: string, feedback: string) => {
    setEditingAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], feedback }
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedSubmission) return;
    
    setIsSaving(true);
    try {
      const questions = selectedSubmission.questions || [];
      
      const updatedAnswers = questions.map((q: Question) => {
        const editData = editingAnswers[q.id] || { score: 0, feedback: '' };
        
        const existingAnswer = selectedSubmission.answers.find(
          (a: Answer) => normalizeId(a.questionId) === normalizeId(q.id)
        );
        
        return {
          questionId: q.id,
          answer: existingAnswer?.answer || '',
          score: editData.score || 0,
          maxScore: q.maxScore || existingAnswer?.maxScore || 0,
          feedback: editData.feedback || '',
        };
      });

      await gradeExamSubmission(selectedSubmission.id, {
        answers: updatedAnswers,
        feedback: selectedSubmission.feedback,
      });

      await refreshExamSubmissions(filter);
      setShowGradeModal(false);
      toast.success('Exam graded successfully!');
    } catch (error) {
      console.error('Error grading exam:', error);
      toast.error('Failed to grade exam');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const handleViewAnalytics = async (sermonId: number) => {
    try {
      const data = await getExamAnalytics(sermonId);
      setAnalytics(data);
      setShowAnalytics(true);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const handleDownloadReport = (submission: Submission) => {
    toast.success(`Downloading report for ${submission.student_name}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendFeedback = (submission: Submission) => {
    toast.success(`Feedback sent to ${submission.student_name}!`);
  };

  const handleFilterChange = (key: keyof ExamFilter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  // ============================================
  // RENDER HELPERS
  // ============================================
  
  const renderStatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
      <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
        <p className="text-2xl font-bold text-purple-600">{stats.averageScore.toFixed(1)}%</p>
        <p className="text-xs text-gray-500">Avg Score</p>
      </div>
    </div>
  );

  const renderSearchAndFilters = () => (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student name, email or sermon..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            value={filter.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
            value={filter.status}
            onChange={(e) => handleFilterChange('status', e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
            <option value="reviewed">Reviewed</option>
          </select>
          <select
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
            value={filter.sermonId}
            onChange={(e) => handleFilterChange('sermonId', e.target.value)}
          >
            <option value="">All Sermons</option>
            {sermons.map((s: any) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center"
          >
            <FaSpinner className={`${isRefreshing ? 'animate-spin' : ''} mr-2`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  // Filtered submissions - using any type to avoid type conflicts
  const filteredSubmissions = examSubmissions.filter((sub: any) => {
    const matchesStatus = filter.status === 'all' || sub.status === filter.status;
    const matchesSearch = 
      sub.student_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      sub.student_email?.toLowerCase().includes(filter.search.toLowerCase()) ||
      sub.sermon_title?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesSermon = filter.sermonId === '' || String(sub.sermon) === filter.sermonId;
    return matchesStatus && matchesSearch && matchesSermon;
  });

  const renderSubmissionsTable = () => {
    if (filteredSubmissions.length === 0) {
      return (
        <div className="text-center py-12">
          <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No exam submissions found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sermon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSubmissions.map((submission: any) => {
              const maxPossible = calculateMaxPossibleScore(submission);
              const totalScore = calculateTotalScore(submission);
              const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;
              
              return (
                <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold">
                        {submission.student_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{submission.student_name}</p>
                        <p className="text-xs text-gray-500">{submission.student_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{submission.sermon_title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </span>
                    <p className="text-xs text-gray-400">
                      {new Date(submission.submitted_at).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {submission.status === 'pending' ? (
                      <span className="text-sm text-gray-400">Not graded</span>
                    ) : (
                      <div>
                        <span className={`text-sm font-bold ${getGradeColor(percentage)}`}>
                          {totalScore}/{maxPossible}
                        </span>
                        <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      <span>{submission.status_display || submission.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewDetails(submission)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleViewAnalytics(submission.sermon)}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                        title="View Analytics"
                      >
                        <FaChartBar />
                      </button>
                      {submission.status === 'pending' && (
                        <button
                          onClick={() => handleGradeExam(submission)}
                          className="p-2 text-gray-500 hover:text-dark-600 transition-colors rounded-lg hover:bg-grey-50"
                          title="Grade Exam"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {submission.status === 'graded' && (
                        <>
                          <button
                            onClick={() => handleGradeExam(submission)}
                            className="p-2 text-gray-500 hover:text-yellow-600 transition-colors rounded-lg hover:bg-yellow-50"
                            title="Edit Grades"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleSendFeedback(submission)}
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                            title="Send Feedback"
                          >
                            <FaComment />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDownloadReport(submission)}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                        title="Download Report"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================
  // LOADING / ERROR STATES
  // ============================================
  
  if (loadingExams) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading exam submissions...</p>
        </div>
      </div>
    );
  }

  if (examError) {
    return (
      <div className="text-center py-12">
        <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{examError}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/ev/dashboard')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
            <p className="text-sm text-gray-600">View, grade and manage sermon exams</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaPrint />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Search and Filters */}
      {renderSearchAndFilters()}

      {/* Submissions List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {renderSubmissionsTable()}
      </div>

      {/* ============================================
          GRADING MODAL
          ============================================ */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-white-600 to-grey-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <FaEdit className="text-white text-xl" />
                <div>
                  <h3 className="text-dark font-bold text-lg">Grade Exam</h3>
                  <p className="text-dark-100 text-sm">
                    {selectedSubmission.student_name} - {selectedSubmission.sermon_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGradeModal(false)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-lg">
                    {selectedSubmission.student_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedSubmission.student_name}</p>
                    <p className="text-sm text-gray-500">{selectedSubmission.student_email}</p>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="text-sm text-gray-500">
                  <p>Submitted: {new Date(selectedSubmission.submitted_at).toLocaleDateString()}</p>
                  <p>Sermon: {selectedSubmission.sermon_title}</p>
                </div>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-4">
                {(selectedSubmission.questions || []).map((question: any, index: number) => {
                  // Find the answer using normalized ID matching
                  const answer = findAnswerForQuestion(selectedSubmission, question.id);
                  const studentAnswer = answer?.answer || 'No answer provided';
                  const maxScore = question.maxScore || answer?.maxScore || 0;
                  
                  // Get the editing data using the question ID
                  const editData = editingAnswers[question.id] || { score: 0, feedback: '' };
                  
                  return (
                    <div key={question.id} className="p-4 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                            <span className="text-xs text-gray-400">({getQuestionTypeLabel(question.type)})</span>
                            {question.required && (
                              <span className="text-xs text-red-500">*Required</span>
                            )}
                            {maxScore > 0 ? (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                Max: {maxScore} pts
                              </span>
                            ) : (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center">
                                <FaExclamationTriangle className="mr-1 text-xs" />
                                No max score
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{question.text}</p>
                          
                          {/* Student Answer */}
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Student's Answer:</p>
                            {Array.isArray(studentAnswer) ? (
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {(studentAnswer as string[]).map((item: string, i: number) => (
                                  <li key={i}>{item || '(empty)'}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-700">{studentAnswer || '(empty)'}</p>
                            )}
                          </div>

                          {/* Score Input */}
                          <div className="mt-3 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-600 font-medium">Score:</label>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={maxScore || 100}
                                value={editData.score}
                                onChange={(e) => handleScoreChange(question.id, parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                                placeholder="Enter score"
                              />
                              <span className="text-sm text-gray-400">/ {maxScore || '?'}</span>
                            </div>
                            {maxScore > 0 && (
                              <>
                                <button
                                  onClick={() => handleScoreChange(question.id, maxScore)}
                                  className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                                >
                                  Full Marks
                                </button>
                                <button
                                  onClick={() => handleScoreChange(question.id, 0)}
                                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                                >
                                  Zero
                                </button>
                                <button
                                  onClick={() => handleScoreChange(question.id, Math.round(maxScore / 2))}
                                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                                >
                                  Half
                                </button>
                              </>
                            )}
                          </div>

                          {/* Feedback Input */}
                          <div className="mt-3">
                            <label className="text-sm text-gray-600 font-medium">Feedback:</label>
                            <textarea
                              value={editData.feedback}
                              onChange={(e) => handleFeedbackChange(question.id, e.target.value)}
                              rows={2}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                              placeholder="Add feedback for this question..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Questions</p>
                    <p className="text-xl font-bold text-gray-900">{(selectedSubmission.questions || []).length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Score</p>
                    <p className="text-xl font-bold text-cyan-600">
                      {Object.values(editingAnswers).reduce((acc, curr) => acc + (curr.score || 0), 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Possible</p>
                    <p className="text-xl font-bold text-gray-900">
                      {(selectedSubmission.questions || []).reduce((sum: number, q: any) => sum + (q.maxScore || 0), 0) || 
                       selectedSubmission.max_possible_score || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Percentage</p>
                    <p className={`text-xl font-bold ${getGradeColor(
                      (Object.values(editingAnswers).reduce((acc, curr) => acc + (curr.score || 0), 0) / 
                      ((selectedSubmission.questions || []).reduce((sum: number, q: any) => sum + (q.maxScore || 0), 0) || 1)) * 100
                    )}`}>
                      {((Object.values(editingAnswers).reduce((acc, curr) => acc + (curr.score || 0), 0) / 
                        ((selectedSubmission.questions || []).reduce((sum: number, q: any) => sum + (q.maxScore || 0), 0) || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveGrades}
                  disabled={isSaving}
                  className={`flex-1 flex items-center justify-center px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all ${
                    isSaving ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Grades
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowGradeModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          DETAILS MODAL
          ============================================ */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-white-600 to-grey-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <FaEye className="text-white text-xl" />
                <div>
                  <h3 className="text-Dark font-bold text-lg">Exam Details</h3>
                  <p className="text-dark-100 text-sm">
                    {selectedSubmission.student_name} - {selectedSubmission.sermon_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {selectedSubmission.student_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedSubmission.student_name}</p>
                    <p className="text-sm text-gray-500">{selectedSubmission.student_email}</p>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="text-right">
                  {selectedSubmission.status !== 'pending' ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900">
                        Score: {selectedSubmission.total_score || 0}/{selectedSubmission.max_possible_score || 0}
                      </p>
                      <p className={`text-lg font-bold ${getGradeColor(selectedSubmission.percentage || 0)}`}>
                        {(selectedSubmission.percentage || 0).toFixed(1)}%
                      </p>
                      {selectedSubmission.is_passed && (
                        <span className="text-xs text-green-600 font-medium">✓ Passed</span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-yellow-600 font-medium">Pending Grading</span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted: {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-4">
                {(selectedSubmission.questions || []).map((question: any, index: number) => {
                  // Find the answer using normalized ID matching
                  const answer = findAnswerForQuestion(selectedSubmission, question.id);
                  const studentAnswer = answer?.answer || 'No answer provided';
                  const score = answer?.score || 0;
                  const maxScore = question.maxScore || answer?.maxScore || 0;
                  const feedback = answer?.feedback || '';
                  
                  return (
                    <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                            <span className="text-xs text-gray-400">({getQuestionTypeLabel(question.type)})</span>
                            {question.maxScore && question.maxScore > 0 && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                Max: {question.maxScore} pts
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{question.text}</p>
                          
                          {/* Student Answer */}
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Answer:</p>
                            {Array.isArray(studentAnswer) ? (
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {(studentAnswer as string[]).map((item: string, i: number) => (
                                  <li key={i}>{item || '(empty)'}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-700">{studentAnswer || '(empty)'}</p>
                            )}
                          </div>

                          {selectedSubmission.status !== 'pending' && (
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                              <div>
                                <span className="text-sm text-gray-600">Score: </span>
                                <span className={`font-bold ${getGradeColor((score / (maxScore || 1)) * 100)}`}>
                                  {score}/{maxScore || 0}
                                </span>
                              </div>
                              {feedback && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Feedback:</span> {feedback}
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

              {/* Overall Feedback */}
              {selectedSubmission.feedback && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-700 mb-1">Overall Feedback</h4>
                  <p className="text-sm text-gray-700">{selectedSubmission.feedback}</p>
                  {selectedSubmission.graded_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Graded by {selectedSubmission.graded_by_name || 'Unknown'} on {new Date(selectedSubmission.graded_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                {selectedSubmission.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleGradeExam(selectedSubmission);
                    }}
                    className="flex-1 flex items-center justify-center px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <FaEdit className="mr-2" />
                    Grade Exam
                  </button>
                )}
                <button
                  onClick={() => handleDownloadReport(selectedSubmission)}
                  className="flex-1 flex items-center justify-center px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <FaDownload className="mr-2" />
                  Download Report
                </button>
                <button
                  onClick={() => handleSendFeedback(selectedSubmission)}
                  className="flex-1 flex items-center justify-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <FaComment className="mr-2" />
                  Send Feedback
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

      {/* ============================================
          ANALYTICS MODAL
          ============================================ */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-white-600 to-grey-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <FaChartBar className="text-white text-xl" />
                <div>
                  <h3 className="text-dark font-bold text-lg">Exam Analytics</h3>
                  <p className="text-dark-100 text-sm">Performance overview</p>
                </div>
              </div>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {analytics.total_submissions === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFileAlt className="text-4xl text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h4>
                  <p className="text-sm text-gray-500">There are no graded submissions for this sermon yet.</p>
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{analytics.total_submissions}</p>
                      <p className="text-xs text-gray-500">Total Submissions</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className={`text-2xl font-bold ${getGradeColor(analytics.average_score)}`}>
                        {analytics.average_score?.toFixed(1) || 0}%
                      </p>
                      <p className="text-xs text-gray-500">Average Score</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className={`text-2xl font-bold ${analytics.passing_rate >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {analytics.passing_rate?.toFixed(1) || 0}%
                      </p>
                      <p className="text-xs text-gray-500">Passing Rate</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{analytics.top_performers?.length || 0}</p>
                      <p className="text-xs text-gray-500">Top Performers</p>
                    </div>
                  </div>

                  {/* Score Distribution */}
                  {analytics.score_distribution && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Score Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(analytics.score_distribution).map(([range, count]) => (
                          <div key={range} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-12">{range}</span>
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all"
                                style={{ width: `${(count as number) / (analytics.total_submissions || 1) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-8">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Question Stats */}
                  {analytics.question_stats && analytics.question_stats.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Question Difficulty Analysis</h4>
                      <div className="space-y-3">
                        {analytics.question_stats.map((q: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-500 w-8">Q{index + 1}</span>
                            <div className="flex-1">
                              <p className="text-xs text-gray-700 truncate">{q.text}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {q.difficulty}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Avg: {q.averageScore.toFixed(1)}/{q.maxScore}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Performers */}
                  {analytics.top_performers && analytics.top_performers.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Performers</h4>
                      <div className="space-y-2">
                        {analytics.top_performers.map((performer: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                                {performer.student_name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{performer.student_name}</p>
                                <p className="text-xs text-gray-500">{performer.student_email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${getGradeColor(performer.percentage)}`}>
                                {performer.percentage.toFixed(1)}%
                              </p>
                              <p className="text-xs text-gray-400">
                                {performer.total_score}/{performer.max_possible_score}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Close Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="w-full px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Close Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ExamManagement;
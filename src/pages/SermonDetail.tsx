// src/pages/SermonDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaHeart, FaComment, FaShare, FaBookmark, 
  FaQrcode, FaFacebook, FaTwitter, FaWhatsapp, 
  FaTelegram, FaCopy, FaArrowLeft, 
  FaCalendar, FaClock, FaCheckCircle, FaUserPlus,
  FaSpinner, FaUsers, FaBible, 
  FaChartLine, FaTimesCircle, FaQuestion,
  FaEdit, FaCheck, FaList, FaExclamationTriangle
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../auth/context/AuthContext';
import { useAdmin } from '../auth/context/AdminContext';
import { sermonsAPI, commentsAPI } from '../services/api';
import type { Comment } from '../types/data';
import toast from 'react-hot-toast';

interface SermonData {
  id: number;
  title: string;
  topic: string;
  content: string;
  scripture: string;
  author: number;
  author_name: string;
  questions: any[];
  questions_count: number;
  views: number;
  likes: number;
  shares: number;
  status: string;
  status_display: string;
  created_at: string;
  published_at: string | null;
  updated_at: string;
}

// interface ExamAnswer {
//   questionId: string;
//   answer: string | string[];
//   maxScore: number;
// }

const SermonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    refreshExamSubmissions,
    submitExam,
    checkSubmission
  } = useAdmin();
  
  // ========== STATE ==========
  const [sermon, setSermon] = useState<SermonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [comment, setComment] = useState('');
  const [showExam, setShowExam] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Exam state - using index as key
  const [examAnswers, setExamAnswers] = useState<Record<number, string | string[]>>({});
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);

  // ========== REFS TO PREVENT DUPLICATE REQUESTS ==========
  const hasFetchedSermon = useRef(false);
  const hasCheckedSubmission = useRef(false);
  const hasFetchedComments = useRef(false);

  // ========== FETCH SERMON ==========
  useEffect(() => {
    if (!id || hasFetchedSermon.current) return;
    hasFetchedSermon.current = true;

    const fetchSermon = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const sermonId = parseInt(id);
        const response = await sermonsAPI.get(sermonId);
        setSermon(response.data);
        setLikeCount(response.data.likes || 0);
        
        const liked = localStorage.getItem(`liked_${id}`);
        if (liked) setIsLiked(true);

        const bookmarkedItem = localStorage.getItem(`bookmarked_${id}`);
        if (bookmarkedItem) setBookmarked(true);

        const joined = localStorage.getItem(`joined_${id}`);
        if (joined) setHasJoined(true);
        
      } catch (err: any) {
        console.error('Error fetching sermon:', err);
        setError(err.response?.data?.error || 'Failed to load sermon');
        toast.error('Failed to load sermon');
      } finally {
        setLoading(false);
      }
    };

    fetchSermon();
  }, [id]);

  // ========== CHECK SUBMISSION ==========
  useEffect(() => {
    if (!id || !user || hasCheckedSubmission.current) return;
    hasCheckedSubmission.current = true;

    const checkExistingSubmission = async () => {
      try {
        const sermonId = parseInt(id);
        const submitted = await checkSubmission(sermonId, user.id);
        setHasExistingSubmission(submitted);
        setExamSubmitted(submitted);
      } catch (error) {
        console.error('Error checking submission:', error);
      }
    };

    checkExistingSubmission();
  }, [id, user, checkSubmission]);

  // ========== FETCH COMMENTS ==========
  useEffect(() => {
    if (!id || hasFetchedComments.current) return;
    hasFetchedComments.current = true;

    const fetchComments = async () => {
      if (!sermon) return;
      
      setLoadingComments(true);
      try {
        const response = await commentsAPI.list(sermon.id);
        setComments(response.data);
      } catch (error: any) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [id, sermon]);

  // ========== HANDLE LIKE ==========
  const handleLike = async () => {
    if (isLiking || !id) return;
    
    setIsLiking(true);
    try {
      const sermonId = parseInt(id);
      const newLikeState = !isLiked;
      
      setIsLiked(newLikeState);
      setLikeCount(prev => newLikeState ? prev + 1 : prev - 1);
      
      if (newLikeState) {
        localStorage.setItem(`liked_${id}`, 'true');
        toast.success('Liked this sermon!');
      } else {
        localStorage.removeItem(`liked_${id}`);
        toast('Unliked sermon', { icon: <FaHeart className="text-gray-400" /> });
      }
      
      const response = await sermonsAPI.get(sermonId);
      setLikeCount(response.data.likes || 0);
      
    } catch (error: any) {
      console.error('Error toggling like:', error);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  // ========== HANDLE COMMENT ==========
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!user) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }

    if (!sermon) return;

    setIsCommenting(true);
    
    try {
      const response = await commentsAPI.create(sermon.id, {
        content: comment.trim()
      });
      
      setComments(prev => [response.data, ...prev]);
      setComment('');
      toast.success('Comment posted successfully!');
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error(error.response?.data?.error || 'Failed to post comment');
    } finally {
      setIsCommenting(false);
    }
  };

  // ========== HANDLE COMMENT LIKE ==========
  const handleCommentLike = async (commentId: number) => {
    try {
      const response = await commentsAPI.like(commentId);
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: response.data.likes,
            is_liked: response.data.is_liked
          };
        }
        return comment;
      }));
      
      toast.success(response.data.is_liked ? 'Liked comment!' : 'Unliked comment');
    } catch (error: any) {
      console.error('Error toggling comment like:', error);
      toast.error('Failed to like comment');
    }
  };

  // ========== HANDLE BOOKMARK ==========
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (!bookmarked) {
      toast.success('Bookmarked this sermon!');
      localStorage.setItem(`bookmarked_${id}`, 'true');
    } else {
      toast('Removed bookmark', { icon: <FaBookmark className="text-gray-400" /> });
      localStorage.removeItem(`bookmarked_${id}`);
    }
  };

  // ========== HANDLE JOIN ==========
  const handleJoinSermon = () => {
    if (!user) {
      toast.error('Please login or register to join this sermon');
      navigate('/login', { state: { from: `/join/sermon-${sermon?.id}?sermon=${encodeURIComponent(sermon?.title || '')}` } });
      return;
    }

    setIsJoining(true);
    setTimeout(() => {
      setHasJoined(true);
      if (sermon) {
        localStorage.setItem(`joined_${sermon.id}`, 'true');
      }
      setIsJoining(false);
      toast.success(`You have joined "${sermon?.title}" successfully!`);
      navigate(`/join/sermon-${sermon?.id}?sermon=${encodeURIComponent(sermon?.title || '')}`);
    }, 1500);
  };

  // ========== HANDLE SHARE ==========
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this powerful sermon: ${sermon?.title || 'Sermon'}`;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      setShowShareOptions(false);
      return;
    }

    if (platform in shareUrls) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
      setShowShareOptions(false);
    }
  };

  // ========== HANDLE EXAM ANSWER CHANGE ==========
  const handleExamAnswerChange = (questionIndex: number, value: string | string[]) => {
    setExamAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  // ========== SUBMIT EXAM ==========
  const handleSubmitExam = async () => {
    if (!user) {
      toast.error('Please login to submit the exam');
      navigate('/login');
      return;
    }

    if (!sermon) return;
    
    const questions = sermon.questions || [];

    // Validate all required questions are answered
    const requiredQuestions = questions.filter((q: any) => q.required);
    const unansweredRequired = requiredQuestions.filter((q: any) => {
      const questionIndex = questions.indexOf(q);
      const answer = examAnswers[questionIndex];
      return !answer || (Array.isArray(answer) && answer.length === 0);
    });

    if (unansweredRequired.length > 0) {
      toast.error(`Please answer all required questions (${unansweredRequired.length} remaining)`);
      return;
    }

    setIsSubmittingExam(true);

    try {
      const timeTaken = examStartTime ? Math.floor((Date.now() - examStartTime) / 60000) : 0;

      // Format answers - ensure questionId is properly set
      const formattedAnswers = questions.map((q: any, index: number) => {
        const answer = examAnswers[index];
        
        let formattedAnswer = answer || '';
        if (q.type === 'checkbox' && !Array.isArray(formattedAnswer)) {
          formattedAnswer = [];
        }
        if (q.type !== 'checkbox' && typeof formattedAnswer !== 'string') {
          formattedAnswer = '';
        }
        
        // CRITICAL: Use question ID if available, otherwise generate one
        let questionId = q.id;
        if (!questionId) {
          questionId = `q_${Date.now()}_${index}`;
          q.id = questionId;
        }
        
        return {
          questionId: questionId,
          answer: formattedAnswer,
          maxScore: q.maxScore || 10
        };
      });

      console.log('📤 Submitting exam with answers:', formattedAnswers);

      // Submit to backend database
      const examData = {
        answers: formattedAnswers,
        timeTaken: timeTaken
      };

      await submitExam(sermon.id, examData);

      setExamSubmitted(true);
      setHasExistingSubmission(true);
      
      toast.success('Exam submitted successfully! The admin will review your answers.');
      setShowExam(false);
      
      await refreshExamSubmissions({});
      
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.error || 'Failed to submit exam');
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // ========== TOGGLE EXAM ==========
  const toggleExam = () => {
    if (!showExam && !examSubmitted && !hasExistingSubmission) {
      setExamStartTime(Date.now());
      const initialAnswers: Record<number, string | string[]> = {};
      const questions = sermon?.questions || [];
      questions.forEach((q: any, index: number) => {
        if (q.type === 'checkbox') {
          initialAnswers[index] = [];
        } else {
          initialAnswers[index] = '';
        }
      });
      setExamAnswers(initialAnswers);
    }
    setShowExam(!showExam);
  };

  // ========== HELPERS ==========
  const getQuestionTypeIcon = (type: string) => {
    switch(type) {
      case 'short_answer': return <FaEdit className="text-blue-500" />;
      case 'long_answer': return <FaEdit className="text-purple-500" />;
      case 'checkbox': return <FaCheckCircle className="text-green-500" />;
      case 'radio': return <FaList className="text-orange-500" />;
      case 'true_false': return <FaCheck className="text-red-500" />;
      default: return <FaQuestion className="text-gray-500" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      short_answer: 'Short Answer',
      long_answer: 'Long Answer',
      checkbox: 'Multiple Choice (Checkbox)',
      radio: 'Single Choice (Radio)',
      true_false: 'True / False',
    };
    return labels[type] || type;
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading sermon...</p>
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load sermon</p>
          <p className="text-sm text-gray-400 mt-1">{error || 'Sermon not found'}</p>
          <button
            onClick={() => navigate('/sermons')}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Sermons
          </button>
        </div>
      </div>
    );
  }

  const questions = sermon.questions || [];
  const statusBadge = {
    published: { label: 'Published', className: 'bg-green-100 text-green-700' },
    draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
    archived: { label: 'Archived', className: 'bg-gray-100 text-gray-700' },
  }[sermon.status] || { label: sermon.status, className: 'bg-gray-100 text-gray-700' };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-cyan-600 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sermon Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded">
                      {sermon.topic}
                    </span>
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-gray-900">
                    {sermon.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold text-sm">
                        {sermon.author_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sermon.author_name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <FaCalendar className="mr-1" />
                        {sermon.created_at ? new Date(sermon.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      {sermon.published_at && (
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          Published: {new Date(sermon.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-lg transition-colors ${
                      bookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={bookmarked ? 'Bookmarked' : 'Bookmark'}
                  >
                    <FaBookmark />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Scripture */}
              {sermon.scripture && (
                <div className="mb-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-sm font-semibold text-cyan-700">Key Scripture</p>
                  <div className="mt-2">
                    <p className="text-sm text-cyan-600 font-serif italic">
                      "{sermon.scripture}"
                    </p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {sermon.content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLiking ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaHeart className={isLiked ? 'fill-current' : ''} />
                  )}
                  <span>{likeCount}</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  <FaComment />
                  <span>{comments.length}</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <FaShare />
                    <span>Share</span>
                  </button>
                  {showShareOptions && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl p-2 z-50 min-w-[200px] border border-gray-200">
                      <button onClick={() => handleShare('facebook')} className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <FaFacebook className="text-blue-600" />
                        <span>Facebook</span>
                      </button>
                      <button onClick={() => handleShare('twitter')} className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <FaTwitter className="text-blue-400" />
                        <span>Twitter</span>
                      </button>
                      <button onClick={() => handleShare('whatsapp')} className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <FaWhatsapp className="text-green-500" />
                        <span>WhatsApp</span>
                      </button>
                      <button onClick={() => handleShare('telegram')} className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <FaTelegram className="text-blue-500" />
                        <span>Telegram</span>
                      </button>
                      <button onClick={() => handleShare('copy')} className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <FaCopy />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FaQrcode />
                  <span>QR Code</span>
                </button>
                {!hasJoined ? (
                  <button
                    onClick={handleJoinSermon}
                    disabled={isJoining}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isJoining ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        <span>Join Sermon</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <FaCheckCircle />
                    <span>Joined</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              {showQRCode && (
                <div className="mt-4 p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
                  <QRCodeSVG 
                    value={window.location.href}
                    size={180}
                    level="H"
                    includeMargin={true}
                    fgColor="#0e7490"
                  />
                  <p className="mt-3 text-sm text-gray-600">
                    Scan to read this sermon
                  </p>
                  <button className="mt-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                    Download QR Code
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Exam Section */}
          {questions && questions.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaBible className="mr-2 text-cyan-500" />
                    Sermon Exam
                  </h3>
                  <p className="text-sm text-gray-600">
                    {hasExistingSubmission ? 'You have already submitted this exam' : 'Test your understanding of this sermon'}
                  </p>
                </div>
                {!hasExistingSubmission ? (
                  <button
                    onClick={toggleExam}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    {showExam ? 'Hide Exam' : 'Take Exam'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowExam(!showExam)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    {showExam ? 'Hide Submission' : 'View Submission'}
                  </button>
                )}
              </div>

              {/* Exam Form */}
              {showExam && !examSubmitted && !hasExistingSubmission && (
                <div className="mt-4 space-y-6">
                  {questions.map((q: any, index: number) => {
                    const currentAnswer = examAnswers[index];
                    
                    return (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                          {getQuestionTypeIcon(q.type || 'short_answer')}
                          <span className="text-xs text-gray-400">({getQuestionTypeLabel(q.type || 'short_answer')})</span>
                          {q.required && (
                            <span className="text-xs text-red-500">*Required</span>
                          )}
                          {q.maxScore && (
                            <span className="text-xs text-gray-400">Max: {q.maxScore} pts</span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{q.text}</p>
                        
                        {/* Short Answer */}
                        {q.type === 'short_answer' && (
                          <input
                            type="text"
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Type your answer..."
                            value={currentAnswer as string || ''}
                            onChange={(e) => handleExamAnswerChange(index, e.target.value)}
                          />
                        )}
                        
                        {/* Long Answer */}
                        {q.type === 'long_answer' && (
                          <textarea
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            rows={3}
                            placeholder="Write your answer..."
                            value={currentAnswer as string || ''}
                            onChange={(e) => handleExamAnswerChange(index, e.target.value)}
                          />
                        )}
                        
                        {/* Checkbox or Radio */}
                        {(q.type === 'checkbox' || q.type === 'radio') && q.options && (
                          <div className="mt-2 space-y-2">
                            {q.options.map((option: string, optIndex: number) => {
                              const isChecked = q.type === 'checkbox' 
                                ? (currentAnswer as string[] || []).includes(option)
                                : currentAnswer === option;
                              
                              return (
                                <label key={optIndex} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                  <input 
                                    type={q.type === 'checkbox' ? 'checkbox' : 'radio'} 
                                    name={`question_${index}`}
                                    value={option}
                                    checked={isChecked}
                                    onChange={() => {
                                      if (q.type === 'checkbox') {
                                        const current = currentAnswer as string[] || [];
                                        if (isChecked) {
                                          handleExamAnswerChange(index, current.filter((v: string) => v !== option));
                                        } else {
                                          handleExamAnswerChange(index, [...current, option]);
                                        }
                                      } else {
                                        handleExamAnswerChange(index, option);
                                      }
                                    }}
                                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" 
                                  />
                                  <span className="text-sm text-gray-700">{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* True/False */}
                        {q.type === 'true_false' && (
                          <div className="mt-2 flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input 
                                type="radio" 
                                name={`true_false_${index}`}
                                value="true"
                                checked={currentAnswer === 'true'}
                                onChange={() => handleExamAnswerChange(index, 'true')}
                                className="text-cyan-600 focus:ring-cyan-500" 
                              />
                              <span className="text-sm text-gray-700">True</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input 
                                type="radio" 
                                name={`true_false_${index}`}
                                value="false"
                                checked={currentAnswer === 'false'}
                                onChange={() => handleExamAnswerChange(index, 'false')}
                                className="text-cyan-600 focus:ring-cyan-500" 
                              />
                              <span className="text-sm text-gray-700">False</span>
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <button 
                    onClick={handleSubmitExam}
                    disabled={isSubmittingExam}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmittingExam ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Exam'
                    )}
                  </button>
                </div>
              )}

              {/* Submitted Status */}
              {(examSubmitted || hasExistingSubmission) && (
                <div className="mt-4 p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-3xl text-green-500 mr-3" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Exam Submitted!</h4>
                      <p className="text-sm text-gray-600">
                        Your answers have been submitted for review. The admin will grade your exam soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaComment className="mr-2 text-cyan-500" />
              Comments ({comments.length})
            </h3>

            {loadingComments ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-cyan-500" />
              </div>
            ) : (
              <>
                {/* Comment Form */}
                {user ? (
                  <form onSubmit={handleSubmitComment} className="flex space-x-2 mb-6">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isCommenting}
                    />
                    <button 
                      type="submit" 
                      disabled={isCommenting || !comment.trim()}
                      className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isCommenting ? <FaSpinner className="animate-spin" /> : 'Post'}
                    </button>
                  </form>
                ) : (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
                    Please <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">login</Link> to comment
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold text-sm">
                        {comment.user_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{comment.user_name || 'Anonymous'}</p>
                          <span className="text-xs text-gray-500">
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <button 
                            onClick={() => handleCommentLike(comment.id)}
                            className={`text-xs transition-colors ${
                              comment.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-cyan-600'
                            }`}
                          >
                            <FaHeart className="inline mr-1" /> {comment.likes || 0}
                          </button>
                          <button className="text-xs text-gray-500 hover:text-cyan-600 transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">
              {sermon.author_name?.charAt(0) || 'A'}
            </div>
            <h4 className="mt-3 font-semibold text-gray-900">{sermon.author_name || 'Unknown'}</h4>
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <div>
                <p className="font-bold text-gray-900">{sermon.likes}</p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">{sermon.shares}</p>
                <p className="text-xs text-gray-500">Shares</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">{sermon.views}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FaChartLine className="mr-2 text-cyan-500" />
              Sermon Stats
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Views</span>
                <span className="font-medium text-gray-900">{sermon.views}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Likes</span>
                <span className="font-medium text-gray-900">{likeCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Shares</span>
                <span className="font-medium text-gray-900">{sermon.shares}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Questions</span>
                <span className="font-medium text-gray-900">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${statusBadge.className}`}>{statusBadge.label}</span>
              </div>
            </div>
          </div>

          {/* Join Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FaUsers className="mr-2 text-cyan-500" />
              Your Status
            </h4>
            {hasJoined ? (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <FaCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-700">You have joined this sermon</p>
                <p className="text-xs text-green-600 mt-1">You can access all materials</p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Not joined yet</p>
                <button
                  onClick={handleJoinSermon}
                  disabled={isJoining}
                  className="mt-2 w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isJoining ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" />
                      Join Now
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Exam Status */}
          {questions.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaBible className="mr-2 text-cyan-500" />
                Exam Status
              </h4>
              {hasExistingSubmission ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <FaCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700">Exam Submitted</p>
                  <p className="text-xs text-green-600 mt-1">Waiting for review</p>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                  <FaExclamationTriangle className="text-2xl text-yellow-500 mx-auto mb-2" />
                  <p className="font-medium text-yellow-700">Not Submitted</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {questions.length} question{questions.length > 1 ? 's' : ''} to answer
                  </p>
                  <button
                    onClick={toggleExam}
                    className="mt-2 w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Take Exam Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SermonDetail;
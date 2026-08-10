// src/pages/SermonDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaHeart, FaComment, FaShare, FaBookmark, 
  FaQrcode, FaFacebook, FaTwitter, FaWhatsapp, 
  FaTelegram, FaCopy, FaArrowLeft, 
  FaCalendar, FaClock, FaCheckCircle, FaUserPlus,
  FaSpinner, FaUsers, FaBible, 
  FaChartLine, FaTimesCircle, FaQuestion,
  FaEdit, FaCheck, FaList, FaExclamationTriangle,
  FaTimes, FaUser,  FaLock
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../auth/context/AuthContext';
import { useAdmin } from '../auth/context/AdminContext';
import { sermonsAPI, commentsAPI } from '../services/api';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

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

interface LocalComment {
  id: number;
  content: string;
  user: number;
  user_name: string;
  user_avatar?: string | null;
  sermon: number;
  likes: number;
  like_count: number;
  is_liked: boolean;
  reply_count: number;
  is_active: boolean;
  parent: number | null;
  created_at: string;
  updated_at: string;
  replies?: LocalComment[];
}

// ============================================================
// LOGIN REQUIRED MODAL
// ============================================================

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  action: string;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin, 
  onRegister, 
  action 
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-white-600 to-white-600 px-6 py-5 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaUser className="text-dark text-3xl" />
          </div>
          <h3 className="text-dark font-bold text-xl">{t('auth.loginRequired')}</h3>
          <p className="text-dark-100 text-sm mt-1">
            {t('auth.loginTo', { action: action })}
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <FaUser className="text-cyan-500" />
              <span className="text-sm text-gray-600">{t('auth.email')}</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <FaLock className="text-cyan-500" />
              <span className="text-sm text-gray-600">{t('auth.password')}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={onLogin}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold"
            >
              {t('auth.login')}
            </button>
            <button
              onClick={onRegister}
              className="w-full py-3 border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all font-semibold"
            >
              {t('auth.register')}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SHARE MODAL
// ============================================================

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermonTitle: string;
  sermonUrl: string;
  onShare: (platform: string) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  sermonTitle, 
  sermonUrl, 
  onShare 
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const shareOptions = [
    { id: 'facebook', label: 'Facebook', icon: <FaFacebook className="text-blue-600 text-xl" />, color: 'hover:bg-blue-50' },
    { id: 'twitter', label: 'Twitter', icon: <FaTwitter className="text-blue-400 text-xl" />, color: 'hover:bg-blue-50' },
    { id: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp className="text-green-500 text-xl" />, color: 'hover:bg-green-50' },
    { id: 'telegram', label: 'Telegram', icon: <FaTelegram className="text-blue-500 text-xl" />, color: 'hover:bg-blue-50' },
    { id: 'copy', label: 'Copy Link', icon: <FaCopy className="text-gray-500 text-xl" />, color: 'hover:bg-gray-50' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-white-600 to-white-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-dark font-bold text-lg">{t('sermons.shareSermon')}</h3>
            <p className="text-dark-100 text-sm truncate max-w-[200px]">{sermonTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-dark/80 hover:text-gray transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onShare(option.id);
                  if (option.id !== 'copy') {
                    onClose();
                  }
                }}
                className={`flex items-center justify-center space-x-3 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all ${option.color}`}
              >
                {option.icon}
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">{t('sermons.shareableLink')}</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={sermonUrl}
                readOnly
                className="flex-1 text-sm text-gray-700 bg-transparent border-none focus:outline-none truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sermonUrl);
                  toast.success(t('sermons.linkCopied'));
                }}
                className="px-3 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-lg text-sm font-medium transition-colors"
              >
                {t('common.copy')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// QR CODE MODAL
// ============================================================

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url, title }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success(t('sermons.qrDownloaded'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">{t('sermons.qrCode')}</h3>
            <p className="text-cyan-100 text-sm truncate max-w-[180px]">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-200">
            <QRCodeSVG
              id="qr-code-canvas"
              value={url}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#0e7490"
            />
          </div>
          <p className="mt-4 text-sm text-gray-600 text-center">{t('sermons.scanToRead')}</p>
          <div className="mt-4 flex space-x-3 w-full">
            <button
              onClick={handleDownloadQR}
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {t('sermons.downloadQR')}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const SermonDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    refreshExamSubmissions,
    submitExam,
    checkSubmission,
    likeComment
  } = useAdmin();
  
  // ========== STATE ==========
  const [sermon, setSermon] = useState<SermonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState<string>('');
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
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, string | string[]>>({});
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);

  // ========== REFS ==========
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
        setError(err.response?.data?.error || t('sermons.loadError'));
        toast.error(t('sermons.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchSermon();
  }, [id, t]);

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
        const mappedComments: LocalComment[] = response.data.map((c: any) => ({
          id: c.id,
          content: c.content,
          user: c.user || 0,
          user_name: c.user_name || 'Anonymous',
          user_avatar: c.user_avatar || null,
          sermon: c.sermon || sermon.id,
          likes: c.likes || 0,
          like_count: c.like_count || c.likes || 0,
          is_liked: c.is_liked || false,
          reply_count: c.reply_count || 0,
          is_active: c.is_active !== undefined ? c.is_active : true,
          parent: c.parent || null,
          created_at: c.created_at || new Date().toISOString(),
          updated_at: c.updated_at || new Date().toISOString(),
          replies: c.replies || []
        }));
        setComments(mappedComments);
      } catch (error: any) {
        console.error('Error fetching comments:', error);
        toast.error(t('sermons.commentLoadError'));
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [id, sermon, t]);

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
        toast.success(t('sermons.liked'));
      } else {
        localStorage.removeItem(`liked_${id}`);
        toast.success(t('sermons.unliked'));
      }
      
      const response = await sermonsAPI.get(sermonId);
      setLikeCount(response.data.likes || 0);
      
    } catch (error: any) {
      console.error('Error toggling like:', error);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      toast.error(t('sermons.likeError'));
    } finally {
      setIsLiking(false);
    }
  };

  // ========== HANDLE COMMENT ==========
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error(t('sermons.enterComment'));
      return;
    }

    if (!user) {
      setLoginAction(t('auth.comment'));
      setShowLoginModal(true);
      return;
    }

    if (!sermon) return;

    setIsCommenting(true);
    
    try {
      const response = await commentsAPI.create(sermon.id, {
        content: comment.trim()
      });
      
      const newComment: LocalComment = {
        id: response.data.id,
        content: response.data.content,
        user: response.data.user || user.id,
        user_name: response.data.user_name || user.full_name || 'Anonymous',
        user_avatar: response.data.user_avatar || null,
        sermon: sermon.id,
        likes: 0,
        like_count: 0,
        is_liked: false,
        reply_count: 0,
        is_active: true,
        parent: null,
        created_at: response.data.created_at || new Date().toISOString(),
        updated_at: response.data.updated_at || new Date().toISOString(),
        replies: []
      };
      
      setComments(prev => [newComment, ...prev]);
      setComment('');
      toast.success(t('sermons.commentPosted'));
      
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error(error.response?.data?.error || t('sermons.commentError'));
    } finally {
      setIsCommenting(false);
    }
  };

  // ========== HANDLE COMMENT LIKE ==========
// ========== HANDLE COMMENT LIKE ==========
const handleCommentLike = async (commentId: number) => {
  if (!user) {
    setLoginAction(t('auth.likeComment'));
    setShowLoginModal(true);
    return;
  }
  
  // Optimistic update - toggle the like locally first for better UX
  setComments(prev => prev.map(c => {
    if (c.id === commentId) {
      const newIsLiked = !c.is_liked;
      return {
        ...c,
        likes: newIsLiked ? (c.likes || 0) + 1 : (c.likes || 0) - 1,
        like_count: newIsLiked ? (c.like_count || 0) + 1 : (c.like_count || 0) - 1,
        is_liked: newIsLiked
      };
    }
    return c;
  }));
  
  try {
    // Call the API
    await likeComment(commentId);
    // No need to update state here since we already did it optimistically
    // The AdminContext will also update its own state
  } catch (error: any) {
    console.error('Error toggling comment like:', error);
    // Revert the optimistic update on error
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const revertIsLiked = !c.is_liked;
        return {
          ...c,
          likes: revertIsLiked ? (c.likes || 0) + 1 : (c.likes || 0) - 1,
          like_count: revertIsLiked ? (c.like_count || 0) + 1 : (c.like_count || 0) - 1,
          is_liked: revertIsLiked
        };
      }
      return c;
    }));
    toast.error(t('sermons.commentLikeError'));
  }
};

  // ========== HANDLE BOOKMARK ==========
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (!bookmarked) {
      toast.success(t('sermons.bookmarked'));
      localStorage.setItem(`bookmarked_${id}`, 'true');
    } else {
      toast.success(t('sermons.unbookmarked'));
      localStorage.removeItem(`bookmarked_${id}`);
    }
  };

  // ========== HANDLE JOIN ==========
  const handleJoinSermon = () => {
    if (!user) {
      setLoginAction(t('auth.joinSermon'));
      setShowLoginModal(true);
      return;
    }

    setIsJoining(true);
    setTimeout(() => {
      setHasJoined(true);
      if (sermon) {
        localStorage.setItem(`joined_${sermon.id}`, 'true');
      }
      setIsJoining(false);
      toast.success(t('sermons.joined', { title: sermon?.title }));
      navigate(`/join/sermon-${sermon?.id}?sermon=${encodeURIComponent(sermon?.title || '')}`);
    }, 1500);
  };

  // ========== HANDLE SHARE ==========
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = t('sermons.shareText', { title: sermon?.title || 'Sermon' });
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success(t('sermons.linkCopied'));
      setShowShareModal(false);
      return;
    }

    if (platform in shareUrls) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
      setShowShareModal(false);
    }
  };

  // ========== HANDLE EXAM ==========
  const handleTakeExam = () => {
    if (!user) {
      setLoginAction(t('auth.takeExam'));
      setShowLoginModal(true);
      return;
    }
    toggleExam();
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
      setLoginAction(t('auth.submitExam'));
      setShowLoginModal(true);
      return;
    }

    if (!sermon) return;
    
    const questions = sermon.questions || [];

    const requiredQuestions = questions.filter((q: any) => q.required);
    const unansweredRequired = requiredQuestions.filter((q: any) => {
      const questionIndex = questions.indexOf(q);
      const answer = examAnswers[questionIndex];
      return !answer || (Array.isArray(answer) && answer.length === 0);
    });

    if (unansweredRequired.length > 0) {
      toast.error(t('exam.requiredQuestions', { count: unansweredRequired.length }));
      return;
    }

    setIsSubmittingExam(true);

    try {
      const timeTaken = examStartTime ? Math.floor((Date.now() - examStartTime) / 60000) : 0;

      const formattedAnswers = questions.map((q: any, index: number) => {
        const answer = examAnswers[index];
        
        let formattedAnswer = answer || '';
        if (q.type === 'checkbox' && !Array.isArray(formattedAnswer)) {
          formattedAnswer = [];
        }
        if (q.type !== 'checkbox' && typeof formattedAnswer !== 'string') {
          formattedAnswer = '';
        }
        
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

      const examData = {
        answers: formattedAnswers,
        timeTaken: timeTaken
      };

      await submitExam(sermon.id, examData);

      setExamSubmitted(true);
      setHasExistingSubmission(true);
      
      toast.success(t('exam.submittedSuccess'));
      setShowExam(false);
      
      await refreshExamSubmissions({});
      
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.error || t('exam.submitError'));
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
      short_answer: t('exam.shortAnswer'),
      long_answer: t('exam.longAnswer'),
      checkbox: t('exam.multipleChoice'),
      radio: t('exam.singleChoice'),
      true_false: t('exam.trueFalse'),
    };
    return labels[type] || type;
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">{t('common.loading')}</p>
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
          <p className="text-gray-700 font-medium">{t('sermons.loadError')}</p>
          <p className="text-sm text-gray-400 mt-1">{error || t('sermons.notFound')}</p>
          <button
            onClick={() => navigate('/sermons')}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            {t('sermons.backToSermons')}
          </button>
        </div>
      </div>
    );
  }

  const questions = sermon.questions || [];
  const statusBadge = {
    published: { label: t('sermons.published'), className: 'bg-green-100 text-green-700' },
    draft: { label: t('sermons.draft'), className: 'bg-yellow-100 text-yellow-700' },
    archived: { label: t('sermons.archived'), className: 'bg-gray-100 text-gray-700' },
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
          <span>{t('common.back')}</span>
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
                        <p className="text-sm font-medium text-gray-900">{sermon.author_name || t('sermons.unknown')}</p>
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
                          {t('sermons.publishedOn')}: {new Date(sermon.published_at).toLocaleDateString()}
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
                    title={bookmarked ? t('sermons.bookmarked') : t('sermons.bookmark')}
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
                  <p className="text-sm font-semibold text-cyan-700">{t('sermons.keyScripture')}</p>
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
                
                <button 
                  onClick={() => {
                    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FaComment />
                  <span>{comments.length}</span>
                </button>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FaShare />
                  <span>{t('sermons.share')}</span>
                </button>
                
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FaQrcode />
                  <span>{t('sermons.qrCode')}</span>
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
                        <span>{t('sermons.joining')}</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        <span>{t('sermons.joinSermon')}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <FaCheckCircle />
                    <span>{t('sermons.joined')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exam Section */}
          {questions && questions.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaBible className="mr-2 text-cyan-500" />
                    {t('exam.title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {hasExistingSubmission ? t('exam.alreadySubmitted') : t('exam.testUnderstanding')}
                  </p>
                </div>
                {!hasExistingSubmission ? (
                  <button
                    onClick={handleTakeExam}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    {showExam ? t('exam.hideExam') : t('exam.takeExam')}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowExam(!showExam)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    {showExam ? t('exam.hideSubmission') : t('exam.viewSubmission')}
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
                            <span className="text-xs text-red-500">*{t('exam.required')}</span>
                          )}
                          {q.maxScore && (
                            <span className="text-xs text-gray-400">{t('exam.max')}: {q.maxScore} {t('exam.pts')}</span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{q.text}</p>
                        
                        {/* Short Answer */}
                        {q.type === 'short_answer' && (
                          <input
                            type="text"
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder={t('exam.typeAnswer')}
                            value={currentAnswer as string || ''}
                            onChange={(e) => handleExamAnswerChange(index, e.target.value)}
                          />
                        )}
                        
                        {/* Long Answer */}
                        {q.type === 'long_answer' && (
                          <textarea
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            rows={3}
                            placeholder={t('exam.writeAnswer')}
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
                              <span className="text-sm text-gray-700">{t('exam.true')}</span>
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
                              <span className="text-sm text-gray-700">{t('exam.false')}</span>
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
                        {t('exam.submitting')}
                      </>
                    ) : (
                      t('exam.submitExam')
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
                      <h4 className="text-lg font-semibold text-gray-900">{t('exam.submitted')}</h4>
                      <p className="text-sm text-gray-600">{t('exam.submittedMessage')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div id="comments-section" className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaComment className="mr-2 text-cyan-500" />
              {t('sermons.comments')} ({comments.length})
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
                      placeholder={t('sermons.commentPlaceholder')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isCommenting}
                    />
                    <button 
                      type="submit" 
                      disabled={isCommenting || !comment.trim()}
                      className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                    >
                      {isCommenting ? <FaSpinner className="animate-spin" /> : t('sermons.post')}
                    </button>
                  </form>
                ) : (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
                    {t('sermons.loginToComment')} <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">{t('auth.login')}</Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold text-sm flex-shrink-0">
                          {comment.user_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{comment.user_name || t('sermons.anonymous')}</p>
                            <span className="text-xs text-gray-500">
                              {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 break-words">{comment.content}</p>
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
                              {t('sermons.reply')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaComment className="text-4xl text-gray-300 mx-auto mb-2" />
                      <p>{t('sermons.noComments')}</p>
                    </div>
                  )}
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
            <h4 className="mt-3 font-semibold text-gray-900">{sermon.author_name || t('sermons.unknown')}</h4>
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <div>
                <p className="font-bold text-gray-900">{sermon.likes}</p>
                <p className="text-xs text-gray-500">{t('sermons.likes')}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">{sermon.shares}</p>
                <p className="text-xs text-gray-500">{t('sermons.shares')}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">{sermon.views}</p>
                <p className="text-xs text-gray-500">{t('sermons.views')}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FaChartLine className="mr-2 text-cyan-500" />
              {t('sermons.stats')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('sermons.views')}</span>
                <span className="font-medium text-gray-900">{sermon.views}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('sermons.likes')}</span>
                <span className="font-medium text-gray-900">{likeCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('sermons.shares')}</span>
                <span className="font-medium text-gray-900">{sermon.shares}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('sermons.questions')}</span>
                <span className="font-medium text-gray-900">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">{t('sermons.status')}</span>
                <span className={`font-medium ${statusBadge.className}`}>{statusBadge.label}</span>
              </div>
            </div>
          </div>

          {/* Join Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FaUsers className="mr-2 text-cyan-500" />
              {t('sermons.yourStatus')}
            </h4>
            {hasJoined ? (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <FaCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-700">{t('sermons.hasJoined')}</p>
                <p className="text-xs text-green-600 mt-1">{t('sermons.accessMaterials')}</p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">{t('sermons.notJoined')}</p>
                <button
                  onClick={handleJoinSermon}
                  disabled={isJoining}
                  className="mt-2 w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isJoining ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {t('sermons.joining')}
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" />
                      {t('sermons.joinNow')}
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
                {t('exam.status')}
              </h4>
              {hasExistingSubmission ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <FaCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700">{t('exam.submitted')}</p>
                  <p className="text-xs text-green-600 mt-1">{t('exam.waitingReview')}</p>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                  <FaExclamationTriangle className="text-2xl text-yellow-500 mx-auto mb-2" />
                  <p className="font-medium text-yellow-700">{t('exam.notSubmitted')}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {questions.length} {t('exam.questionsToAnswer')}
                  </p>
                  <button
                    onClick={handleTakeExam}
                    className="mt-2 w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    {t('exam.takeExamNow')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate('/login', { state: { from: window.location.pathname } });
        }}
        onRegister={() => {
          setShowLoginModal(false);
          navigate('/join');
        }}
        action={loginAction}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        sermonTitle={sermon.title}
        sermonUrl={window.location.href}
        onShare={handleShare}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={window.location.href}
        title={sermon.title}
      />

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

export default SermonDetail;
// src/pages/evangelist/EvangelistDashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaLemon, FaGraduationCap, FaShare, 
  FaQrcode, FaPlus, FaSearch, FaEye, FaEdit,
  FaCheckCircle, FaClock, FaExclamationCircle,
  FaChartLine, FaUserPlus, FaDownload, FaPrint,
  FaWhatsapp, FaFacebook, FaTwitter, 
  FaTelegram, FaEnvelope, FaLink, FaCopy,
  FaTimes, FaSpinner, FaFileAlt, FaTrash,
  FaCalendarAlt, FaUserGraduate, FaClipboardList,
  FaBible, FaQuestion, FaTag, FaFire, FaCross,
  FaCheckSquare, FaList, FaEdit as FaEditIcon,
  FaHeart, FaComment, FaThumbsUp, FaArrowLeft,
  FaBook, FaUserTie, FaCertificate, FaInstagram,
  FaLinkedin, FaYoutube, FaTiktok, FaCheck
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { FaRadio } from 'react-icons/fa6';
import { useAuth } from '../../auth/context/AuthContext';
import { useAdmin } from '../../auth/context/AdminContext';
import { sermonsAPI, studentsAPI } from '../../services/api';

// ============================================
// TYPES
// ============================================

interface Student {
  id: number;
  user: number;
  full_name: string;
  email: string;
  phone: string;
  student_id: string;
  enrollment_date: string;
  graduation_date: string | null;
  is_graduated: boolean;
  exams_completed: number;
  certificates_earned: number;
  total_score: number;
  groups: number[];
  assigned_evangelist: number | null;
  status: 'active' | 'pending' | 'graduated' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
}

interface Sermon {
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
  status: 'draft' | 'published' | 'archived';
  status_display: string;
  created_at: string;
  published_at: string | null;
  updated_at: string;
}

// ============================================
// CONFIRMATION MODAL
// ============================================

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  icon
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch(type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonBg: 'bg-green-600 hover:bg-green-700',
        };
      default:
        return {
          iconBg: 'bg-cyan-100',
          iconColor: 'text-cyan-600',
          buttonBg: 'bg-cyan-600 hover:bg-cyan-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${styles.iconBg}`}>
                {icon || <FaExclamationCircle className={`text-2xl ${styles.iconColor}`} />}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// QR CODE MODAL
// ============================================

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: Sermon | null;
  qrValue: string;
  shareLink: string;
  onCopyLink: () => void;
  onShareToSocial: (platform: string) => void;
  onDownloadQR: () => void;
  onPrintQR: () => void;
  onShareQR: () => void;
  copied: boolean;
  qrRef: React.RefObject<HTMLDivElement>;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  sermon,
  qrValue,
  shareLink,
  onCopyLink,
  onShareToSocial,
  onDownloadQR,
  onPrintQR,
  onShareQR,
  copied,
  qrRef
}) => {
  if (!isOpen || !sermon) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <FaQrcode className="text-white text-2xl" />
            <div>
              <h3 className="text-white font-bold text-xl">QR Code & Share</h3>
              <p className="text-cyan-100 text-sm">Share "{sermon.title}" with students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sermon Info */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              sermon.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : sermon.status === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {sermon.status_display || sermon.status}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FaCalendarAlt className="mr-1" />
              {sermon.published_at ? new Date(sermon.published_at).toLocaleDateString() : 'Not published'}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FaEye className="mr-1" />
              {sermon.views || 0} views
            </span>
          </div>

          {/* QR Code and Share Options */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* QR Code */}
            <div ref={qrRef} className="flex-shrink-0 p-4 bg-white rounded-xl shadow-md border border-gray-200">
              <QRCodeSVG
                value={qrValue}
                size={220}
                level="H"
                includeMargin={true}
                fgColor="#0e7490"
              />
              <p className="text-center text-xs text-gray-500 mt-2">
                {sermon.title}
              </p>
            </div>

            {/* Share Options */}
            <div className="flex-1 space-y-4">
              {/* Social Media Share Buttons */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Share to Social Media:</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  <button
                    onClick={() => onShareToSocial('whatsapp')}
                    className="flex items-center justify-center px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                    title="Share on WhatsApp"
                  >
                    <FaWhatsapp className="text-lg" />
                  </button>
                  <button
                    onClick={() => onShareToSocial('facebook')}
                    className="flex items-center justify-center px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    title="Share on Facebook"
                  >
                    <FaFacebook className="text-lg" />
                  </button>
                  <button
                    onClick={() => onShareToSocial('twitter')}
                    className="flex items-center justify-center px-3 py-2.5 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
                    title="Share on Twitter/X"
                  >
                    <FaTwitter className="text-lg" />
                  </button>
                  <button
                    onClick={() => onShareToSocial('telegram')}
                    className="flex items-center justify-center px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                    title="Share on Telegram"
                  >
                    <FaTelegram className="text-lg" />
                  </button>
                  <button
                    onClick={() => onShareToSocial('linkedin')}
                    className="flex items-center justify-center px-3 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-sm"
                    title="Share on LinkedIn"
                  >
                    <FaLinkedin className="text-lg" />
                  </button>
                  <button
                    onClick={() => onShareToSocial('email')}
                    className="flex items-center justify-center px-3 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    title="Share via Email"
                  >
                    <FaEnvelope className="text-lg" />
                  </button>
                  <button
                    onClick={() => onShareToSocial('instagram')}
                    className="flex items-center justify-center px-3 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors text-sm"
                    title="Share on Instagram (Download QR)"
                  >
                    <FaInstagram className="text-lg" />
                  </button>
                  <button
                    onClick={() => onShareToSocial('tiktok')}
                    className="flex items-center justify-center px-3 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors text-sm"
                    title="Share on TikTok (Download QR)"
                  >
                    <FaTiktok className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Shareable Link */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Shareable Link:</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm text-gray-700 truncate flex-1">{shareLink}</code>
                  <button
                    onClick={onCopyLink}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center text-sm whitespace-nowrap"
                  >
                    {copied ? <FaCheck className="mr-1" /> : <FaCopy className="mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* QR Code Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onDownloadQR}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center text-sm"
                >
                  <FaDownload className="mr-2" /> Download QR
                </button>
                <button
                  onClick={onPrintQR}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center text-sm"
                >
                  <FaPrint className="mr-2" /> Print QR
                </button>
                <button
                  onClick={onShareQR}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center text-sm"
                >
                  <FaShare className="mr-2" /> Share QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// FULL SERMON VIEW MODAL
// ============================================

interface FullSermonViewModalProps {
  sermon: Sermon | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateQR: (sermonId: number) => void;
  onEdit: (sermonId: number) => void;
}

const FullSermonViewModal: React.FC<FullSermonViewModalProps> = ({
  sermon,
  isOpen,
  onClose,
  onGenerateQR,
  onEdit,
}) => {
  if (!isOpen || !sermon) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <FaLemon className="text-white text-2xl" />
            <div>
              <h3 className="text-white font-bold text-xl">{sermon.title}</h3>
              <p className="text-cyan-100 text-sm">Topic: {sermon.topic}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              sermon.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : sermon.status === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {sermon.status_display || sermon.status}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FaCalendarAlt className="mr-1" />
              {sermon.published_at ? new Date(sermon.published_at).toLocaleDateString() : 'Not published'}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FaEye className="mr-1" />
              {sermon.views || 0} views
            </span>
          </div>

          {sermon.scripture && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm font-semibold text-purple-700 flex items-center">
                <FaBible className="mr-2" /> Scripture
              </p>
              <p className="text-sm text-purple-600 font-serif italic">"{sermon.scripture}"</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaLemon className="mr-2 text-cyan-500" /> Sermon Content
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {sermon.content}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-lg font-bold text-blue-600">{sermon.views || 0}</p>
              <p className="text-xs text-gray-500">Views</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-lg font-bold text-red-600">{sermon.likes || 0}</p>
              <p className="text-xs text-gray-500">Likes</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-lg font-bold text-green-600">{sermon.shares || 0}</p>
              <p className="text-xs text-gray-500">Shares</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onClose();
                onGenerateQR(sermon.id);
              }}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
              <FaQrcode className="mr-2" /> Generate QR Code
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(sermon.id);
              }}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
              <FaEdit className="mr-2" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const EvangelistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    sermons, 
    loadingSermons,
    students,
    loadingStudents,
    examSubmissions,
    loadingExams,
    refreshAllSermons,
    refreshAllStudents,
    refreshExamSubmissions,
    deleteSermon,
    publishSermon,
    updateSermon,
    refreshEvangelists,
    evangelists
  } = useAdmin();
  
  // ========== STATE ==========
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'exams' | 'sermons'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewingSermon, setViewingSermon] = useState<Sermon | null>(null);
  const [showFullViewModal, setShowFullViewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // ========== QR CODE MODAL STATE ==========
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  
  // ========== MODAL STATES ==========
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'publish' | 'archive' | 'grade' | 'delete_student';
    id: number;
    title: string;
    message: string;
  } | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshAllSermons(),
          refreshAllStudents(),
          refreshExamSubmissions(),
          refreshEvangelists()
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
  // FILTERED DATA
  // ============================================

  const myStudents = students.filter((student: Student) => 
    student.assigned_evangelist === evangelists?.[0]?.id || 
    student.assigned_evangelist === user?.id
  );

  const filteredStudents = myStudents.filter((student: Student) =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingExams = examSubmissions.filter((exam: any) => 
    exam.status === 'pending'
  );

  const filteredExams = pendingExams.filter((exam: any) =>
    exam.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.sermon_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSermons = sermons.filter((sermon: Sermon) => {
    const matchesSearch = sermon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sermon.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sermon.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ============================================
  // STATS
  // ============================================

  const stats = {
    totalStudents: myStudents.length,
    activeStudents: myStudents.filter((s: Student) => s.status === 'active').length,
    pendingExams: pendingExams.length,
    totalSermons: sermons.filter((s: Sermon) => s.author === user?.id || s.author === evangelists?.[0]?.id).length,
    averageScore: examSubmissions
      .filter((e: any) => e.status === 'graded' && e.percentage > 0)
      .reduce((acc: number, e: any) => acc + (e.percentage || 0), 0) / 
      (examSubmissions.filter((e: any) => e.status === 'graded' && e.percentage > 0).length || 1),
    completionRate: myStudents.length > 0 
      ? Math.round(myStudents.reduce((acc: number, s: Student) => acc + (s.progress || 0), 0) / myStudents.length)
      : 0,
  };

  // ============================================
  // HELPERS
  // ============================================

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'graduated': return <FaGraduationCap className="text-blue-500" />;
      case 'completed': return <FaCertificate className="text-purple-500" />;
      default: return <FaExclamationCircle className="text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-gray-100 text-gray-700',
      graduated: 'bg-blue-100 text-blue-700',
      completed: 'bg-purple-100 text-purple-700',
    };
    return styles[status] || styles.pending;
  };

  // ============================================
  // QR CODE & SHARING FUNCTIONS
  // ============================================

  // Open QR Code Modal
  const handleOpenQRModal = (sermonId: number) => {
    const sermon = sermons.find((s: Sermon) => s.id === sermonId);
    if (!sermon) {
      toast.error('Sermon not found');
      return;
    }

    setIsGenerating(true);
    
    // Generate QR code value
    const baseUrl = window.location.origin;
    const uniqueId = `sermon-${sermon.id}-${Date.now()}`;
    const value = `${baseUrl}/join/${uniqueId}?sermon=${encodeURIComponent(sermon.title)}`;
    
    setQrCodeValue(value);
    setShareLink(value);
    setSelectedSermon(sermon);
    setShowQRModal(true);
    setIsGenerating(false);
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    if (!shareLink) {
      toast.error('No link to copy.');
      return;
    }
    
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      toast.error('Failed to copy link.');
    });
  };

  // Share to Social Media
  const handleShareToSocial = (platform: string) => {
    if (!shareLink) {
      toast.error('No link to share.');
      return;
    }

    const sermonTitle = selectedSermon?.title || 'Sermon';
    const text = `Join the sermon "${sermonTitle}" in the Digital Evangelism program!`;
    const encodedText = encodeURIComponent(text);
    const encodedLink = encodeURIComponent(shareLink);

    const shareUrls: Record<string, string | null> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedLink}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`,
      telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`,
      email: `mailto:?subject=Join%20Sermon%20-%20${encodeURIComponent(sermonTitle)}&body=${encodedText}%0A%0A${encodedLink}`,
      linkedin: `https://www.linkedin.com/sharing/share-offscreen/?url=${encodedLink}`,
      instagram: null,
      tiktok: null,
    };

    if (platform === 'instagram' || platform === 'tiktok') {
      toast.info(`Downloading QR code for ${platform.charAt(0).toUpperCase() + platform.slice(1)} sharing...`);
      downloadQRCode();
      setTimeout(() => {
        toast.success(`QR Code downloaded! You can now share it on ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`);
      }, 1000);
      return;
    }

    const url = shareUrls[platform];
    if (url) {
      window.open(url, '_blank', 'width=600,height=600');
      toast.success(`Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`);
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('QR Code not ready');
      return;
    }

    const link = document.createElement('a');
    const fileName = `qrcode-${selectedSermon?.title?.toLowerCase().replace(/\s+/g, '-') || 'sermon'}-${Date.now()}.png`;
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded successfully!');
  };

  // Print QR Code
  const handlePrintQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('QR Code not ready');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${selectedSermon?.title || 'Sermon'}</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
              .qr-container { text-align: center; padding: 40px; border: 2px solid #e5e7eb; border-radius: 16px; background: white; }
              img { width: 300px; height: 300px; margin: 20px 0; }
              h2 { color: #1f2937; margin-bottom: 8px; }
              p { color: #6b7280; margin: 4px 0; }
              .link { font-size: 12px; color: #9ca3af; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>${selectedSermon?.title || 'Digital Evangelism'}</h2>
              <p>Scan this QR code to join this sermon as a student</p>
              <img src="${canvas.toDataURL('image/png')}" />
              <p class="link">${shareLink}</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Print dialog opened!');
    }
  };

  // Share QR via file system
  const handleShareQR = async () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('QR Code not ready');
      return;
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (!blob) {
        toast.error('Failed to generate QR code image');
        return;
      }

      const fileName = `qrcode-${selectedSermon?.title?.toLowerCase().replace(/\s+/g, '-') || 'sermon'}-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Join "${selectedSermon?.title}"`,
          text: `Scan this QR code to join the sermon "${selectedSermon?.title}" as a student!`,
          files: [file],
        });
        toast.success('Shared successfully!');
      } else {
        downloadQRCode();
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        downloadQRCode();
      }
    }
  };

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const handleViewFullSermon = (sermon: Sermon) => {
    setViewingSermon(sermon);
    setShowFullViewModal(true);
  };

  const handleEditSermon = (sermonId: number) => {
    navigate(`/admin/sermons/edit/${sermonId}`);
  };

  const handleDeleteSermon = (sermon: Sermon) => {
    setConfirmAction({
      type: 'delete',
      id: sermon.id,
      title: sermon.title,
      message: `Are you sure you want to delete "${sermon.title}"? This action cannot be undone.`
    });
    setShowConfirmModal(true);
  };

  const handlePublishSermon = (sermon: Sermon) => {
    setConfirmAction({
      type: 'publish',
      id: sermon.id,
      title: sermon.title,
      message: `Are you sure you want to publish "${sermon.title}"? It will be visible to all students.`
    });
    setShowConfirmModal(true);
  };

  const handleArchiveSermon = (sermon: Sermon) => {
    setConfirmAction({
      type: 'archive',
      id: sermon.id,
      title: sermon.title,
      message: `Are you sure you want to archive "${sermon.title}"? It will be hidden from public view.`
    });
    setShowConfirmModal(true);
  };

  const handleGradeExam = (exam: any) => {
    setConfirmAction({
      type: 'grade',
      id: exam.id,
      title: exam.sermon_title,
      message: `Are you ready to grade ${exam.student_name}'s exam for "${exam.sermon_title}"?`
    });
    setShowConfirmModal(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setConfirmAction({
      type: 'delete_student',
      id: student.id,
      title: student.full_name,
      message: `Are you sure you want to remove ${student.full_name} from your students list?`
    });
    setShowConfirmModal(true);
  };

  // ========== EXECUTE CONFIRM ACTION ==========
  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'delete':
          await deleteSermon(confirmAction.id);
          await refreshAllSermons();
          toast.success(`Sermon "${confirmAction.title}" deleted successfully!`);
          break;
        case 'publish':
          await publishSermon(confirmAction.id);
          await refreshAllSermons();
          toast.success(`Sermon "${confirmAction.title}" published successfully!`);
          break;
        case 'archive':
          await updateSermon(confirmAction.id, { status: 'archived' });
          await refreshAllSermons();
          toast.success(`Sermon "${confirmAction.title}" archived successfully!`);
          break;
        case 'grade':
          navigate(`/evangelist/exams/${confirmAction.id}`);
          toast.success(`Opening exam for grading...`);
          break;
        case 'delete_student':
          await studentsAPI.delete(confirmAction.id);
          await refreshAllStudents();
          toast.success(`Student "${confirmAction.title}" removed successfully!`);
          break;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || `Failed to ${confirmAction.type}`);
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading || loadingSermons || loadingStudents || loadingExams) {
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
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={executeConfirmAction}
        title={confirmAction?.type === 'delete' ? 'Delete' : 
               confirmAction?.type === 'publish' ? 'Publish' : 
               confirmAction?.type === 'archive' ? 'Archive' : 
               confirmAction?.type === 'delete_student' ? 'Remove Student' :
               'Grade Exam'}
        message={confirmAction?.message || 'Are you sure?'}
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : 
                     confirmAction?.type === 'publish' ? 'Publish' : 
                     confirmAction?.type === 'archive' ? 'Archive' : 
                     confirmAction?.type === 'delete_student' ? 'Remove' :
                     'Grade'}
        type={confirmAction?.type === 'delete' ? 'danger' : 
              confirmAction?.type === 'publish' ? 'success' : 
              confirmAction?.type === 'archive' ? 'warning' : 
              confirmAction?.type === 'delete_student' ? 'danger' :
              'info'}
        icon={confirmAction?.type === 'delete' ? <FaTrash className="text-red-600 text-2xl" /> :
              confirmAction?.type === 'publish' ? <FaCheckCircle className="text-green-600 text-2xl" /> :
              confirmAction?.type === 'archive' ? <FaFileAlt className="text-yellow-600 text-2xl" /> :
              confirmAction?.type === 'delete_student' ? <FaUserGraduate className="text-red-600 text-2xl" /> :
              <FaEdit className="text-cyan-600 text-2xl" />}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedSermon(null);
        }}
        sermon={selectedSermon}
        qrValue={qrCodeValue}
        shareLink={shareLink}
        onCopyLink={handleCopyLink}
        onShareToSocial={handleShareToSocial}
        onDownloadQR={downloadQRCode}
        onPrintQR={handlePrintQR}
        onShareQR={handleShareQR}
        copied={copied}
        qrRef={qrRef}
      />

      {/* Full Sermon View Modal */}
      <FullSermonViewModal
        sermon={viewingSermon}
        isOpen={showFullViewModal}
        onClose={() => setShowFullViewModal(false)}
        onGenerateQR={handleOpenQRModal}
        onEdit={handleEditSermon}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Evangelist Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.full_name || 'Evangelist'}!
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/create-sermon" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
            <FaPlus />
            <span>Share New Sermon</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full"><FaUsers className="text-cyan-600 text-xl" /></div>
          </div>
          <div className="mt-2 text-sm text-green-600">{stats.activeStudents} active</div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingExams}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full"><FaClock className="text-yellow-600 text-xl" /></div>
          </div>
          <div className="mt-2 text-sm text-yellow-600">Need grading</div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><FaChartLine className="text-green-600 text-xl" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full"><FaGraduationCap className="text-purple-600 text-xl" /></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2">
        <nav className="flex flex-wrap gap-2">
          {['overview', 'students', 'exams', 'sermons'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {pendingExams.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaClock className="text-yellow-600 text-xl" />
                  <div>
                    <p className="font-medium text-gray-900">{pendingExams.length} exams pending grading</p>
                    <p className="text-sm text-gray-600">Review and grade student exams</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('exams')} className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                  Grade Now →
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaUserGraduate className="mr-2 text-cyan-500" />
                Recent Students
              </h3>
              <button onClick={() => setActiveTab('students')} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {myStudents.slice(0, 3).map((student: Student) => (
                <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold">
                      {student.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.full_name}</p>
                      <p className="text-xs text-gray-500">{student.exams_completed || 0} exams completed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Progress: </span>
                      <span className="font-semibold text-gray-900">{student.progress || 0}%</span>
                    </div>
                    {getStatusIcon(student.status)}
                  </div>
                </div>
              ))}
              {myStudents.length === 0 && (
                <p className="text-center text-gray-500 py-4">No students assigned yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 w-full sm:w-auto">
              <FaUserPlus />
              <span>Add Student</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student: Student) => (
              <div key={student.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold text-lg">
                      {student.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{student.full_name}</h4>
                      <p className="text-xs text-gray-500">{student.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {student.student_id}</p>
                    </div>
                  </div>
                  {getStatusIcon(student.status)}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{student.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-cyan-600 rounded-full h-2 transition-all" style={{ width: `${student.progress || 0}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>{student.exams_completed || 0} exams</span>
                    <span>Score: {student.total_score || 0}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 text-center text-sm bg-cyan-50 text-cyan-600 hover:text-cyan-700 py-2 rounded-lg transition-colors">
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDeleteStudent(student)}
                    className="text-center text-sm bg-red-50 text-red-600 hover:text-red-700 py-2 px-3 rounded-lg transition-colors"
                    title="Remove Student"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaUserGraduate className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{searchTerm ? 'No students match your search' : 'No students assigned yet'}</p>
            </div>
          )}
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search exams..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredExams.map((exam: any) => (
              <div key={exam.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-yellow-500">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{exam.sermon_title}</h4>
                    <p className="text-sm text-gray-600">Student: {exam.student_name}</p>
                    <p className="text-xs text-gray-400">Submitted: {new Date(exam.submitted_at).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending Review</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Questions: {exam.answers?.length || 0}
                  </div>
                  <button 
                    onClick={() => handleGradeExam(exam)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Grade Exam
                  </button>
                </div>
              </div>
            ))}

            {filteredExams.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No pending exams to grade</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sermons Tab */}
      {activeTab === 'sermons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sermons..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <Link to="/admin/create-sermon" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaPlus />
                <span>New Sermon</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSermons.map((sermon: Sermon) => (
              <div key={sermon.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{sermon.title}</h4>
                    <p className="text-sm text-gray-600">{sermon.views || 0} views</p>
                    <p className="text-xs text-cyan-600 mt-1">Topic: {sermon.topic}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(sermon.status)}`}>
                        {sermon.status_display || sermon.status}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FaHeart className="text-red-400 mr-1" />
                        {sermon.likes || 0}
                      </span>
                    </div>
                  </div>
                  <FaLemon className="text-cyan-500 flex-shrink-0 ml-2" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {sermon.published_at ? new Date(sermon.published_at).toLocaleDateString() : 'Draft'}
                  </span>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleViewFullSermon(sermon)}
                      className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                      title="View Full Sermon"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => handleOpenQRModal(sermon.id)}
                      className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                      title="Generate QR Code"
                    >
                      <FaQrcode />
                    </button>
                    <button 
                      onClick={() => handleEditSermon(sermon.id)}
                      className="p-2 text-gray-500 hover:text-yellow-600 transition-colors rounded-lg hover:bg-yellow-50"
                      title="Edit Sermon"
                    >
                      <FaEdit />
                    </button>
                    {sermon.status === 'draft' && (
                      <button 
                        onClick={() => handlePublishSermon(sermon)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                        title="Publish Sermon"
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                    {sermon.status === 'published' && (
                      <button 
                        onClick={() => handleArchiveSermon(sermon)}
                        className="p-2 text-gray-500 hover:text-yellow-600 transition-colors rounded-lg hover:bg-yellow-50"
                        title="Archive Sermon"
                      >
                        <FaFileAlt />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteSermon(sermon)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Delete Sermon"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSermons.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaLemon className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No sermons found</p>
              <Link to="/admin/create-sermon" className="inline-block mt-2 text-cyan-600 hover:text-cyan-700 font-medium">
                Share your first sermon
              </Link>
            </div>
          )}
        </div>
      )}

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

export default EvangelistDashboard;
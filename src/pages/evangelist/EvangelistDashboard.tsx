// src/pages/evangelist/EvangelistDashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaLemon, FaGraduationCap, FaShare, 
  FaQrcode, FaPlus, FaSearch, FaEye, FaEdit,
  FaCheckCircle, FaClock, FaExclamationCircle,
  FaChartLine, FaUserPlus, FaDownload, FaPrint,
  FaWhatsapp, FaFacebook, FaTwitter, FaInstagram,
  FaTelegram, FaEnvelope, FaLink, FaCopy,
  FaTimes, FaSpinner, FaFileAlt, FaTrash,
  FaArrowLeft, FaArrowRight, FaCalendarAlt,
  FaUserCircle, FaStar, FaStarHalf, FaRegStar,
  FaBook, FaUserGraduate, FaClipboardList,
  FaBible, FaQuestion, FaTag, FaFire, FaCross,
  FaCheckSquare, FaList, FaEdit as FaEditIcon,
  FaHeart, FaComment, FaThumbsUp
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { FaRadio } from 'react-icons/fa6';

// ===================== TYPES =====================

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  examsCompleted: number;
  averageScore: number;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
}

interface PendingExam {
  id: string;
  studentName: string;
  studentId: string;
  sermonTitle: string;
  sermonId: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  score?: number;
  feedback?: string;
}

interface Question {
  id: string;
  text: string;
  type: 'short_answer' | 'long_answer' | 'checkbox' | 'radio' | 'true_false';
  options?: string[];
  required: boolean;
  correctAnswer?: string | string[];
}

interface Sermon {
  id: string;
  title: string;
  topic: string;
  content: string;
  description: string;
  bibleVerses: string[];
  questions: Question[];
  views: number;
  students: number;
  likes: number;
  shares: number;
  date: string;
  duration: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// ===================== FULL SERMON VIEW MODAL =====================

interface FullSermonViewModalProps {
  sermon: Sermon | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateQR: (sermonId: string) => void;
  onEdit: (sermonId: string) => void;
}

const FullSermonViewModal: React.FC<FullSermonViewModalProps> = ({
  sermon,
  isOpen,
  onClose,
  onGenerateQR,
  onEdit,
}) => {
  if (!isOpen || !sermon) return null;

  const getQuestionTypeIcon = (type: string) => {
    switch(type) {
      case 'short_answer': return <FaEditIcon className="text-blue-500" />;
      case 'long_answer': return <FaEditIcon className="text-purple-500" />;
      case 'checkbox': return <FaCheckSquare className="text-green-500" />;
      case 'radio': return <FaRadio className="text-orange-500" />;
      case 'true_false': return <FaCross className="text-red-500" />;
      default: return <FaQuestion className="text-gray-500" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      short_answer: 'Short Answer',
      long_answer: 'Long Answer',
      checkbox: 'Multiple Choice',
      radio: 'Single Choice',
      true_false: 'True / False',
    };
    return labels[type] || type;
  };

  const handlePublicView = () => {
    const url = `${window.location.origin}/join/sermon-${sermon.id}?sermon=${encodeURIComponent(sermon.title)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join/sermon-${sermon.id}?sermon=${encodeURIComponent(sermon.title)}`;
    navigator.clipboard.writeText(url);
    toast.success('Sermon link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Meta Info */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              sermon.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : sermon.status === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {sermon.status || 'Draft'}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FaCalendarAlt className="mr-1" />
              {new Date(sermon.date).toLocaleDateString()}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FaClock className="mr-1" />
              {sermon.duration || '45 min'}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FaUsers className="mr-1" />
              {sermon.students || 0} students
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FaEye className="mr-1" />
              {sermon.views || 0} views
            </span>
          </div>

          {/* Description */}
          {sermon.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaTag className="mr-2 text-cyan-500" />
                Description
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">{sermon.description}</p>
            </div>
          )}

          {/* Bible Verses */}
          {sermon.bibleVerses && sermon.bibleVerses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaBible className="mr-2 text-purple-500" />
                Bible Verses
              </h4>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="space-y-1">
                  {sermon.bibleVerses.map((verse, index) => (
                    <p key={index} className="text-sm text-purple-700 font-serif italic">
                      "{verse}"
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Full Content */}
          {sermon.content && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaLemon className="mr-2 text-cyan-500" />
                Sermon Content
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {sermon.content}
                </p>
              </div>
            </div>
          )}

          {/* Questions Section */}
          {sermon.questions && sermon.questions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                  <FaQuestion className="mr-2 text-green-500" />
                  Exam Questions
                </h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {sermon.questions.length} questions
                </span>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {sermon.questions.map((question, index) => (
                  <div key={question.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <span className="text-xs font-medium text-gray-500 mt-0.5">Q{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getQuestionTypeIcon(question.type)}
                          <span className="text-xs text-gray-400">({getQuestionTypeLabel(question.type)})</span>
                          {question.required && (
                            <span className="text-xs text-red-500">*Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{question.text}</p>
                        
                        {/* Show options for checkbox and radio */}
                        {(question.type === 'checkbox' || question.type === 'radio') && question.options && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Options:</p>
                            <div className="space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span className="text-gray-400 text-xs">{String.fromCharCode(65 + optIndex)}.</span>
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* True/False options */}
                        {question.type === 'true_false' && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Options:</p>
                            <div className="flex space-x-4 text-sm text-gray-600">
                              <span>○ True</span>
                              <span>○ False</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-lg font-bold text-blue-600">{sermon.views || 0}</p>
              <p className="text-xs text-gray-500">Views</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-lg font-bold text-green-600">{sermon.students || 0}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-lg font-bold text-purple-600">{sermon.questions?.length || 0}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-lg font-bold text-orange-600">{sermon.duration || '45'}</p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onClose();
                onGenerateQR(sermon.id);
              }}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
              <FaQrcode className="mr-2" />
              Generate QR Code
            </button>
            <button
              onClick={handlePublicView}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
              <FaShare className="mr-2" />
              Public View
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(sermon.id);
              }}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
              <FaEdit className="mr-2" />
              Edit Sermon
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
              <FaLink className="mr-2" />
              Copy Link
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            Created: {new Date(sermon.createdAt).toLocaleDateString()}
            {sermon.likes !== undefined && (
              <span className="ml-4">❤️ {sermon.likes} likes</span>
            )}
            {sermon.shares !== undefined && (
              <span className="ml-4">🔄 {sermon.shares} shares</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN DASHBOARD =====================

const EvangelistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'exams' | 'sermons'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewingSermon, setViewingSermon] = useState<Sermon | null>(null);
  const [showFullViewModal, setShowFullViewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  
  const qrRef = useRef<HTMLDivElement>(null);

  // ===================== MOCK DATA =====================

  const stats = {
    totalStudents: 156,
    activeStudents: 134,
    pendingExams: 23,
    totalSermons: 45,
    averageScore: 78,
    completionRate: 89,
  };

  const students: Student[] = [
    { 
      id: '1', 
      name: 'Sarah Johnson', 
      email: 'sarah@email.com', 
      progress: 85, 
      examsCompleted: 8, 
      averageScore: 82, 
      status: 'active',
      joinedDate: '2026-01-10'
    },
    { 
      id: '2', 
      name: 'Michael Kim', 
      email: 'michael@email.com', 
      progress: 92, 
      examsCompleted: 10, 
      averageScore: 88, 
      status: 'active',
      joinedDate: '2026-01-12'
    },
    { 
      id: '3', 
      name: 'Grace Mwangi', 
      email: 'grace@email.com', 
      progress: 65, 
      examsCompleted: 5, 
      averageScore: 70, 
      status: 'active',
      joinedDate: '2026-01-15'
    },
    { 
      id: '4', 
      name: 'David Ochieng', 
      email: 'david@email.com', 
      progress: 45, 
      examsCompleted: 3, 
      averageScore: 55, 
      status: 'pending',
      joinedDate: '2026-01-18'
    },
  ];

  const pendingExams: PendingExam[] = [
    { 
      id: '1', 
      studentName: 'Sarah Johnson', 
      studentId: '1',
      sermonTitle: 'The Power of Faith', 
      sermonId: '1',
      submittedAt: '2026-01-20T10:30:00', 
      status: 'pending' 
    },
    { 
      id: '2', 
      studentName: 'Michael Kim', 
      studentId: '2',
      sermonTitle: 'Walking in Love', 
      sermonId: '2',
      submittedAt: '2026-01-19T14:45:00', 
      status: 'pending' 
    },
    { 
      id: '3', 
      studentName: 'Grace Mwangi', 
      studentId: '3',
      sermonTitle: 'The Power of Faith', 
      sermonId: '1',
      submittedAt: '2026-01-18T09:15:00', 
      status: 'pending' 
    },
  ];

  const [sermons, setSermons] = useState<Sermon[]>([
    { 
      id: '1', 
      title: 'The Power of Faith', 
      topic: 'Faith', 
      views: 45, 
      students: 12, 
      likes: 156,
      shares: 89,
      date: '2026-01-15',
      duration: '45 min',
      status: 'published',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
      description: 'A powerful sermon about the importance of faith in our daily lives',
      content: `Faith is the substance of things hoped for, the evidence of things not seen.

In this powerful sermon, we explore the transformative power of faith in our daily lives. Faith is not just believing in God, but trusting Him completely with every aspect of our lives.

The Bible tells us in Hebrews 11:1 that "Faith is the substance of things hoped for, the evidence of things not seen." This verse reminds us that faith is the foundation of our relationship with God.

When we have faith, we can move mountains. When we have faith, we can overcome any obstacle. When we have faith, we can experience God's miraculous power in our lives.

Let us examine three key aspects of faith:

1. Faith is trusting God when we cannot see the outcome
2. Faith is taking action based on God's promises
3. Faith is persevering through trials and difficulties

May this sermon strengthen your faith and draw you closer to God.`,
      bibleVerses: ['Hebrews 11:1', 'Matthew 17:20', '2 Corinthians 5:7'],
      questions: [
        { id: '1', text: 'What is faith according to Hebrews 11:1?', type: 'short_answer', required: true },
        { id: '2', text: 'List three key aspects of faith mentioned in the sermon.', type: 'checkbox', options: ['Trusting God', 'Taking action', 'Persevering through trials', 'Having doubts'], required: true },
        { id: '3', text: 'How does faith help us overcome obstacles?', type: 'long_answer', required: false },
        { id: '4', text: 'Faith is the substance of things hoped for.', type: 'true_false', required: true },
      ],
    },
    { 
      id: '2', 
      title: 'Walking in Love', 
      topic: 'Love', 
      views: 38, 
      students: 9, 
      likes: 98,
      shares: 45,
      date: '2026-01-12',
      duration: '50 min',
      status: 'published',
      createdAt: '2026-01-12T10:00:00Z',
      updatedAt: '2026-01-12T10:00:00Z',
      description: 'A sermon about walking in love and reflecting God\'s love',
      content: `Love is patient, love is kind. It does not envy, it does not boast, it is not proud.

This sermon delves into the true meaning of love and how we can walk in love every day, reflecting God's love to those around us.`,
      bibleVerses: ['1 Corinthians 13:4-7', 'John 13:34-35'],
      questions: [
        { id: '1', text: 'What is love according to 1 Corinthians 13?', type: 'short_answer', required: true },
        { id: '2', text: 'How can we show love to others?', type: 'long_answer', required: false },
      ],
    },
    { 
      id: '3', 
      title: 'Spiritual Growth', 
      topic: 'Spiritual Growth', 
      views: 56, 
      students: 15, 
      likes: 67,
      shares: 23,
      date: '2026-01-10',
      duration: '55 min',
      status: 'draft',
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
      description: 'Explore the journey of spiritual growth',
      content: `Growing in faith is a journey, not a destination. This sermon explores the various stages of spiritual growth and how we can cultivate a deeper relationship with God through prayer, study, and fellowship.`,
      bibleVerses: ['2 Peter 3:18', 'Colossians 2:6-7'],
      questions: [
        { id: '1', text: 'What is spiritual growth?', type: 'short_answer', required: true },
        { id: '2', text: 'How can we grow spiritually?', type: 'checkbox', options: ['Prayer', 'Bible Study', 'Fellowship', 'Fasting'], required: true },
      ],
    },
  ]);

  // ===================== FILTERED DATA =====================

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sermon.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sermon.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredExams = pendingExams.filter(exam =>
    exam.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.sermonTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===================== HANDLERS =====================

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
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
    };
    return styles[status] || styles.pending;
  };

  // Generate QR Code
  const handleGenerateQRCode = (sermonId?: string) => {
    setIsGenerating(true);
    
    let sermon: Sermon | undefined;
    if (sermonId) {
      sermon = sermons.find(s => s.id === sermonId);
    }
    
    if (!sermon && sermons.length > 0) {
      sermon = sermons[0];
    }
    
    if (!sermon) {
      toast.error('No sermon available to generate QR code');
      setIsGenerating(false);
      return;
    }

    setTimeout(() => {
      const baseUrl = window.location.origin;
      const uniqueId = `sermon-${sermon.id}-${Date.now()}`;
      const value = `${baseUrl}/join/${uniqueId}?sermon=${encodeURIComponent(sermon.title)}`;
      
      setQrCodeValue(value);
      setShareLink(value);
      setSelectedSermon(sermon);
      setShowQRCode(true);
      setIsGenerating(false);
      
      toast.success(`QR Code generated for "${sermon.title}"!`);
    }, 1500);
  };

  // View full sermon
  const handleViewFullSermon = (sermon: Sermon) => {
    setViewingSermon(sermon);
    setShowFullViewModal(true);
  };

  // Edit sermon
  const handleEditSermon = (sermonId: string) => {
    navigate(`/admin/sermons/edit/${sermonId}`);
  };

  // Share QR Code via file system
  const handleShareQRCode = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) {
      toast.error('QR Code not ready. Please generate again.');
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed to generate QR code image');
        return;
      }

      const fileName = `qrcode-${selectedSermon?.title?.toLowerCase().replace(/\s+/g, '-') || 'sermon'}-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      
      if (navigator.share) {
        navigator.share({
          title: `Join for "${selectedSermon?.title}"`,
          text: `Scan this QR code to join the sermon "${selectedSermon?.title}" as a student!`,
          files: [file],
        }).catch((error) => {
          console.log('Share cancelled or failed:', error);
          downloadQRCode();
        });
      } else {
        downloadQRCode();
      }
    }, 'image/png');
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
    link.click();
    toast.success('QR Code downloaded successfully!');
  };

  // Share via social media
  const handleShareVia = (platform: string) => {
    const encodedLink = encodeURIComponent(shareLink);
    const sermonTitle = selectedSermon?.title || 'Sermon';
    const text = encodeURIComponent(`Join the sermon "${sermonTitle}" in the Digital Evangelism program!`);
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${encodedLink}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedLink}`,
      telegram: `https://t.me/share/url?url=${encodedLink}&text=${text}`,
      email: `mailto:?subject=Join%20Sermon%20-%20${sermonTitle}&body=${text}%0A%0A${encodedLink}`,
    };

    if (platform === 'link') {
      navigator.clipboard.writeText(shareLink).then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      });
      return;
    }

    const url = urls[platform];
    if (url) {
      window.open(url, '_blank');
      toast.success(`Opening ${platform}...`);
    }
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
          <head><title>QR Code - ${selectedSermon?.title || 'Sermon'}</title></head>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;font-family:Arial,sans-serif;">
            <img src="${canvas.toDataURL('image/png')}" style="width:300px;height:300px;" />
            <h2>${selectedSermon?.title || 'Digital Evangelism'}</h2>
            <p>Scan this QR code to join this sermon as a student</p>
            <p style="font-size:12px;color:#666;">${shareLink}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success('Print dialog opened!');
    }
  };

  // Grade exam
  const handleGradeExam = (examId: string) => {
    toast.success('Opening exam grading...');
    // Navigate to exam grading page
    navigate(`/evangelist/exams/${examId}`);
  };

  // Delete sermon
  const handleDeleteSermon = (sermonId: string) => {
    if (window.confirm('Are you sure you want to delete this sermon?')) {
      setSermons(prev => prev.filter(s => s.id !== sermonId));
      toast.success('Sermon deleted successfully!');
    }
  };

  // ===================== RENDER =====================

  return (
    <div className="space-y-6">
      {/* Full Sermon View Modal */}
      <FullSermonViewModal
        sermon={viewingSermon}
        isOpen={showFullViewModal}
        onClose={() => setShowFullViewModal(false)}
        onGenerateQR={handleGenerateQRCode}
        onEdit={handleEditSermon}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Evangelist Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your students and track their progress
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/ev/dashboard" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
            <FaPlus />
            <span>Share New Sermon</span>
          </Link>
        </div>
      </div>

      {/* QR Code Display with Share Options */}
      {showQRCode && selectedSermon && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-cyan-500 animate-fadeIn">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaQrcode className="text-white text-2xl" />
                <div>
                  <h3 className="text-white font-semibold">QR Code for "{selectedSermon.title}"</h3>
                  <p className="text-white/80 text-sm">Share this QR code with students to join this sermon</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowQRCode(false);
                  setSelectedSermon(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row items-center gap-8">
            {/* QR Code */}
            <div ref={qrRef} className="flex-shrink-0 p-4 bg-white rounded-xl shadow-md border border-gray-200">
              <QRCodeSVG
                value={qrCodeValue}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#0e7490"
              />
              <p className="text-center text-xs text-gray-500 mt-2">
                {selectedSermon.title}
              </p>
            </div>

            {/* Share Options */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleShareVia('whatsapp')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <FaWhatsapp />
                  <span className="text-sm">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShareVia('facebook')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FaFacebook />
                  <span className="text-sm">Facebook</span>
                </button>
                <button
                  onClick={() => handleShareVia('twitter')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  <FaTwitter />
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={() => handleShareVia('telegram')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <FaTelegram />
                  <span className="text-sm">Telegram</span>
                </button>
                <button
                  onClick={() => handleShareVia('email')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <FaEnvelope />
                  <span className="text-sm">Email</span>
                </button>
                <button
                  onClick={() => handleShareVia('link')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  {copied ? <FaCheckCircle /> : <FaLink />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={handleShareQRCode}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors col-span-2"
                >
                  <FaDownload />
                  <span className="text-sm">Share via File System</span>
                </button>
              </div>

              {/* Sermon Info */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Sermon</p>
                    <p className="font-medium text-gray-900">{selectedSermon.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Topic</p>
                    <p className="font-medium text-gray-900">{selectedSermon.topic}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="font-medium text-gray-900">{selectedSermon.students}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Views</p>
                    <p className="font-medium text-gray-900">{selectedSermon.views}</p>
                  </div>
                </div>
              </div>

              {/* Link Display */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Shareable Link:</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-700 truncate flex-1 mr-2">{shareLink}</code>
                  <button
                    onClick={() => handleShareVia('link')}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center"
                  >
                    {copied ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
                    <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center text-sm"
                >
                  <FaDownload className="mr-2" />
                  Download QR
                </button>
                <button
                  onClick={handlePrintQR}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center text-sm"
                >
                  <FaPrint className="mr-2" />
                  Print QR
                </button>
                <button
                  onClick={() => {
                    setShowQRCode(false);
                    setSelectedSermon(null);
                    toast.info('QR Code hidden');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center text-sm"
                >
                  <FaTimes className="mr-2" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaUsers className="text-cyan-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            {stats.activeStudents} active
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingExams}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 text-sm text-yellow-600">
            Need grading
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaChartLine className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            +5% from last month
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaGraduationCap className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 text-sm text-purple-600">
            Overall progress
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

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Pending Exams Alert */}
          {pendingExams.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaClock className="text-yellow-600 text-xl" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {pendingExams.length} exams pending grading
                    </p>
                    <p className="text-sm text-gray-600">
                      Review and grade student exams
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('exams')}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Grade Now →
                </button>
              </div>
            </div>
          )}

          {/* Recent Students */}
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
              {students.slice(0, 3).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.examsCompleted} exams completed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Score: </span>
                      <span className="font-semibold text-gray-900">{student.averageScore}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(student.status)}
                    </div>
                    <button className="text-sm text-cyan-600 hover:text-cyan-700">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== STUDENTS TAB ===== */}
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
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-semibold text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{student.name}</h4>
                      <p className="text-xs text-gray-500">{student.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Joined: {new Date(student.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {getStatusIcon(student.status)}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{student.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-cyan-600 rounded-full h-2 transition-all"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>{student.examsCompleted} exams</span>
                    <span>Score: {student.averageScore}%</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 text-center text-sm bg-cyan-50 text-cyan-600 hover:text-cyan-700 py-2 rounded-lg transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 text-center text-sm bg-gray-100 text-gray-600 hover:text-gray-700 py-2 rounded-lg transition-colors">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaUserGraduate className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>
      )}

      {/* ===== EXAMS TAB ===== */}
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
            <select className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white">
              <option value="all">All Exams</option>
              <option value="pending">Pending</option>
              <option value="graded">Graded</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-yellow-500">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{exam.sermonTitle}</h4>
                    <p className="text-sm text-gray-600">Student: {exam.studentName}</p>
                    <p className="text-xs text-gray-400">ID: {exam.studentId}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Pending Review
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Submitted: {new Date(exam.submittedAt).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleGradeExam(exam.id)}
                    className="px-4 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
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

      {/* ===== SERMONS TAB ===== */}
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
              <Link to="/ev/dashboard" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                <FaPlus />
                <span>Share New Sermon</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSermons.map((sermon) => (
              <div key={sermon.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{sermon.title}</h4>
                    <p className="text-sm text-gray-600">
                      {sermon.students} students • {sermon.views} views
                    </p>
                    <p className="text-xs text-cyan-600 mt-1">Topic: {sermon.topic}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(sermon.status)}`}>
                        {sermon.status || 'Draft'}
                      </span>
                      <span className="text-xs text-gray-500">{sermon.duration}</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FaHeart className="text-red-400 mr-1" />
                        {sermon.likes}
                      </span>
                    </div>
                  </div>
                  <FaLemon className="text-cyan-500 flex-shrink-0 ml-2" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Shared: {new Date(sermon.date).toLocaleDateString()}
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
                      onClick={() => handleGenerateQRCode(sermon.id)}
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
                    <button 
                      onClick={() => handleDeleteSermon(sermon.id)}
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
              <Link to="/ev/dashboard" className="inline-block mt-2 text-cyan-600 hover:text-cyan-700 font-medium">
                Share your first sermon
              </Link>
            </div>
          )}
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

export default EvangelistDashboard;
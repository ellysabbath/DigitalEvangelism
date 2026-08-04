// src/pages/admin/ViewSermon.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft, FaEye, FaUsers, FaClock, 
  FaPrint, FaShare, FaEdit, FaQuestion, 
  FaCalendarAlt, FaTag, FaBible, FaBook, FaCheckCircle,
  FaCross, FaSpinner, FaDownload, FaQrcode,
  FaWhatsapp, FaFacebook, FaTwitter, FaTelegram, FaCopy,
  FaStar, FaRegStar, FaFire, FaRocket, FaEdit as FaEditIcon,
  FaList, FaCircle, FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useAdmin } from '../../auth/context/AdminContext';
import { sermonsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FaRadio } from 'react-icons/fa6';

type QuestionType = 'short_answer' | 'long_answer' | 'checkbox' | 'radio' | 'true_false';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

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

const ViewSermon: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { refreshAllSermons } = useAdmin();
  
  const [sermon, setSermon] = useState<SermonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // ========== FETCH SERMON ==========
  useEffect(() => {
    const fetchSermon = async () => {
      if (!id) {
        setError('Sermon ID not provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await sermonsAPI.get(parseInt(id));
        setSermon(response.data);
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

  // ========== HANDLERS ==========
  const handlePrint = () => {
    window.print();
  };

  const handleShare = (platform?: string) => {
    const url = window.location.href;
    const text = `Check out this powerful sermon: ${sermon?.title || 'Sermon'}`;
    
    if (platform === 'copy' || !platform) {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      setShowShareOptions(false);
      return;
    }

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };

    if (platform in shareUrls) {
      window.open(shareUrls[platform], '_blank');
      setShowShareOptions(false);
    }
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch(type) {
      case 'short_answer':
        return <FaEditIcon className="text-blue-500" />;
      case 'long_answer':
        return <FaEditIcon className="text-purple-500" />;
      case 'checkbox':
        return <FaCheckCircle className="text-green-500" />;
      case 'radio':
        return <FaRadio className="text-orange-500" />;
      case 'true_false':
        return <FaCross className="text-red-500" />;
      default:
        return <FaQuestion className="text-gray-500" />;
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      short_answer: 'Short Answer',
      long_answer: 'Long Answer',
      checkbox: 'Multiple Choice',
      radio: 'Single Choice',
      true_false: 'True / False',
    };
    return labels[type] || type;
  };

  const getQuestionTypeColor = (type: QuestionType) => {
    const colors: Record<QuestionType, string> = {
      short_answer: 'border-blue-200 bg-blue-50',
      long_answer: 'border-purple-200 bg-purple-50',
      checkbox: 'border-green-200 bg-green-50',
      radio: 'border-orange-200 bg-orange-50',
      true_false: 'border-red-200 bg-red-50',
    };
    return colors[type] || 'border-gray-200 bg-gray-50';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      published: { label: 'Published', className: 'bg-green-100 text-green-700' },
      draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
      archived: { label: 'Archived', className: 'bg-gray-100 text-gray-700' },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
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
            onClick={() => navigate('/admin/sermons')}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Sermons
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(sermon.status);
  const questions = sermon.questions || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/sermons')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
            title="Back to Sermons"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sermon.title}</h1>
            <p className="text-sm text-gray-600">View sermon details and content</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
            title="Print"
          >
            <FaPrint />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
              title="Share"
            >
              <FaShare />
            </button>
            {showShareOptions && (
              <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl p-2 z-50 min-w-[200px] border border-gray-200">
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
            className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
            title="QR Code"
          >
            <FaQrcode />
          </button>
        </div>
      </div>

      {/* QR Code */}
      {showQRCode && (
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-200">
          <div className="p-4 bg-white rounded-lg">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaQrcode className="text-6xl text-gray-400" />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">Scan to view this sermon</p>
          <button className="mt-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium">
            Download QR Code
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Status Bar */}
        <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center text-gray-600">
              <FaBook className="mr-2 text-cyan-500" />
              Topic: <strong className="ml-1 text-gray-900">{sermon.topic}</strong>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center text-gray-600">
              <FaEye className="mr-2 text-cyan-500" />
              {sermon.views} views
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center text-gray-600">
              <FaClock className="mr-2 text-cyan-500" />
              Created: {new Date(sermon.created_at).toLocaleDateString()}
            </span>
            {sermon.published_at && (
              <>
                <span className="text-gray-300">|</span>
                <span className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2 text-cyan-500" />
                  Published: {new Date(sermon.published_at).toLocaleDateString()}
                </span>
              </>
            )}
            <span className="text-gray-300">|</span>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scripture */}
          {sermon.scripture && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaBible className="mr-2 text-purple-500" />
                Scripture
              </h3>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700 font-serif italic">
                  "{sermon.scripture}"
                </p>
              </div>
            </div>
          )}

          {/* Sermon Content */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaBook className="mr-2 text-cyan-500" />
              Sermon Content
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{sermon.content}</p>
            </div>
          </div>

          {/* Questions */}
          {questions && questions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  <FaQuestion className="mr-2 text-green-500" />
                  Exam Questions
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {questions.length} questions
                </span>
              </div>
              <div className="space-y-3">
                {questions.map((question: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border ${getQuestionTypeColor(question.type || 'short_answer')} transition-colors`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                          {getQuestionTypeIcon(question.type || 'short_answer')}
                          <span className="text-xs text-gray-400">({getQuestionTypeLabel(question.type || 'short_answer')})</span>
                          {question.required && (
                            <span className="text-xs text-red-500">*Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{question.text}</p>
                      </div>
                    </div>
                    
                    {/* Show options for checkbox and radio */}
                    {(question.type === 'checkbox' || question.type === 'radio') && question.options && question.options.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-current border-opacity-30">
                        <p className="text-xs text-gray-500 mb-1">Options:</p>
                        <div className="space-y-1">
                          {question.options.map((option: string, optIndex: number) => (
                            <div key={optIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                              <span className="text-gray-400 text-xs">{String.fromCharCode(65 + optIndex)}.</span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show True/False options */}
                    {question.type === 'true_false' && (
                      <div className="mt-3 pl-4 border-l-2 border-current border-opacity-30">
                        <p className="text-xs text-gray-500 mb-1">Options:</p>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>○ True</span>
                          <span>○ False</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{sermon.views}</p>
              <p className="text-xs text-gray-500">Views</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">{sermon.likes}</p>
              <p className="text-xs text-gray-500">Likes</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">{sermon.shares}</p>
              <p className="text-xs text-gray-500">Shares</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-600">{sermon.questions_count || 0}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Author:</strong> {sermon.author_name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Created:</strong> {new Date(sermon.created_at).toLocaleDateString()}
                </p>
                {sermon.published_at && (
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Published:</strong> {new Date(sermon.published_at).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Status:</strong> 
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => navigate(`/admin/sermons/edit/${sermon.id}`)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <FaEdit />
                  <span>Edit Sermon</span>
                </button>
                <button 
                  onClick={() => navigate(`/sermons/${sermon.id}`)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <FaEye />
                  <span>View Public</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSermon;
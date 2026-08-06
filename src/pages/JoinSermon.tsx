// src/pages/JoinSermon.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FaUserPlus,  
   FaBookOpen, FaHeart, 
  FaWhatsapp, FaFacebook, FaTwitter, FaTelegram,
  FaLink,FaCheckCircle,
  FaSpinner, FaArrowLeft, 
  FaPray, FaBible, 
  FaBook, FaEye, FaTimesCircle
} from 'react-icons/fa';
import { useAuth } from '../auth/context/AuthContext';
import { useAdmin } from '../auth/context/AdminContext';
import { sermonsAPI } from '../services/api';
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

const JoinSermon: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const {  } = useAdmin();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [sermon, setSermon] = useState<SermonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sermonId, setSermonId] = useState<number | null>(null);

  // Extract sermon ID from URL
  useEffect(() => {
    // Get the sermon ID from the URL path
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Handle both formats: "sermon-2" and "2"
    let id: number | null = null;
    
    if (lastPart) {
      // If it's in format "sermon-2", extract the number
      if (lastPart.startsWith('sermon-')) {
        const numberPart = lastPart.replace('sermon-', '');
        id = parseInt(numberPart);
      } else {
        // Try to parse as direct number
        id = parseInt(lastPart);
      }
    }
    
    // Also check query params for sermon ID
    const searchParams = new URLSearchParams(location.search);
    const sermonParam = searchParams.get('sermon');
    
    if (isNaN(id as number) && sermonParam) {
      // If we have a sermon title in query params, we might need to fetch by title
      // For now, we'll use the ID from the path
      console.log('Sermon title from query:', sermonParam);
    }
    
    setSermonId(id);
  }, [location]);

  // Fetch sermon data
  useEffect(() => {
    const fetchSermon = async () => {
      if (sermonId === null || isNaN(sermonId)) {
        setError('Invalid sermon ID');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await sermonsAPI.get(sermonId);
        setSermon(response.data);
      } catch (err: any) {
        console.error('Error fetching sermon:', err);
        setError(err.response?.data?.error || 'Failed to load sermon');
        toast.error('Failed to load sermon');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSermon();
  }, [sermonId]);

  // Check if user has joined
  useEffect(() => {
    if (sermon) {
      const joined = localStorage.getItem(`joined_${sermon.id}`);
      if (joined) {
        setHasJoined(true);
      }
    }
  }, [sermon]);

  // Handle joining the sermon
  const handleJoinSermon = async () => {
    if (!isAuthenticated) {
      toast.error('Please login or register to join this sermon');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    setIsJoining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasJoined(true);
      if (sermon) {
        localStorage.setItem(`joined_${sermon.id}`, 'true');
      }
      toast.success(`You have joined "${sermon?.title}" successfully!`);
    } catch (error) {
      toast.error('Failed to join sermon. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle like
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast.success('You liked this sermon!');
    }
  };

  // Handle share
  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Handle share via social media
  const handleShareVia = (platform: string) => {
    const shareUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Join the sermon "${sermon?.title}" in the Digital Evangelism program!`);
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      telegram: `https://t.me/share/url?url=${shareUrl}&text=${text}`,
      email: `mailto:?subject=Join%20Sermon%20-%20${sermon?.title}&body=${text}%0A%0A${shareUrl}`,
    };

    const url = urls[platform];
    if (url) {
      window.open(url, '_blank');
      toast.success(`Opening ${platform}...`);
    }
  };

  // Handle back to sermon detail
  const handleBackToSermon = () => {
    if (sermon) {
      navigate(`/sermons/${sermon.id}`);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading sermon...</p>
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sermon Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The sermon you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Link to="/" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = {
    published: { label: 'Published', className: 'bg-green-100 text-green-700' },
    draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
    archived: { label: 'Archived', className: 'bg-gray-100 text-gray-700' },
  }[sermon.status] || { label: sermon.status, className: 'bg-gray-100 text-gray-700' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToSermon}
          className="inline-flex items-center text-cyan-600 hover:text-cyan-700 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Sermon
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <FaBook className="text-3xl" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{sermon.title}</h1>
                  <p className="text-cyan-100 text-sm">Topic: {sermon.topic}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Author & Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-lg">
                  {sermon.author_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{sermon.author_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">
                    {sermon.created_at ? new Date(sermon.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center text-gray-600">
                  <FaEye className="mr-1 text-cyan-500" />
                  {sermon.views} views
                </span>
                <span className="flex items-center text-gray-600">
                  <FaBookOpen className="mr-1 text-cyan-500" />
                  {sermon.questions_count || 0} questions
                </span>
              </div>
            </div>

            {/* Scripture */}
            {sermon.scripture && (
              <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                <h3 className="text-sm font-semibold text-cyan-700 mb-2 flex items-center">
                  <FaBible className="mr-2" />
                  Key Scripture
                </h3>
                <p className="text-cyan-700 font-serif italic">
                  "{sermon.scripture}"
                </p>
              </div>
            )}

            {/* Content Preview */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FaBook className="mr-2 text-cyan-500" />
                Sermon Preview
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-6">
                {sermon.content}
              </p>
              <button
                onClick={handleBackToSermon}
                className="mt-3 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Read Full Sermon →
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {/* Join Button */}
                {hasJoined ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <FaCheckCircle className="mr-2" />
                    <span className="font-medium">You have joined this sermon</span>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinSermon}
                    disabled={isJoining}
                    className="flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isJoining ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="mr-2" />
                        Join Sermon
                      </>
                    )}
                  </button>
                )}

                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isLiked
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <FaHeart className="mr-2" />
                  <span>{sermon.likes + (isLiked ? 1 : 0)}</span>
                </button>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 mr-1">Share:</span>
                <button
                  onClick={() => handleShareVia('whatsapp')}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <FaWhatsapp />
                </button>
                <button
                  onClick={() => handleShareVia('facebook')}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FaFacebook />
                </button>
                <button
                  onClick={() => handleShareVia('twitter')}
                  className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  <FaTwitter />
                </button>
                <button
                  onClick={() => handleShareVia('telegram')}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <FaTelegram />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  {copied ? <FaCheckCircle /> : <FaLink />}
                </button>
              </div>
            </div>

            {/* Join Information */}
            {!isAuthenticated && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <FaPray className="text-yellow-600 text-xl mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Want to join this sermon?</p>
                    <p className="text-sm text-gray-600">
                      Please <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">login</Link> or{' '}
                      <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-medium">register</Link> to join this sermon and access all features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-600">{sermon.views}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-600">{sermon.questions_count || 0}</p>
                <p className="text-xs text-gray-500">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-600">{sermon.likes}</p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-600">{sermon.shares}</p>
                <p className="text-xs text-gray-500">Shares</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by Digital Evangelism System</p>
        </div>
      </div>
    </div>
  );
};

export default JoinSermon;
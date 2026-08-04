// src/pages/Sermons.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaPlus, FaEye, FaHeart, 
  FaComment, FaShare, FaSpinner, FaTimesCircle,
  FaBook, FaUser, FaCalendar, FaArrowRight
} from 'react-icons/fa';
import { useAdmin } from '../auth/context/AdminContext';
import type { Sermon } from '../types/data';
import toast from 'react-hot-toast';

const Sermons: React.FC = () => {
  const { sermons, loadingSermons, sermonError, refreshAllSermons } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([]);
  const [likedSermons, setLikedSermons] = useState<Set<number>>(new Set());
  const [isLiking, setIsLiking] = useState<number | null>(null);

  // ========== FILTER SERMONS ==========
  useEffect(() => {
    let filtered = [...sermons];

    if (searchTerm) {
      filtered = filtered.filter(sermon =>
        sermon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'published') {
      filtered = filtered.filter(sermon => sermon.status === 'published');
    } else if (filter === 'draft') {
      filtered = filtered.filter(sermon => sermon.status === 'draft');
    } else if (filter === 'archived') {
      filtered = filtered.filter(sermon => sermon.status === 'archived');
    } else if (filter === 'recent') {
      filtered = filtered.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (filter === 'popular') {
      filtered = filtered.sort((a, b) => b.views - a.views);
    }

    setFilteredSermons(filtered);
  }, [sermons, searchTerm, filter]);

  // ========== REFRESH ==========
  useEffect(() => {
    refreshAllSermons();
  }, []);

  // ========== HANDLE LIKE ==========
  const handleLike = async (sermonId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking === sermonId) return;

    setIsLiking(sermonId);
    
    try {
      const isLiked = likedSermons.has(sermonId);
      
      if (isLiked) {
        setLikedSermons(prev => {
          const newSet = new Set(prev);
          newSet.delete(sermonId);
          return newSet;
        });
        toast.success('Unliked sermon');
      } else {
        setLikedSermons(prev => new Set(prev).add(sermonId));
        toast.success('Liked sermon!');
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like sermon');
    } finally {
      setIsLiking(null);
    }
  };

  // ========== HANDLE SHARE ==========
  const handleShare = async (sermonId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/sermons/${sermonId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // ========== RENDER ==========
  if (loadingSermons && sermons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading sermons...</p>
        </div>
      </div>
    );
  }

  if (sermonError && sermons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load sermons</p>
          <p className="text-sm text-gray-400 mt-1">{sermonError}</p>
          <button
            onClick={() => refreshAllSermons()}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaSpinner className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Sermons</h1>
          <p className="mt-1 text-gray-600">Browse and study sermons from around the world</p>
          <p className="text-sm text-gray-500 mt-1">
            {sermons.length} sermons available
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
          <FaPlus />
          <span>Share Sermon</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search sermons by title, topic or author..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Sermons</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
          <button className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <FaFilter className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Sermons Grid */}
      {filteredSermons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.map((sermon) => {
            const isLiked = likedSermons.has(sermon.id);
            const isLikingThis = isLiking === sermon.id;
            
            return (
              <div key={sermon.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-cyan-500 hover:scale-[1.02]">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      sermon.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : sermon.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {sermon.status || 'Draft'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <FaEye className="mr-1" />
                      {sermon.views || 0}
                    </span>
                  </div>

                  <Link to={`/sermons/${sermon.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-cyan-600 transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>
                  </Link>

                  {sermon.topic && (
                    <span className="inline-block mt-1 text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                      {sermon.topic}
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-600 flex items-center">
                      <FaUser className="mr-1 text-gray-400" />
                      {sermon.author_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <FaCalendar className="mr-1 text-gray-400" />
                      {sermon.created_at ? new Date(sermon.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  {sermon.content && (
                    <p className="mt-3 text-gray-600 line-clamp-3 text-sm">
                      {sermon.content.substring(0, 150)}...
                    </p>
                  )}

                  {sermon.scripture && (
                    <div className="mt-2 p-2 bg-cyan-50 rounded border border-cyan-100">
                      <p className="text-xs text-cyan-700 font-serif italic">
                        {sermon.scripture}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => handleLike(sermon.id, e)}
                        disabled={isLikingThis}
                        className={`flex items-center space-x-1 transition-colors text-sm ${
                          isLiked
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-500 hover:text-red-500'
                        } ${isLikingThis ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLikingThis ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaHeart className={isLiked ? 'fill-current' : ''} />
                        )}
                        <span>{sermon.likes + (isLiked ? 1 : 0)}</span>
                      </button>

                      <Link
                        to={`/sermons/${sermon.id}#comments`}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors text-sm"
                      >
                        <FaComment />
                        <span>{sermon.questions_count || 0}</span>
                      </Link>

                      <button
                        onClick={(e) => handleShare(sermon.id, e)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors text-sm"
                      >
                        <FaShare />
                        <span>{sermon.shares || 0}</span>
                      </button>
                    </div>
                    <Link
                      to={`/sermons/${sermon.id}`}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center"
                    >
                      Read More
                      <FaArrowRight className="ml-1 text-xs" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBook className="text-4xl text-cyan-400" />
          </div>
          <p className="text-gray-500 font-medium">No sermons found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? 'Try adjusting your search or filter' : 'No sermons available yet'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {filteredSermons.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 bg-white rounded-xl shadow-md px-6 py-3">
          <span>Showing {filteredSermons.length} of {sermons.length} sermons</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Published: {sermons.filter(s => s.status === 'published').length}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
              Drafts: {sermons.filter(s => s.status === 'draft').length}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
              Archived: {sermons.filter(s => s.status === 'archived').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sermons;
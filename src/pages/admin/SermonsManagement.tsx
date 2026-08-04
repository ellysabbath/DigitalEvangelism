// src/pages/admin/SermonsManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaBook, 
  FaClock, 
  FaUsers, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaPencilAlt, 
  FaArchive, 
  FaSpinner, 
  FaFilter, 
  FaSync,
  FaComments,
  FaChartBar,
  FaUserTie,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../auth/context/AdminContext';
import type { Sermon } from '../../types/data';
import toast from 'react-hot-toast';

const SermonsManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // ========== USE ADMIN CONTEXT ==========
  let adminContext;
  try {
    adminContext = useAdmin();
  } catch (error) {
    console.error('AdminContext error:', error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Context Error</p>
          <p className="text-sm text-gray-400 mt-1">AdminContext is not available. Please check your app setup.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const { 
    sermons, 
    sermonStats, 
    loadingSermons, 
    sermonError,
    refreshAllSermons, 
    deleteSermon,
    publishSermon,
    filterSermons,
    getSermonStatsSummary,
    getSermonStatusBadge
  } = adminContext;

  // ========== LOCAL STATE ==========
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [selectedSermons, setSelectedSermons] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    console.log('SermonsManagement: Component mounted');
    if (refreshAllSermons) {
      console.log('SermonsManagement: Calling refreshAllSermons');
      refreshAllSermons().catch((err: any) => {
        console.error('SermonsManagement: Error in refreshAllSermons:', err);
        setLocalError(err?.message || 'Failed to load sermons');
      });
    } else {
      console.error('SermonsManagement: refreshAllSermons is undefined');
      setLocalError('AdminContext functions are not available');
    }
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log('SermonsManagement: State updated:', {
      sermonsCount: sermons?.length || 0,
      loadingSermons,
      sermonError,
      localError
    });
  }, [sermons, loadingSermons, sermonError, localError]);

  // ========== FILTERED SERMONS ==========
  const filteredSermons = filterSermons ? filterSermons(searchQuery, filterStatus, filterTopic) : [];
  const statsSummary = getSermonStatsSummary ? getSermonStatsSummary() : {
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    totalViews: 0,
    totalQuestions: 0
  };

  // Get unique topics for filter
  const uniqueTopics = ['all', ...new Set((sermons || []).map(s => s.topic).filter(Boolean))];

  // ========== HANDLERS ==========
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sermon?')) return;
    
    setIsDeleting(true);
    try {
      await deleteSermon(id);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async (id: number) => {
    if (!window.confirm('Are you sure you want to publish this sermon?')) return;
    
    setIsPublishing(true);
    try {
      await publishSermon(id);
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSermons.length === 0) {
      toast.error('Please select at least one sermon');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedSermons.length} sermon(s)?`)) return;
    
    setIsBulkDeleting(true);
    try {
      for (const id of selectedSermons) {
        await deleteSermon(id);
      }
      setSelectedSermons([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSermons(filteredSermons.map((s: Sermon) => s.id));
    } else {
      setSelectedSermons([]);
    }
  };

  const handleSelectSermon = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedSermons(prev => [...prev, id]);
    } else {
      setSelectedSermons(prev => prev.filter(sid => sid !== id));
    }
  };

  const handleRefresh = () => {
    setLocalError(null);
    if (refreshAllSermons) {
      refreshAllSermons()
        .then(() => toast.success('Refreshed!'))
        .catch((err: any) => {
          console.error('Refresh error:', err);
          setLocalError(err?.message || 'Failed to refresh');
        });
    }
  };

  // ========== CHECK FOR ERRORS FIRST ==========
  // Check for context error
  if (!adminContext || !refreshAllSermons) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Admin Context Error</p>
          <p className="text-sm text-gray-400 mt-1">The admin context is not properly initialized.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Check for local error
  if (localError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Error Loading Sermons</p>
          <p className="text-sm text-gray-400 mt-1">{localError}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaSync className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ========== LOADING STATE ==========
  if (loadingSermons && (!sermons || sermons.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading sermons...</p>
        </div>
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (sermonError && (!sermons || sermons.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load sermons</p>
          <p className="text-sm text-gray-400 mt-1">{sermonError}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaSync className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sermons Management</h2>
            <p className="text-sm text-gray-600">Manage all sermons and their questions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaSync className={loadingSermons ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/sermons/create"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>Create Sermon</span>
          </Link>
        </div>
      </div>

      {/* ===== STATS SUMMARY ===== */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-cyan-500">
          <p className="text-2xl font-bold text-gray-900">{statsSummary.total}</p>
          <p className="text-xs text-gray-500">Total Sermons</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{statsSummary.published}</p>
          <p className="text-xs text-gray-500">Published</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{statsSummary.draft}</p>
          <p className="text-xs text-gray-500">Drafts</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-gray-500">
          <p className="text-2xl font-bold text-gray-600">{statsSummary.archived}</p>
          <p className="text-xs text-gray-500">Archived</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-purple-600">{statsSummary.totalViews.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Views</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-indigo-500">
          <p className="text-2xl font-bold text-indigo-600">{statsSummary.totalQuestions}</p>
          <p className="text-xs text-gray-500">Total Questions</p>
        </div>
      </div>

      {/* ===== SEARCH AND FILTERS ===== */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sermons by title, topic, author or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                showFilters ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            {selectedSermons.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isBulkDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                <span>Delete ({selectedSermons.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  {uniqueTopics.map(topic => (
                    <option key={topic} value={topic}>
                      {topic === 'all' ? 'All Topics' : topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterTopic('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== SERMONS GRID ===== */}
      {filteredSermons && filteredSermons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSermons.map((sermon: Sermon) => {
            const status = getSermonStatusBadge ? getSermonStatusBadge(sermon) : { 
              label: 'Unknown', 
              className: 'bg-gray-100 text-gray-700', 
              icon: null 
            };
            return (
              <div key={sermon.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <FaBook className="text-cyan-500" />
                      <h4 className="text-lg font-semibold text-gray-900">{sermon.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Topic: <span className="font-medium text-gray-800">{sermon.topic}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                      <span className="flex items-center text-gray-600">
                        <FaComments className="mr-1 text-cyan-500" />
                        {sermon.questions_count || sermon.questions?.length || 0} questions
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center text-gray-600">
                        <FaUsers className="mr-1 text-cyan-500" />
                        {sermon.views || 0} views
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center text-gray-600">
                        <FaUserTie className="mr-1 text-cyan-500" />
                        {sermon.author_name || 'Unknown'}
                      </span>
                    </div>
                    {sermon.scripture && (
                      <p className="text-xs text-gray-400 mt-1">
                        Scripture: {sermon.scripture}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center ${status.className}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Created: {sermon.created_at ? new Date(sermon.created_at).toLocaleDateString() : 'N/A'}
                    {sermon.published_at && ` | Published: ${new Date(sermon.published_at).toLocaleDateString()}`}
                  </span>
                  <div className="flex items-center space-x-1">
                    {sermon.status === 'draft' && (
                      <button 
                        onClick={() => handlePublish(sermon.id)} 
                        disabled={isPublishing}
                        className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                      >
                        {isPublishing ? <FaSpinner className="animate-spin mr-1" /> : <FaCheckCircle className="mr-1" />}
                        Publish
                      </button>
                    )}
                    <Link 
                      to={`/admin/sermons/${sermon.id}`} 
                      className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                      title="View Sermon"
                    >
                      <FaEye />
                    </Link>
                    <Link 
                      to={`/admin/sermons/edit/${sermon.id}`} 
                      className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                      title="Edit Sermon"
                    >
                      <FaEdit />
                    </Link>
                    <button 
                      onClick={() => handleDelete(sermon.id)} 
                      disabled={isDeleting}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                      title="Delete Sermon"
                    >
                      <FaTrash />
                    </button>
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
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
          <Link 
            to="/admin/sermons/create" 
            className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
          >
            <FaPlus className="mr-2" />
            Create your first sermon
          </Link>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      {sermons && sermons.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 bg-white rounded-xl shadow-md px-6 py-3">
          <span>Showing {filteredSermons.length} of {sermons.length} sermons</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Published: {statsSummary.published}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
              Drafts: {statsSummary.draft}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
              Archived: {statsSummary.archived}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
              Views: {statsSummary.totalViews}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SermonsManagement;
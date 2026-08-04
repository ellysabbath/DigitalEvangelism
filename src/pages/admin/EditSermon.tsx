// src/pages/admin/EditSermon.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft, FaSpinner, FaSave, FaQuestion, FaPlus, FaTrash, 
  FaClock, FaUsers, FaBook, FaBible, FaTimesCircle,
  FaCheckCircle, FaEdit, FaCopy, FaStar, FaRegStar
} from 'react-icons/fa';
import { useAdmin } from '../../auth/context/AdminContext';
import { sermonsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FaRadio } from 'react-icons/fa6';

interface Question {
  id: string;
  text: string;
  type: 'short_answer' | 'long_answer' | 'checkbox' | 'radio' | 'true_false';
  options?: string[];
  correctAnswer?: string | string[];
  required: boolean;
  maxScore: number; // Added grade/score field
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

const EditSermon: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { refreshAllSermons } = useAdmin();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sermonData, setSermonData] = useState<SermonData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    content: '',
    scripture: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
  });
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: '1', 
      text: '', 
      type: 'short_answer' as const, 
      options: [], 
      required: true,
      maxScore: 10 // Default max score
    }
  ]);

  // ========== FETCH SERMON ==========
  useEffect(() => {
    const fetchSermon = async () => {
      if (!id) {
        setError('Sermon ID not provided');
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      setError(null);
      
      try {
        const response = await sermonsAPI.get(parseInt(id));
        const data = response.data;
        setSermonData(data);
        
        setFormData({
          title: data.title || '',
          topic: data.topic || '',
          content: data.content || '',
          scripture: data.scripture || '',
          status: data.status || 'draft',
        });
        
        if (data.questions && data.questions.length > 0) {
          const formattedQuestions = data.questions.map((q: any, index: number) => ({
            id: String(index + 1),
            text: q.text || '',
            type: q.type || 'short_answer',
            options: q.options || [],
            correctAnswer: q.correctAnswer || null,
            required: q.required !== undefined ? q.required : true,
            maxScore: q.maxScore || 10, // Load maxScore from API
          }));
          setQuestions(formattedQuestions);
        } else {
          setQuestions([
            { 
              id: '1', 
              text: '', 
              type: 'short_answer', 
              options: [], 
              required: true,
              maxScore: 10
            }
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching sermon:', err);
        setError(err.response?.data?.error || 'Failed to load sermon');
        toast.error('Failed to load sermon');
      } finally {
        setIsFetching(false);
      }
    };

    fetchSermon();
  }, [id]);

  // ========== HANDLERS ==========
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === id) {
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || [])];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          return { ...q, options: [...(q.options || []), ''] };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const newOptions = (q.options || []).filter((_, i) => i !== optionIndex);
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const addQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([
      ...questions,
      { 
        id: newId, 
        text: '', 
        type: 'short_answer', 
        options: [], 
        required: true,
        maxScore: 10
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
      const newId = (questions.length + 1).toString();
      setQuestions([
        ...questions,
        { ...questionToDuplicate, id: newId, text: questionToDuplicate.text + ' (Copy)' }
      ]);
      toast.success('Question duplicated!');
    }
  };

  const handleTrueFalseChange = (questionId: string, value: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          return { ...q, correctAnswer: value };
        }
        return q;
      })
    );
  };

  // ========== SUBMIT ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validQuestions = questions.filter(q => q.text.trim().length > 0);
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    for (const q of validQuestions) {
      if (q.maxScore <= 0) {
        toast.error(`Question "${q.text}" must have a positive max score`);
        return;
      }
      
      if ((q.type === 'checkbox' || q.type === 'radio')) {
        const validOptions = (q.options || []).filter(opt => opt.trim().length > 0);
        if (validOptions.length < 2) {
          toast.error(`Question "${q.text}" needs at least 2 options`);
          return;
        }
      }
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a sermon title');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter sermon content');
      return;
    }

    if (!formData.topic.trim()) {
      toast.error('Please enter a sermon topic');
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData = {
        title: formData.title.trim(),
        topic: formData.topic.trim(),
        content: formData.content.trim(),
        scripture: formData.scripture.trim(),
        status: formData.status,
        questions: validQuestions.map(q => ({
          text: q.text.trim(),
          type: q.type,
          options: (q.options || []).filter(opt => opt.trim().length > 0),
          correctAnswer: q.correctAnswer || null,
          required: q.required,
          maxScore: q.maxScore // Include maxScore in the update
        }))
      };

      console.log('Updating sermon with grades:', updateData);
      
      const response = await sermonsAPI.update(parseInt(id!), updateData);
      console.log('Sermon updated:', response.data);
      
      toast.success('Sermon updated successfully with grade settings!');
      
      if (refreshAllSermons) {
        await refreshAllSermons();
      }
      
      navigate('/admin/sermons');
    } catch (error: any) {
      console.error('Error updating sermon:', error);
      const message = error.response?.data?.error || error.message || 'Failed to update sermon. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total max score
  const totalMaxScore = questions.reduce((sum, q) => sum + (q.maxScore || 0), 0);

  // ========== HELPERS ==========
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

  const getQuestionTypeIcon = (type: string) => {
    switch(type) {
      case 'short_answer':
        return <FaEdit className="text-blue-500" />;
      case 'long_answer':
        return <FaEdit className="text-purple-500" />;
      case 'checkbox':
        return <FaCheckCircle className="text-green-500" />;
      case 'radio':
        return <FaRadio className="text-orange-500" />;
      case 'true_false':
        return <FaBible className="text-red-500" />;
      default:
        return <FaQuestion className="text-gray-500" />;
    }
  };

  // ========== RENDER ==========
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading sermon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load sermon</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/sermons')}
          className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
          title="Back to Sermons"
        >
          <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Sermon</h1>
          <p className="text-sm text-gray-600">Update sermon details and questions with grading</p>
        </div>
      </div>

      {/* Sermon Info Card */}
      <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-cyan-500">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center text-gray-600">
            <FaBook className="mr-2 text-cyan-500" />
            <strong className="text-gray-900">ID:</strong> #{id}
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center text-gray-600">
            <FaClock className="mr-2 text-cyan-500" />
            Created: {sermonData?.created_at ? new Date(sermonData.created_at).toLocaleDateString() : 'N/A'}
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center text-gray-600">
            <FaUsers className="mr-2 text-cyan-500" />
            {sermonData?.views || 0} views
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center text-gray-600">
            <FaCheckCircle className="mr-2 text-green-500" />
            Status: <span className="ml-1 capitalize">{sermonData?.status || 'Draft'}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center text-gray-600">
            <FaStar className="mr-2 text-purple-500" />
            Total Points: <span className="ml-1 font-bold text-purple-600">{totalMaxScore}</span>
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Sermon Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                required
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="scripture" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Scripture
              </label>
              <input
                type="text"
                id="scripture"
                name="scripture"
                value={formData.scripture}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                placeholder="e.g., Hebrews 11:1"
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                disabled={isLoading}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Sermon Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={8}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Write the full sermon content here..."
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Questions & Grading <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {questions.filter(q => q.text.trim().length > 0).length} questions | Total: {totalMaxScore} pts
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Add questions with max scores for grading</p>
            
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-green-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                      {getQuestionTypeIcon(question.type)}
                      <span className="text-xs text-gray-400">({getQuestionTypeLabel(question.type)})</span>
                      {question.required && (
                        <span className="text-xs text-red-500">*Required</span>
                      )}
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Max: {question.maxScore} pts
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => duplicateQuestion(question.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Duplicate question"
                      >
                        <FaCopy className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={questions.length === 1}
                        title="Remove question"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm"
                      placeholder="Enter question text..."
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <select
                        value={question.type}
                        onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm"
                        disabled={isLoading}
                      >
                        <option value="short_answer">Short Answer</option>
                        <option value="long_answer">Long Answer</option>
                        <option value="checkbox">Multiple Choice (Checkbox)</option>
                        <option value="radio">Single Choice (Radio)</option>
                        <option value="true_false">True / False</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max Score</label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={question.maxScore}
                        onChange={(e) => handleQuestionChange(question.id, 'maxScore', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => handleQuestionChange(question.id, 'required', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        disabled={isLoading}
                      />
                      <label className="text-sm text-gray-600">Required question</label>
                    </div>
                  </div>

                  {/* Options for checkbox and radio */}
                  {(question.type === 'checkbox' || question.type === 'radio') && (
                    <div className="mt-3 pl-4 border-l-2 border-green-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Options:</p>
                      <div className="space-y-2">
                        {(question.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <span className="text-gray-400 text-xs">{String.fromCharCode(65 + optIndex)}.</span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm"
                              placeholder={`Option ${optIndex + 1}`}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(question.id, optIndex)}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              disabled={isLoading || (question.options || []).length <= 1}
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addOption(question.id)}
                        className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium flex items-center"
                        disabled={isLoading}
                      >
                        <FaPlus className="mr-1" /> Add Option
                      </button>
                    </div>
                  )}

                  {/* True/False options */}
                  {question.type === 'true_false' && (
                    <div className="mt-3 pl-4 border-l-2 border-green-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Select Correct Answer:</p>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`true_false_${question.id}`}
                            value="true"
                            onChange={(e) => handleTrueFalseChange(question.id, e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-gray-700">True</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`true_false_${question.id}`}
                            value="false"
                            onChange={(e) => handleTrueFalseChange(question.id, e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-gray-700">False</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addQuestion}
              className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium flex items-center bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
              disabled={isLoading}
            >
              <FaPlus className="mr-2" />
              Add Question
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 ${
                isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-3" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="mr-3" />
                  Update Sermon
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/sermons')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSermon;
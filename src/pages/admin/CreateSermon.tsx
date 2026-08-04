// src/pages/admin/CreateSermon.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaSpinner, FaPlus, 
  FaQuestion, FaSave, FaTrash, 
  FaCheckCircle, FaEdit, FaCopy,
  FaBook, FaBible
} from 'react-icons/fa';
// FIXED: Correct import path
import { useAdmin } from '../../auth/context/AdminContext';
// FIXED: Import sermonsAPI
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
}

const CreateSermon: React.FC = () => {
  const navigate = useNavigate();
  const { refreshAllSermons } = useAdmin();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    content: '',
    scripture: '',
    status: 'draft' as 'draft' | 'published',
  });
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: '1', 
      text: '', 
      type: 'short_answer' as const, 
      options: [], 
      required: true 
    }
  ]);

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
        required: true 
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
    
    // Validation
    const validQuestions = questions.filter(q => q.text.trim().length > 0);
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Validate options for checkbox and radio
    for (const q of validQuestions) {
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
      // Prepare data for API
      const sermonData = {
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
          required: q.required
        }))
      };

      console.log('Creating sermon:', sermonData);
      
      // FIXED: Use sermonsAPI instead of fetch
      const response = await sermonsAPI.create(sermonData);
      console.log('Sermon created:', response.data);
      
      toast.success('Sermon created successfully!');
      
      // Refresh the sermons list
      if (refreshAllSermons) {
        await refreshAllSermons();
      }
      
      navigate('/admin/sermons');
    } catch (error: any) {
      console.error('Error creating sermon:', error);
      const message = error.response?.data?.error || error.message || 'Failed to create sermon. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Create New Sermon</h1>
          <p className="text-sm text-gray-600">Add a new sermon with different question types</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-cyan-500">
          <div className="flex items-center space-x-2">
            <FaBook className="text-cyan-500" />
            <span className="text-sm font-medium text-gray-700">Sermon Details</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Title, topic, and content</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center space-x-2">
            <FaBible className="text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Bible Verses</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Key scriptures for the sermon</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center space-x-2">
            <FaQuestion className="text-green-500" />
            <span className="text-sm font-medium text-gray-700">Questions</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Multiple question types available</p>
        </div>
      </div>

      {/* Form - Rest of the form remains the same */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaBook className="mr-2 text-cyan-500" />
              Sermon Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  placeholder="Enter sermon title"
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
                  placeholder="e.g., Faith, Prayer, Love"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mt-4">
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

            <div className="mt-4">
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

            <div className="mt-4">
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
              </select>
            </div>
          </div>

          {/* Questions Section - Rest remains the same */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaQuestion className="mr-2 text-green-500" />
                Questions <span className="text-red-500">*</span>
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {questions.filter(q => q.text.trim().length > 0).length} questions
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Add questions with different types for students to answer after the sermon
            </p>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                      {getQuestionTypeIcon(question.type)}
                      <span className="text-xs text-gray-400">({getQuestionTypeLabel(question.type)})</span>
                      {question.required && (
                        <span className="text-xs text-red-500">*Required</span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => duplicateQuestion(question.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicate question"
                      >
                        <FaCopy className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={questions.length === 1}
                        title="Remove question"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm"
                      placeholder="Enter question text..."
                      disabled={isLoading}
                    />
                  </div>

                  {/* Question Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium flex items-center bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
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
                  Creating Sermon...
                </>
              ) : (
                <>
                  <FaSave className="mr-3" />
                  Create Sermon
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

export default CreateSermon;
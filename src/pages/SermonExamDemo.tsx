import React, { useState, useEffect } from 'react';
import { 
  FaBible, 
  FaCheckCircle, 
  FaSpinner, 
  FaEdit, 
  FaList, 
  FaQuestion,
  FaCheck,
  FaExclamationTriangle,
  FaArrowLeft,
  FaBook,
  FaUser,
  FaCalendar,
  FaClock,
  FaHeart,
  FaShare,
  FaEye
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================
interface SermonQuestion {
  id: string | number;
  text: string;
  type: 'short_answer' | 'long_answer' | 'checkbox' | 'radio' | 'true_false';
  options?: string[];
  required?: boolean;
  maxScore?: number;
}

interface SermonData {
  id: number;
  title: string;
  topic: string;
  content: string;
  scripture: string;
  author: string;
  questions: SermonQuestion[];
  views: number;
  likes: number;
  shares: number;
  created_at: string;
}

// ============================================
// SAMPLE DATA
// ============================================
const sampleSermon: SermonData = {
  id: 1,
  title: "The Power of Faith",
  topic: "Faith",
  content: "Faith is the substance of things hoped for, the evidence of things not seen. Without faith it is impossible to please God...",
  scripture: "Hebrews 11:1-6",
  author: "Pastor John",
  views: 1245,
  likes: 89,
  shares: 34,
  created_at: "2024-01-15T10:00:00Z",
  questions: [
    {
      id: "q1",
      text: "What is the definition of faith according to Hebrews 11:1?",
      type: "short_answer",
      required: true,
      maxScore: 10
    },
    {
      id: "q2",
      text: "Explain why faith is important in the Christian life. Provide at least 3 reasons with scripture references.",
      type: "long_answer",
      required: true,
      maxScore: 20
    },
    {
      id: "q3",
      text: "Which of the following are examples of faith in the Bible?",
      type: "checkbox",
      options: ["Abraham offering Isaac", "Moses parting the Red Sea", "David fighting Goliath", "Peter walking on water"],
      required: true,
      maxScore: 10
    },
    {
      id: "q4",
      text: "What is the relationship between faith and works?",
      type: "radio",
      options: ["Faith without works is dead", "Works without faith is enough", "Faith and works are separate", "Only faith matters"],
      required: true,
      maxScore: 5
    },
    {
      id: "q5",
      text: "Faith comes by hearing, and hearing by the word of God. (True/False)",
      type: "true_false",
      required: true,
      maxScore: 5
    }
  ]
};

// ============================================
// INDIVIDUAL QUESTION ANSWER COMPONENT
// ============================================
interface QuestionAnswerItemProps {
  question: SermonQuestion;
  index: number;
  onChange: (questionId: string | number, value: string | string[]) => void;
  disabled: boolean;
}

const QuestionAnswerItem: React.FC<QuestionAnswerItemProps> = ({
  question,
  index,
  onChange,
  disabled
}) => {
  // LOCAL STATE - Each question has its own isolated state
  const [localValue, setLocalValue] = useState<string | string[]>(
    question.type === 'checkbox' ? [] : ''
  );

  // Track if this question has been answered
  const [isAnswered, setIsAnswered] = useState(false);

  const getQuestionTypeIcon = (type: string) => {
    switch(type) {
      case 'short_answer':
        return <FaEdit className="text-blue-500" />;
      case 'long_answer':
        return <FaEdit className="text-purple-500" />;
      case 'checkbox':
        return <FaList className="text-green-500" />;
      case 'radio':
        return <FaList className="text-orange-500" />;
      case 'true_false':
        return <FaCheck className="text-red-500" />;
      default:
        return <FaQuestion className="text-gray-500" />;
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

  // Get the current display value
  const getCurrentValue = (): string => {
    if (Array.isArray(localValue)) {
      return localValue.join(', ');
    }
    return localValue || '';
  };

  // Check if question is answered
  const checkIfAnswered = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value && value.trim().length > 0;
  };

  // Handle short answer change - ONLY updates this question
  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsAnswered(checkIfAnswered(newValue));
    onChange(question.id, newValue);
  };

  // Handle long answer change - ONLY updates this question
  const handleLongAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsAnswered(checkIfAnswered(newValue));
    onChange(question.id, newValue);
  };

  // Handle checkbox change - ONLY updates this question
  const handleCheckboxChange = (option: string, checked: boolean) => {
    const current = (localValue as string[]) || [];
    let newValue: string[];
    if (checked) {
      newValue = [...current, option];
    } else {
      newValue = current.filter((v) => v !== option);
    }
    setLocalValue(newValue);
    setIsAnswered(checkIfAnswered(newValue));
    onChange(question.id, newValue);
  };

  // Handle radio change - ONLY updates this question
  const handleRadioChange = (option: string) => {
    setLocalValue(option);
    setIsAnswered(true);
    onChange(question.id, option);
  };

  // Handle true/false change - ONLY updates this question
  const handleTrueFalseChange = (val: string) => {
    setLocalValue(val);
    setIsAnswered(true);
    onChange(question.id, val);
  };

  // Check if checkbox is checked
  const isCheckboxChecked = (option: string): boolean => {
    return (localValue as string[] || []).includes(option);
  };

  // Check if radio is selected
  const isRadioSelected = (option: string): boolean => {
    return localValue === option;
  };

  // Check if option is selected for this question
  const isOptionSelected = (option: string): boolean => {
    if (Array.isArray(localValue)) {
      return localValue.includes(option);
    }
    return localValue === option;
  };

  return (
    <div className={`p-4 border rounded-lg transition-all duration-300 ${
      isAnswered 
        ? 'border-green-400 bg-green-50' 
        : question.required 
          ? 'border-red-200 hover:border-red-400' 
          : 'border-gray-200 hover:border-cyan-200'
    }`}>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
          {getQuestionTypeIcon(question.type)}
          <span className="text-xs text-gray-400">({getQuestionTypeLabel(question.type)})</span>
          {question.required && (
            <span className="text-xs text-red-500 font-medium">*Required</span>
          )}
          {question.maxScore && (
            <span className="text-xs text-gray-400">Max: {question.maxScore} pts</span>
          )}
        </div>
        {isAnswered && (
          <span className="text-xs text-green-600 font-medium flex items-center">
            <FaCheckCircle className="mr-1" /> Answered
          </span>
        )}
      </div>
      <p className="font-medium text-gray-900">{question.text}</p>
      
      {/* Short Answer */}
      {question.type === 'short_answer' && (
        <input
          type="text"
          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Type your answer..."
          value={getCurrentValue()}
          onChange={handleShortAnswerChange}
          disabled={disabled}
        />
      )}
      
      {/* Long Answer */}
      {question.type === 'long_answer' && (
        <textarea
          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          rows={3}
          placeholder="Write your answer..."
          value={getCurrentValue()}
          onChange={handleLongAnswerChange}
          disabled={disabled}
        />
      )}
      
      {/* Checkbox */}
      {question.type === 'checkbox' && question.options && (
        <div className="mt-2 space-y-2">
          {question.options.map((option: string, optIndex: number) => (
            <label key={optIndex} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input 
                type="checkbox" 
                value={option}
                checked={isCheckboxChecked(option)}
                onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                disabled={disabled}
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
      
      {/* Radio */}
      {question.type === 'radio' && question.options && (
        <div className="mt-2 space-y-2">
          {question.options.map((option: string, optIndex: number) => (
            <label key={optIndex} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input 
                type="radio" 
                name={`question_${question.id}`}
                value={option}
                checked={isRadioSelected(option)}
                onChange={() => handleRadioChange(option)}
                className="rounded-full border-gray-300 text-cyan-600 focus:ring-cyan-500"
                disabled={disabled}
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
      
      {/* True/False */}
      {question.type === 'true_false' && (
        <div className="mt-2 flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input 
              type="radio" 
              name={`true_false_${question.id}`} 
              value="true"
              checked={localValue === 'true'}
              onChange={() => handleTrueFalseChange('true')}
              className="text-cyan-600 focus:ring-cyan-500"
              disabled={disabled}
            />
            <span className="text-sm text-gray-700">True</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input 
              type="radio" 
              name={`true_false_${question.id}`} 
              value="false"
              checked={localValue === 'false'}
              onChange={() => handleTrueFalseChange('false')}
              className="text-cyan-600 focus:ring-cyan-500"
              disabled={disabled}
            />
            <span className="text-sm text-gray-700">False</span>
          </label>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN DEMO COMPONENT
// ============================================
const SermonExamDemo: React.FC = () => {
  const [sermon] = useState<SermonData>(sampleSermon);
  const [examAnswers, setExamAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showExam, setShowExam] = useState(true);
  const [answersSummary, setAnswersSummary] = useState<Record<string, string | string[]>>({});

  // Handle answer change for a specific question
  const handleAnswerChange = (questionId: string | number, value: string | string[]) => {
    const key = String(questionId);
    console.log(`📝 Question ${key} updated to:`, value);
    
    setExamAnswers(prev => {
      const newState = {
        ...prev,
        [key]: value
      };
      console.log('📊 All answers:', newState);
      return newState;
    });
  };

  // Handle submit exam
  const handleSubmitExam = () => {
    const questions = sermon.questions;
    const allAnswered = questions.every(q => {
      const key = String(q.id);
      const answer = examAnswers[key];
      if (q.required) {
        if (Array.isArray(answer)) {
          return answer.length > 0;
        }
        return answer && answer.trim().length > 0;
      }
      return true;
    });

    if (!allAnswered) {
      toast.error('Please answer all required questions before submitting');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnswersSummary({ ...examAnswers });
      setExamSubmitted(true);
      setShowExam(false);
      setIsSubmitting(false);
      toast.success('✅ Exam submitted successfully!');
    }, 1500);
  };

  // Reset exam
  const resetExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
    setShowExam(true);
    setAnswersSummary({});
    toast.info('Exam reset');
  };

  // Get question count
  const getAnsweredCount = () => {
    const questions = sermon.questions;
    let answered = 0;
    questions.forEach(q => {
      const key = String(q.id);
      const answer = examAnswers[key];
      if (Array.isArray(answer)) {
        if (answer.length > 0) answered++;
      } else if (answer && answer.trim().length > 0) {
        answered++;
      }
    });
    return answered;
  };

  const totalQuestions = sermon.questions.length;
  const answeredCount = getAnsweredCount();
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sermon Exam Demo</h1>
              <p className="text-sm text-gray-500">No backend connection - Local state only</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              {answeredCount}/{totalQuestions} answered
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-600 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sermon Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-medium text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded">
                  {sermon.topic}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">{sermon.title}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FaUser className="text-cyan-600" />
                  <span>{sermon.author}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FaCalendar className="text-cyan-600" />
                  <span>{formatDate(sermon.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FaEye className="text-cyan-600" />
                  <span>{sermon.views} views</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FaHeart className="text-cyan-600" />
                  <span>{sermon.likes} likes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FaShare className="text-cyan-600" />
                  <span>{sermon.shares} shares</span>
                </div>
              </div>
            </div>
            {examSubmitted ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                <FaCheckCircle className="mr-1" /> Submitted
              </span>
            ) : (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center">
                <FaClock className="mr-1" /> Pending
              </span>
            )}
          </div>

          {/* Scripture */}
          {sermon.scripture && (
            <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-sm font-semibold text-cyan-700">Key Scripture</p>
              <p className="text-sm text-cyan-600 font-serif italic mt-1">"{sermon.scripture}"</p>
            </div>
          )}

          {/* Content */}
          <div className="mt-4 prose prose-lg max-w-none">
            <p className="text-gray-700">{sermon.content}</p>
          </div>
        </div>

        {/* Exam Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaBible className="mr-2 text-cyan-500" />
                Sermon Exam
              </h3>
              <p className="text-sm text-gray-600">
                {examSubmitted 
                  ? 'You have already submitted this exam' 
                  : 'Test your understanding of this sermon (each question is isolated)'
                }
              </p>
            </div>
            <div className="flex space-x-2">
              {!examSubmitted ? (
                <button
                  onClick={() => setShowExam(!showExam)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {showExam ? 'Hide Exam' : 'Take Exam'}
                </button>
              ) : (
                <button
                  onClick={resetExam}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Reset Exam
                </button>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {!examSubmitted && showExam && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-cyan-600">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {answeredCount} of {totalQuestions} questions answered
                {answeredCount === totalQuestions && totalQuestions > 0 && (
                  <span className="text-green-600 font-medium ml-2">
                    🎉 All questions answered!
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Exam Content */}
          {showExam && !examSubmitted && (
            <div className="mt-4 space-y-6">
              {sermon.questions.map((q: SermonQuestion, index: number) => {
                return (
                  <QuestionAnswerItem
                    key={String(q.id)}
                    question={q}
                    index={index}
                    onChange={handleAnswerChange}
                    disabled={isSubmitting}
                  />
                );
              })}
              
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button 
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="flex-1 flex justify-center items-center py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Exam'
                  )}
                </button>
                <button
                  onClick={() => {
                    setExamAnswers({});
                    toast.info('All answers cleared');
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Submitted Status */}
          {examSubmitted && (
            <div className="mt-4 p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <FaCheckCircle className="text-3xl text-green-500 mr-3" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Exam Submitted!</h4>
                  <p className="text-sm text-gray-600">
                    Your answers have been submitted for review.
                  </p>
                </div>
              </div>

              {/* Answers Summary */}
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Your Answers:</h5>
                <div className="space-y-3">
                  {sermon.questions.map((q, index) => {
                    const key = String(q.id);
                    const answer = answersSummary[key];
                    const displayAnswer = Array.isArray(answer) 
                      ? answer.join(', ') 
                      : answer || 'Not answered';
                    
                    return (
                      <div key={key} className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                          <span className="text-xs text-gray-400">{q.type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{q.text}</p>
                        <p className="text-sm text-cyan-600 mt-1">
                          <span className="text-gray-500">Answer:</span> {displayAnswer}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Info Footer */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-600">
          <p className="font-semibold">🎯 Demo Features:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Each question has its own isolated state</li>
            <li>Typing in one input only affects that specific question</li>
            <li>No backend connection - all data is local</li>
            <li>Progress tracking for answered questions</li>
            <li>Validation for required questions</li>
            <li>Answers summary after submission</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SermonExamDemo;
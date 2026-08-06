// src/pages/admin/StudentsManagement.tsx (complete fixed version)
import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaUserGraduate, 
  FaEnvelope, 
  FaPhone, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaFilter, 
  FaSync,
  FaTimes,
  FaSave,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../auth/context/AdminContext';
import { studentsAPI, groupsAPI } from '../../services/api';
import type { Student, Group } from '../../types/data';
import toast from 'react-hot-toast';

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
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch(type) {
      case 'danger':
        return {
          icon: <FaExclamationTriangle className="text-red-600 text-4xl" />,
          button: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="text-yellow-600 text-4xl" />,
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          border: 'border-yellow-200'
        };
      case 'success':
        return {
          icon: <FaCheckCircle className="text-green-600 text-4xl" />,
          button: 'bg-green-600 hover:bg-green-700 text-white',
          border: 'border-green-200'
        };
      default:
        return {
          icon: <FaExclamationTriangle className="text-blue-600 text-4xl" />,
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className={`p-6 border-b ${styles.border}`}>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {styles.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center ${styles.button}`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STUDENT MODAL (Add/Edit)
// ============================================
interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student | null;
  groups: Group[];
  users: any[];
}

const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  student,
  groups,
  users,
}) => {
  const isEdit = !!student;
  const [formData, setFormData] = useState({
    user_id: null as number | null,
    assigned_evangelist: null as number | null,
    groups: [] as number[],
    exams_completed: 0,
    certificates_earned: 0,
    total_score: 0,
    is_graduated: false,
    graduation_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        user_id: student.user?.id || null,
        assigned_evangelist: student.assigned_evangelist || null,
        groups: student.groups || [],
        exams_completed: student.exams_completed || 0,
        certificates_earned: student.certificates_earned || 0,
        total_score: student.total_score || 0,
        is_graduated: student.is_graduated || false,
        graduation_date: student.graduation_date ? student.graduation_date.split('T')[0] : '',
      });
    } else if (isOpen) {
      setFormData({
        user_id: null,
        assigned_evangelist: null,
        groups: [],
        exams_completed: 0,
        certificates_earned: 0,
        total_score: 0,
        is_graduated: false,
        graduation_date: '',
      });
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'exams_completed' || name === 'certificates_earned' || name === 'total_score' ? 
              parseFloat(value) || 0 : value,
    }));
  };

  const handleGroupToggle = (groupId: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id) {
      toast.error('Please select a user');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && student) {
        await studentsAPI.update(student.id, {
          assigned_evangelist: formData.assigned_evangelist || undefined,
          groups: formData.groups,
          exams_completed: formData.exams_completed,
          certificates_earned: formData.certificates_earned,
          total_score: formData.total_score,
          is_graduated: formData.is_graduated,
          graduation_date: formData.graduation_date || undefined,
        });
        toast.success('Student updated successfully');
      } else {
        await studentsAPI.create({
          user_id: formData.user_id,
          assigned_evangelist: formData.assigned_evangelist || undefined,
          groups: formData.groups,
        });
        toast.success('Student created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableUsers = users;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaUserGraduate className="text-green-600 text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEdit ? 'Edit Student' : 'Add New Student'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEdit ? 'Update student details' : 'Create a new student record'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                User <span className="text-red-500">*</span>
              </label>
              
              {users.length === 0 ? (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                  <p className="text-sm text-yellow-700">No users available. Please refresh the page.</p>
                </div>
              ) : (
                <select
                  name="user_id"
                  value={formData.user_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                  disabled={isEdit || isSubmitting}
                  required
                >
                  <option value="">Select a user</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.phone_number || 'Unknown'} 
                      {user.email ? ` (${user.email})` : ''}
                      {user.role ? ` - ${user.role}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">User cannot be changed after creation</p>
              )}
            </div>

            {/* Assigned Evangelist */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Assigned Evangelist
              </label>
              <select
                name="assigned_evangelist"
                value={formData.assigned_evangelist || ''}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                disabled={isSubmitting}
              >
                <option value="">None</option>
                {users.filter(u => u.role === 'evangelist' || u.role === 'admin').map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.phone_number} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Groups */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Groups
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {groups.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">No groups available</p>
                ) : (
                  groups.map(group => (
                    <label key={group.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.groups.includes(group.id)}
                        onChange={() => handleGroupToggle(group.id)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700">{group.name}</span>
                      <span className="text-xs text-gray-400">({group.type})</span>
                      <span className="text-xs text-gray-400">- {group.member_count || 0} members</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Progress Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Exams Completed
                </label>
                <input
                  type="number"
                  name="exams_completed"
                  value={formData.exams_completed}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Certificates Earned
                </label>
                <input
                  type="number"
                  name="certificates_earned"
                  value={formData.certificates_earned}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Total Score
                </label>
                <input
                  type="number"
                  name="total_score"
                  value={formData.total_score}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Graduation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="is_graduated"
                  checked={formData.is_graduated}
                  onChange={handleChange}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  disabled={isSubmitting}
                />
                <label className="text-sm font-medium text-gray-700">
                  Graduated
                </label>
              </div>
              {formData.is_graduated && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Graduation Date
                  </label>
                  <input
                    type="date"
                    name="graduation_date"
                    value={formData.graduation_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || (users.length === 0)}
              className="flex-1 flex justify-center items-center py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isEdit ? 'Update Student' : 'Create Student'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// VIEW STUDENT MODAL
// ============================================
interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  groups: Group[];
  users: any[];
}

const ViewStudentModal: React.FC<ViewStudentModalProps> = ({ isOpen, onClose, student, groups, users }) => {
  if (!isOpen || !student) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getGroupNames = (groupIds: number[]) => {
    return groupIds.map(id => {
      const group = groups.find(g => g.id === id);
      return group ? group.name : 'Unknown';
    }).join(', ') || 'None';
  };

  const getEvangelistName = (id: number | null) => {
    if (!id) return 'None';
    const user = users.find(u => u.id === id);
    return user?.full_name || 'Unknown';
  };

  const getStatus = () => {
    if (student.is_graduated) return { label: 'Graduated', className: 'bg-blue-100 text-blue-700' };
    if (student.exams_completed >= 20) return { label: 'Completed', className: 'bg-purple-100 text-purple-700' };
    if (student.exams_completed > 0) return { label: 'Active', className: 'bg-green-100 text-green-700' };
    return { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' };
  };

  const status = getStatus();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaUserGraduate className="text-green-600 text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
                <p className="text-sm text-gray-600">View complete student information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Basic Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              {student.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{student.full_name || 'Unknown'}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <FaEnvelope className="mr-1" /> {student.email || 'No email'}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <FaPhone className="mr-1" /> {student.phone || 'No phone'}
              </p>
              <p className="text-sm text-gray-500">
                ID: <span className="font-mono">{student.student_id}</span>
              </p>
              <p className="text-xs text-gray-400">Role: {student.user?.role || 'Student'}</p>
            </div>
          </div>

          {/* Status & Progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 text-center bg-gray-50 rounded-xl border border-gray-200">
              <p className={`text-xs font-medium uppercase tracking-wider ${status.className}`}>{status.label}</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">Status</p>
            </div>
            <div className="p-4 text-center bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-2xl font-bold text-cyan-600">{student.progress || 0}%</p>
              <p className="text-xs text-gray-500">Progress</p>
            </div>
            <div className="p-4 text-center bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-2xl font-bold text-green-600">{student.exams_completed || 0}</p>
              <p className="text-xs text-gray-500">Exams</p>
            </div>
            <div className="p-4 text-center bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-2xl font-bold text-yellow-600">{student.certificates_earned || 0}</p>
              <p className="text-xs text-gray-500">Certificates</p>
            </div>
          </div>

          {/* Groups & Evangelist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Groups</p>
              <p className="text-sm font-medium text-gray-900">{getGroupNames(student.groups || [])}</p>
              <p className="text-xs text-gray-500">{student.groups?.length || 0} groups</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Assigned Evangelist</p>
              <p className="text-sm font-medium text-gray-900">{getEvangelistName(student.assigned_evangelist)}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Enrollment Date</p>
              <p className="font-medium text-gray-900">{formatDate(student.enrollment_date)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Total Score</p>
              <p className="font-medium text-gray-900">{student.total_score || 0}</p>
            </div>
          </div>

          {/* Graduation Info */}
          {student.is_graduated && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Graduation</p>
              <p className="text-sm font-medium text-gray-900">
                Graduated on {formatDate(student.graduation_date)}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
            <p>Created: {formatDate(student.created_at)}</p>
            <p>Updated: {formatDate(student.updated_at)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const StudentsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { 
    students, 
    loadingStudents, 
    studentError,
    refreshAllStudents, 
    deleteStudent,
    bulkDeleteStudents,
    filterStudents,
    getStudentStatsSummary,
    getStudentStatusBadge,
    users,
    refreshUsers,
    
  } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'graduated' | 'completed'>('all');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'warning' as 'danger' | 'warning' | 'info' | 'success',
    onConfirm: () => {},
  });

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupsAPI.list();
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups();
  }, []);

  // Debug: Log users when they change
  useEffect(() => {
    console.log('📊 [StudentsManagement] Users updated:', users);
    console.log('📊 [StudentsManagement] Users count:', users.length);
  }, [users]);

  // Filtered students
  const filteredStudents = filterStudents ? filterStudents(searchQuery, filterStatus) : [];
  const statsSummary = getStudentStatsSummary ? getStudentStatsSummary() : {
    total: 0,
    active: 0,
    pending: 0,
    graduated: 0,
    averageProgress: 0
  };

  // ========== HANDLERS ==========
  const handleDelete = (id: number, name: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Student',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete Student',
      type: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteStudent(id);
          toast.success(`Student "${name}" deleted successfully`);
          refreshAllStudents();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to delete student');
        } finally {
          setIsDeleting(false);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    
    setConfirmationModal({
      isOpen: true,
      title: 'Bulk Delete Students',
      message: `Are you sure you want to delete ${selectedStudents.length} student(s)? This action cannot be undone.`,
      confirmText: `Delete ${selectedStudents.length} Students`,
      type: 'danger',
      onConfirm: async () => {
        setIsBulkDeleting(true);
        try {
          await bulkDeleteStudents(selectedStudents);
          toast.success(`${selectedStudents.length} student(s) deleted successfully`);
          setSelectedStudents([]);
          refreshAllStudents();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to delete students');
        } finally {
          setIsBulkDeleting(false);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((s: Student) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, id]);
    } else {
      setSelectedStudents(prev => prev.filter(sid => sid !== id));
    }
  };

  const handleRefresh = () => {
    refreshAllStudents();
    refreshUsers();
    toast.success('Refreshed!');
  };

  const handleOpenView = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleModalSuccess = () => {
    refreshAllStudents();
    refreshUsers();
  };

  // ========== HELPERS ==========
  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; className: string }> = {
      evangelist: { label: 'Evangelist', className: 'bg-blue-100 text-blue-700' },
      pastor: { label: 'Pastor', className: 'bg-purple-100 text-purple-700' },
      church_admin: { label: 'Church Admin', className: 'bg-indigo-100 text-indigo-700' },
      super_admin: { label: 'Super Admin', className: 'bg-red-100 text-red-700' },
      admin: { label: 'Admin', className: 'bg-cyan-100 text-cyan-700' },
      student: { label: 'Student', className: 'bg-green-100 text-green-700' },
      user: { label: 'User', className: 'bg-gray-100 text-gray-700' },
    };
    return roleMap[role] || { label: role || 'User', className: 'bg-gray-100 text-gray-700' };
  };

  // ========== RENDER ==========
  if (loadingStudents && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading students...</p>
        </div>
      </div>
    );
  }

  if (studentError && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">Failed to load students</p>
          <p className="text-sm text-gray-400 mt-1">{studentError}</p>
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

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        isLoading={isDeleting || isBulkDeleting}
      />

      {/* Add Modal */}
      <StudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
        groups={groups}
        users={users}
      />

      {/* Edit Modal */}
      <StudentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        onSuccess={handleModalSuccess}
        student={selectedStudent}
        groups={groups}
        users={users}
      />

      {/* View Modal */}
      <ViewStudentModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        groups={groups}
        users={users}
      />

      {/* Header */}
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
            <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>
            <p className="text-sm text-gray-600">Manage all students in the system</p>
            <p className="text-xs text-gray-400 mt-1">{students.length} students found</p>
            <p className="text-xs text-gray-400">Users available: {users.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FaSync className={loadingStudents ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-cyan-500">
          <p className="text-2xl font-bold text-gray-900">{statsSummary.total}</p>
          <p className="text-xs text-gray-500">Total Students</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{statsSummary.active}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{statsSummary.pending}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{statsSummary.graduated}</p>
          <p className="text-xs text-gray-500">Graduated</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-purple-600">{statsSummary.averageProgress}%</p>
          <p className="text-xs text-gray-500">Avg Progress</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, email, phone or ID..."
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
            {selectedStudents.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isBulkDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                <span>Delete ({selectedStudents.length})</span>
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
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="graduated">Graduated</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
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

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exams</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student: Student) => {
                const status = getStudentStatusBadge ? getStudentStatusBadge(student) : { 
                  label: 'Unknown', 
                  className: 'bg-gray-100 text-gray-700', 
                  icon: null 
                };
                const role = getRoleBadge(student.user?.role || 'student');
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-cyan-50 rounded-full flex-shrink-0">
                          <FaUserGraduate className="text-cyan-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaEnvelope className="mr-1 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{student.email || 'No email'}</span>
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FaPhone className="mr-1 text-gray-400 flex-shrink-0" />
                            <span>{student.phone || 'No phone'}</span>
                          </p>
                          <p className="text-xs text-gray-400">
                            Role: <span className={`px-1 py-0.5 text-xs rounded ${role.className}`}>{role.label}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-600">{student.student_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[120px]">
                          <div 
                            className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${student.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">{student.exams_completed || 0} exams</span>
                        <span className="text-xs text-gray-500">{student.certificates_earned || 0} certificates</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        {student.user?.is_online && (
                          <span className="text-xs text-green-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            Online
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => handleOpenView(student)}
                          className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                          title="View Student"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                          title="Edit Student"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.full_name || 'Unknown')}
                          disabled={isDeleting}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                          title="Delete Student"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserGraduate className="text-4xl text-cyan-400" />
            </div>
            <p className="text-gray-500 font-medium">No students found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              <FaPlus className="mr-2" />
              Add your first student
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 bg-white rounded-xl shadow-md px-6 py-3">
        <span>Showing {filteredStudents.length} of {students.length} students</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Active: {statsSummary.active}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
            Pending: {statsSummary.pending}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
            Graduated: {statsSummary.graduated}
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
            Avg Progress: {statsSummary.averageProgress}%
          </span>
        </div>
      </div>

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

export default StudentsManagement;
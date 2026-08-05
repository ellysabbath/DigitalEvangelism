// src/pages/admin/CertificateManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, 
  FaDownload, FaSpinner, FaTimes,
  FaCheckCircle, FaClock, FaExclamationCircle,
  FaFileAlt, FaUser, FaCalendarAlt, FaArrowLeft,
  FaUpload, FaSave, FaCertificate,
  FaRegCopy
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface Certificate {
  certificate_id: string;
  certificate_number: string;
  heading: string;
  logo_image: string | null;
  person_image: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  position: string;
  other_position: string | null;
  display_position: string;
  working_time: string;
  signature_person: string | null;
  leader_signature: string | null;
  issue_date: string;
  issue_date_display: string;
  additional_notes: string | null;
  certificate_pdf: string | null;
  status: 'draft' | 'issued' | 'pending' | 'archived';
  status_display: string;
  user: number | null;
  user_full_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  created_at: string;
  updated_at: string;
}

interface CertificateFormData {
  heading: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  position: string;
  other_position: string;
  working_time: string;
  additional_notes: string;
  logo_image: File | null;
  person_image: File | null;
  signature_person: File | null;
  leader_signature: File | null;
  status: string;
}

interface CertificateStats {
  total: number;
  issued: number;
  pending: number;
  draft: number;
  archived: number;
  by_position: Record<string, number>;
}

// ============================================================
// CONFIRM MODAL
// ============================================================

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <FaTrash className="w-6 h-6 text-red-600" />,
          button: 'bg-red-600 hover:bg-red-700',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: <FaExclamationCircle className="w-6 h-6 text-yellow-600" />,
          button: 'bg-yellow-600 hover:bg-yellow-700',
          border: 'border-yellow-200'
        };
      case 'info':
        return {
          icon: <FaFileAlt className="w-6 h-6 text-blue-600" />,
          button: 'bg-blue-600 hover:bg-blue-700',
          border: 'border-blue-200'
        };
      case 'success':
        return {
          icon: <FaCheckCircle className="w-6 h-6 text-green-600" />,
          button: 'bg-green-600 hover:bg-green-700',
          border: 'border-green-200'
        };
      default:
        return {
          icon: <FaFileAlt className="w-6 h-6 text-blue-600" />,
          button: 'bg-blue-600 hover:bg-blue-700',
          border: 'border-blue-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className={`bg-white rounded-xl max-w-md w-full shadow-xl border ${styles.border} relative z-10`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${
              type === 'danger' ? 'bg-red-100' :
              type === 'warning' ? 'bg-yellow-100' :
              type === 'success' ? 'bg-green-100' :
              'bg-blue-100'
            }`}>
              {styles.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${styles.button} disabled:opacity-50 flex items-center gap-2`}
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CERTIFICATE FORM MODAL
// ============================================================

interface CertificateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string | null, data: FormData) => Promise<any>;
  certificate?: Certificate | null;
  loading: boolean;
  mode: 'create' | 'edit';
}

const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  certificate,
  loading,
  mode
}) => {
  const [formData, setFormData] = useState<CertificateFormData>({
    heading: 'SEVENTH DAY ADVENTIST CHURCH',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    position: 'STUDENT',
    other_position: '',
    working_time: '5 years',
    additional_notes: '',
    logo_image: null,
    person_image: null,
    signature_person: null,
    leader_signature: null,
    status: 'draft'
  });

  const [previews, setPreviews] = useState<{
    logo: string | null;
    person: string | null;
    signature: string | null;
    leader: string | null;
  }>({
    logo: null,
    person: null,
    signature: null,
    leader: null,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (certificate && mode === 'edit') {
      setFormData({
        heading: certificate.heading || 'CERTIFICATE FOR COURSE COMPLETION',
        recipient_name: certificate.recipient_name || '',
        recipient_email: certificate.recipient_email || '',
        recipient_phone: certificate.recipient_phone || '',
        position: certificate.position || 'STUDENT',
        other_position: certificate.other_position || '',
        working_time: certificate.working_time || '5 years',
        additional_notes: certificate.additional_notes || '',
        logo_image: null,
        person_image: null,
        signature_person: null,
        leader_signature: null,
        status: certificate.status || 'draft'
      });
    }
  }, [certificate, mode]);

  if (!isOpen) return null;

  const handleFileChange = (field: keyof CertificateFormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setPreviews(prev => ({ ...prev, [field]: preview }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.heading.trim()) errors.heading = 'Heading is required';
    if (!formData.recipient_name.trim()) errors.recipient_name = 'Recipient name is required';
    if (!formData.position) errors.position = 'Position is required';
    if (!formData.working_time.trim()) errors.working_time = 'Working time is required';
    
    if (formData.position === 'OTHER' && !formData.other_position.trim()) {
      errors.other_position = 'Please specify the position';
    }
    
    if (formData.recipient_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipient_email)) {
      errors.recipient_email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append('heading', formData.heading);
    formDataToSend.append('recipient_name', formData.recipient_name);
    formDataToSend.append('recipient_email', formData.recipient_email);
    formDataToSend.append('recipient_phone', formData.recipient_phone);
    formDataToSend.append('position', formData.position);
    formDataToSend.append('working_time', formData.working_time);
    formDataToSend.append('status', formData.status || 'draft');
    
    if (formData.position === 'OTHER' && formData.other_position) {
      formDataToSend.append('other_position', formData.other_position);
    }
    if (formData.additional_notes) {
      formDataToSend.append('additional_notes', formData.additional_notes);
    }
    
    if (formData.logo_image) {
      formDataToSend.append('logo_image_file', formData.logo_image);
    }
    if (formData.person_image) {
      formDataToSend.append('person_image_file', formData.person_image);
    }
    if (formData.signature_person) {
      formDataToSend.append('signature_person_file', formData.signature_person);
    }
    if (formData.leader_signature) {
      formDataToSend.append('leader_signature_file', formData.leader_signature);
    }

    const id = mode === 'edit' && certificate ? certificate.certificate_id : null;
    await onSave(id, formDataToSend);
  };

  const positionOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'INSTRUCTOR', label: 'Instructor' },
    { value: 'STUDENT', label: 'Student' },
    { value: 'EVANGELIST', label: 'Evangelist' },
    { value: 'PASTOR', label: 'Pastor' },
    { value: 'CHURCH_ADMIN', label: 'Church Admin' },
    { value: 'OTHER', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'issued', label: 'Issued' },
    { value: 'pending', label: 'Pending' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <FaCertificate className="text-white text-xl" />
            <div>
              <h3 className="text-white font-bold text-lg">
                {mode === 'create' ? 'Create New Certificate' : 'Edit Certificate'}
              </h3>
              <p className="text-cyan-100 text-sm">
                {mode === 'edit' && certificate ? `Certificate #${certificate.certificate_number}` : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Heading */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Heading</label>
              <input
                type="text"
                value={formData.heading}
                onChange={(e) => setFormData(prev => ({ ...prev, heading: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  formErrors.heading ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="CERTIFICATE FOR COURSE COMPLETION"
              />
              {formErrors.heading && <p className="text-xs text-red-500 mt-1">{formErrors.heading}</p>}
            </div>

            {/* Recipient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Recipient Name *</label>
              <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  formErrors.recipient_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Full name"
              />
              {formErrors.recipient_name && <p className="text-xs text-red-500 mt-1">{formErrors.recipient_name}</p>}
            </div>

            {/* Recipient Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Recipient Email</label>
              <input
                type="email"
                value={formData.recipient_email}
                onChange={(e) => setFormData(prev => ({ ...prev, recipient_email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  formErrors.recipient_email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@example.com"
              />
              {formErrors.recipient_email && <p className="text-xs text-red-500 mt-1">{formErrors.recipient_email}</p>}
            </div>

            {/* Recipient Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Recipient Phone</label>
              <input
                type="text"
                value={formData.recipient_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, recipient_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="+255 712 345 678"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  formErrors.position ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {positionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {formErrors.position && <p className="text-xs text-red-500 mt-1">{formErrors.position}</p>}
            </div>

            {/* Working Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Working Time</label>
              <input
                type="text"
                value={formData.working_time}
                onChange={(e) => setFormData(prev => ({ ...prev, working_time: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  formErrors.working_time ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="5 years"
              />
              {formErrors.working_time && <p className="text-xs text-red-500 mt-1">{formErrors.working_time}</p>}
            </div>

            {/* Other Position */}
            {formData.position === 'OTHER' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Other Position</label>
                <input
                  type="text"
                  value={formData.other_position}
                  onChange={(e) => setFormData(prev => ({ ...prev, other_position: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    formErrors.other_position ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter other position"
                />
                {formErrors.other_position && <p className="text-xs text-red-500 mt-1">{formErrors.other_position}</p>}
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={formData.additional_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Logo Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo Image</label>
              <div className="mt-1 flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 transition-colors">
                {previews.logo ? (
                  <img src={previews.logo} alt="Logo" className="w-full h-24 object-contain" />
                ) : (
                  <FaUpload className="text-3xl text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('logo_image', e.target.files?.[0] || null)}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="mt-2 text-sm text-cyan-600 hover:text-cyan-700 cursor-pointer">
                  {previews.logo ? 'Change' : 'Upload'}
                </label>
              </div>
            </div>

            {/* Person Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Person Image</label>
              <div className="mt-1 flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 transition-colors">
                {previews.person ? (
                  <img src={previews.person} alt="Person" className="w-full h-24 object-cover rounded" />
                ) : (
                  <FaUser className="text-3xl text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('person_image', e.target.files?.[0] || null)}
                  className="hidden"
                  id="person-upload"
                />
                <label htmlFor="person-upload" className="mt-2 text-sm text-cyan-600 hover:text-cyan-700 cursor-pointer">
                  {previews.person ? 'Change' : 'Upload'}
                </label>
              </div>
            </div>

            {/* Signature Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Signature Person</label>
              <div className="mt-1 flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 transition-colors">
                {previews.signature ? (
                  <img src={previews.signature} alt="Signature" className="w-full h-24 object-contain" />
                ) : (
                  <FaFileAlt className="text-3xl text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('signature_person', e.target.files?.[0] || null)}
                  className="hidden"
                  id="signature-upload"
                />
                <label htmlFor="signature-upload" className="mt-2 text-sm text-cyan-600 hover:text-cyan-700 cursor-pointer">
                  {previews.signature ? 'Change' : 'Upload'}
                </label>
              </div>
            </div>

            {/* Leader Signature */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Leader Signature</label>
              <div className="mt-1 flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 transition-colors">
                {previews.leader ? (
                  <img src={previews.leader} alt="Leader" className="w-full h-24 object-contain" />
                ) : (
                  <FaFileAlt className="text-3xl text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('leader_signature', e.target.files?.[0] || null)}
                  className="hidden"
                  id="leader-upload"
                />
                <label htmlFor="leader-upload" className="mt-2 text-sm text-cyan-600 hover:text-cyan-700 cursor-pointer">
                  {previews.leader ? 'Change' : 'Upload'}
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {loading ? 'Saving...' : mode === 'create' ? 'Create Certificate' : 'Update Certificate'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// VIEW CERTIFICATE MODAL
// ============================================================

interface ViewCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onRegenerate: (cert: Certificate) => void;
  onIssue: (cert: Certificate) => void;
  onEdit: (cert: Certificate) => void;
  loading: boolean;
}

const ViewCertificateModal: React.FC<ViewCertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  onPreview,
  onDownload,
  onRegenerate,
  onIssue,
  onEdit,
  loading
}) => {
  if (!isOpen || !certificate) return null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-700',
      issued: 'bg-green-100 text-green-700',
      pending: 'bg-blue-100 text-blue-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || styles.draft;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'issued': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-blue-500" />;
      case 'draft': return <FaEdit className="text-yellow-500" />;
      case 'archived': return <FaExclamationCircle className="text-gray-500" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getPositionBadge = (position: string) => {
    const styles: Record<string, string> = {
      'ADMIN': 'bg-purple-100 text-purple-700',
      'INSTRUCTOR': 'bg-blue-100 text-blue-700',
      'STUDENT': 'bg-green-100 text-green-700',
      'EVANGELIST': 'bg-orange-100 text-orange-700',
      'PASTOR': 'bg-indigo-100 text-indigo-700',
      'CHURCH_ADMIN': 'bg-cyan-100 text-cyan-700',
      'OTHER': 'bg-gray-100 text-gray-700',
    };
    return styles[position] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <FaCertificate className="text-white text-xl" />
            <div>
              <h3 className="text-white font-bold text-lg">Certificate Details</h3>
              <p className="text-cyan-100 text-sm">{certificate.certificate_number}</p>
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
          {/* Status & Position */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
            <span className={`inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(certificate.status)}`}>
              {getStatusIcon(certificate.status)}
              <span>{certificate.status_display}</span>
            </span>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getPositionBadge(certificate.position)}`}>
              {certificate.display_position}
            </span>
            <span className="text-sm text-gray-500">
              <FaCalendarAlt className="inline mr-1" />
              {certificate.issue_date_display}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Certificate Number</p>
              <p className="text-sm font-semibold text-gray-900">{certificate.certificate_number}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Heading</p>
              <p className="text-sm font-semibold text-gray-900">{certificate.heading}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Recipient Name</p>
              <p className="text-sm font-semibold text-gray-900">{certificate.recipient_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Recipient Email</p>
              <p className="text-sm font-semibold text-gray-900">{certificate.recipient_email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Recipient Phone</p>
              <p className="text-sm font-semibold text-gray-900">{certificate.recipient_phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Working Time</p>
              <p className="text-sm font-semibold text-gray-900">{certificate.working_time}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-gray-500">Additional Notes</p>
              <p className="text-sm text-gray-700">{certificate.additional_notes || 'No notes'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onPreview(certificate.certificate_id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
            >
              <FaEye /> Preview PDF
            </button>
            <button
              onClick={() => onDownload(certificate.certificate_id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
            >
              <FaDownload /> Download PDF
            </button>
            <button
              onClick={() => onRegenerate(certificate)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaRegCopy />}
              Regenerate PDF
            </button>
            {certificate.status === 'draft' && (
              <button
                onClick={() => onIssue(certificate)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
              >
                <FaCheckCircle /> Issue
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onEdit(certificate);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
            >
              <FaEdit /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const CertificateManagement: React.FC = () => {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);
  const [stats, setStats] = useState<CertificateStats>({
    total: 0,
    issued: 0,
    pending: 0,
    draft: 0,
    archived: 0,
    by_position: {}
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
    loading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: () => {},
    loading: false
  });

  // ============================================================
  // API BASE URL
  // ============================================================

  const API_BASE_URL = 'http://127.0.0.1:8000/api/certificates/certificates';

  // ============================================================
  // API CALLS - DIRECT
  // ============================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = API_BASE_URL + '/';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let certificatesData: Certificate[] = [];
      if (data.results) {
        certificatesData = data.results;
      } else if (Array.isArray(data)) {
        certificatesData = data;
      } else if (data.data && Array.isArray(data.data)) {
        certificatesData = data.data;
      }

      setCertificates(certificatesData);
      
      // Calculate stats
      const statsData: CertificateStats = {
        total: certificatesData.length,
        issued: certificatesData.filter(c => c.status === 'issued').length,
        pending: certificatesData.filter(c => c.status === 'pending').length,
        draft: certificatesData.filter(c => c.status === 'draft').length,
        archived: certificatesData.filter(c => c.status === 'archived').length,
        by_position: {}
      };
      
      certificatesData.forEach(c => {
        const pos = c.position || 'UNKNOWN';
        statsData.by_position[pos] = (statsData.by_position[pos] || 0) + 1;
      });
      
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      setError(err.message || 'Failed to load certificates');
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const createCertificate = async (_id: string | null, formData: FormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL + '/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create certificate');
      }

      const data = await response.json();
      toast.success('Certificate created successfully!');
      await fetchCertificates();
      setShowCreateModal(false);
      return data;
    } catch (err: any) {
      console.error('Error creating certificate:', err);
      toast.error(err.message || 'Failed to create certificate');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const updateCertificate = async (id: string | null, formData: FormData) => {
    if (!id) {
      toast.error('Certificate ID is required for update');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update certificate');
      }

      const data = await response.json();
      toast.success('Certificate updated successfully!');
      await fetchCertificates();
      setShowEditModal(false);
      setEditingCert(null);
      return data;
    } catch (err: any) {
      console.error('Error updating certificate:', err);
      toast.error(err.message || 'Failed to update certificate');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCertificate = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete certificate');
      }

      toast.success('Certificate deleted successfully!');
      await fetchCertificates();
    } catch (err: any) {
      console.error('Error deleting certificate:', err);
      toast.error(err.message || 'Failed to delete certificate');
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const issueCertificate = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/issue/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to issue certificate');
      }

      toast.success('Certificate issued successfully!');
      await fetchCertificates();
      setShowViewModal(false);
    } catch (err: any) {
      console.error('Error issuing certificate:', err);
      toast.error(err.message || 'Failed to issue certificate');
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const downloadPDF = (id: string) => {
    window.open(`${API_BASE_URL}/${id}/download_pdf/`, '_blank');
  };

  const previewPDF = (id: string) => {
    window.open(`${API_BASE_URL}/${id}/preview_pdf/`, '_blank');
  };

  const regeneratePDF = async (cert: Certificate) => {
    setActionLoading(cert.certificate_id);
    try {
      const response = await fetch(`${API_BASE_URL}/${cert.certificate_id}/regenerate_pdf/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate PDF');
      }

      toast.success('PDF regenerated successfully!');
      await fetchCertificates();
    } catch (err: any) {
      console.error('Error regenerating PDF:', err);
      toast.error(err.message || 'Failed to regenerate PDF');
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleDelete = (cert: Certificate) => {
    showConfirmModal(
      'Delete Certificate',
      `Are you sure you want to delete certificate "${cert.certificate_number}"? This action cannot be undone.`,
      async () => {
        await deleteCertificate(cert.certificate_id);
        closeConfirmModal();
      },
      'danger',
      'Delete',
      'Cancel'
    );
  };

  const handleIssue = (cert: Certificate) => {
    showConfirmModal(
      'Issue Certificate',
      `Are you sure you want to issue certificate "${cert.certificate_number}" to ${cert.recipient_name}?`,
      async () => {
        await issueCertificate(cert.certificate_id);
        closeConfirmModal();
      },
      'success',
      'Issue',
      'Cancel'
    );
  };

  const handleRegenerate = (cert: Certificate) => {
    showConfirmModal(
      'Regenerate PDF',
      `Are you sure you want to regenerate PDF for "${cert.certificate_number}"?`,
      async () => {
        await regeneratePDF(cert);
        closeConfirmModal();
      },
      'info',
      'Regenerate',
      'Cancel'
    );
  };

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' | 'success' = 'warning',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm,
      loading: false
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-700',
      issued: 'bg-green-100 text-green-700',
      pending: 'bg-blue-100 text-blue-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || styles.draft;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'issued': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-blue-500" />;
      case 'draft': return <FaEdit className="text-yellow-500" />;
      case 'archived': return <FaExclamationCircle className="text-gray-500" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getPositionBadge = (position: string) => {
    const styles: Record<string, string> = {
      'ADMIN': 'bg-purple-100 text-purple-700',
      'INSTRUCTOR': 'bg-blue-100 text-blue-700',
      'STUDENT': 'bg-green-100 text-green-700',
      'EVANGELIST': 'bg-orange-100 text-orange-700',
      'PASTOR': 'bg-indigo-100 text-indigo-700',
      'CHURCH_ADMIN': 'bg-cyan-100 text-cyan-700',
      'OTHER': 'bg-gray-100 text-gray-700',
    };
    return styles[position] || 'bg-gray-100 text-gray-700';
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading certificates...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Certificate Management</h1>
            <p className="mt-1 text-gray-600">Create, manage and issue certificates</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>New Certificate</span>
          </button>
          <button
            onClick={fetchCertificates}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaSpinner className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-cyan-500">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.issued}</p>
          <p className="text-xs text-gray-500">Issued</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
          <p className="text-xs text-gray-500">Draft</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-500">
          <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
          <p className="text-xs text-gray-500">Archived</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by recipient name, certificate number..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <FaExclamationCircle className="text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Certificates Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FaCertificate className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p>No certificates found</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-3 text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Create your first certificate
                    </button>
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => {
                  const isActionLoading = actionLoading === cert.certificate_id;
                  
                  return (
                    <tr key={cert.certificate_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cert.certificate_number}</p>
                          <p className="text-xs text-gray-500">{cert.heading}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cert.recipient_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{cert.recipient_email || 'No email'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getPositionBadge(cert.position)}`}>
                          {cert.display_position}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(cert.status)}`}>
                          {getStatusIcon(cert.status)}
                          <span>{cert.status_display}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setViewingCert(cert);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => previewPDF(cert.certificate_id)}
                            className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                            title="Preview PDF"
                          >
                            <FaFileAlt />
                          </button>
                          <button
                            onClick={() => downloadPDF(cert.certificate_id)}
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                            title="Download PDF"
                          >
                            <FaDownload />
                          </button>
                          {cert.status === 'draft' && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCert(cert);
                                  setShowEditModal(true);
                                }}
                                className="p-2 text-gray-500 hover:text-yellow-600 transition-colors rounded-lg hover:bg-yellow-50"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleIssue(cert)}
                                className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                                title="Issue"
                              >
                                <FaCheckCircle />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleRegenerate(cert)}
                            disabled={isActionLoading}
                            className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50 disabled:opacity-50"
                            title="Regenerate PDF"
                          >
                            {isActionLoading ? <FaSpinner className="animate-spin" /> : <FaRegCopy />}
                          </button>
                          <button
                            onClick={() => handleDelete(cert)}
                            disabled={isActionLoading}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                            title="Delete"
                          >
                            {isActionLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <CertificateFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={createCertificate}
        loading={submitting}
        mode="create"
      />

      {/* Edit Modal */}
      <CertificateFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCert(null);
        }}
        onSave={updateCertificate}
        certificate={editingCert}
        loading={submitting}
        mode="edit"
      />

      {/* View Modal */}
      <ViewCertificateModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingCert(null);
        }}
        certificate={viewingCert}
        onPreview={previewPDF}
        onDownload={downloadPDF}
        onRegenerate={handleRegenerate}
        onIssue={handleIssue}
        onEdit={(cert) => {
          setShowViewModal(false);
          setEditingCert(cert);
          setShowEditModal(true);
        }}
        loading={actionLoading === viewingCert?.certificate_id}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        loading={confirmModal.loading}
      />

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

export default CertificateManagement;
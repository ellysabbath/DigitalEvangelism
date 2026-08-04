// src/pages/admin/CertificateAdmin.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCertificate, FaSearch, FaUserGraduate, 
  FaLemon, FaCalendarAlt, FaIdCard, FaEnvelope, FaPhone,
  FaChurch, FaMapMarkerAlt, FaAward, FaCheckCircle,
  FaClock, FaSpinner, FaPlus, FaTimes, FaDownload,
  FaPrint, FaShare, FaQrcode, FaEye, FaStar, FaUser,
  FaUpload, FaSignature, FaFilePdf, FaImage, FaUserTie,
  FaBriefcase, FaClock as FaClockIcon,
  FaSave, FaTrash, FaEdit, FaUsers, FaBook, FaFileAlt,
  FaGem, FaCrown, FaRibbon, FaPalette, FaBorderAll,
  FaRegGem, FaRegStar, FaRegSun, FaArrowRight, FaArrowLeft as FaArrowLeftIcon,
  FaExclamationTriangle, FaQuestionCircle, FaShieldAlt,
  FaDatabase, FaSync, FaHistory, FaLock, FaUnlock,
  FaArchive
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { FaNoteSticky } from 'react-icons/fa6';

// ===================== MODELS =====================

interface Certificate {
  id: string;
  certificate_id: string;
  heading: string;
  logoImage: string;
  personImage: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  position: string;
  otherPosition: string;
  workingTime: string;
  signaturePerson: string;
  leaderSignature: string;
  certificateNumber: string;
  issueDate: string;
  additionalNotes: string;
  certificatePdf: string;
  status: 'draft' | 'issued' | 'pending' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface CertificateFormData {
  // Header Section
  heading: string;
  logoImage: string;
  personImage: string;
  
  // Certificate Body
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  position: string;
  otherPosition: string;
  workingTime: string;
  
  // Signature Section
  signaturePerson: string;
  leaderSignature: string;
  
  // Certificate Details
  certificateNumber: string;
  issueDate: string;
  
  // Additional Fields
  additionalNotes: string;
  certificatePdf: string;
}

// ===================== CONFIRMATION MODALS =====================

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
          icon: <FaQuestionCircle className="text-yellow-600 text-4xl" />,
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
          icon: <FaShieldAlt className="text-blue-600 text-4xl" />,
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

// ===================== MAIN COMPONENT =====================

const CertificateAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'issue' | 'manage' | 'preview' | 'edit'>('manage');
  const [selectedTheme, setSelectedTheme] = useState<'gold' | 'blue' | 'green' | 'purple' | 'rose'>('gold');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Confirmation Modal States
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'warning' as 'danger' | 'warning' | 'info' | 'success',
    onConfirm: () => {},
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const personImageInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const leaderSignatureInputRef = useRef<HTMLInputElement>(null);

  const themes = {
    gold: {
      primary: 'from-amber-600 to-yellow-600',
      accent: 'amber-500',
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      light: 'bg-amber-50',
      dark: 'bg-amber-800',
      gradient: 'from-amber-600 to-yellow-700',
      cardBorder: 'border-amber-200',
      button: 'bg-amber-600 hover:bg-amber-700',
      certificate: {
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-300',
        accent: 'text-amber-700',
        heading: 'text-amber-800',
        name: 'text-amber-900',
      }
    },
    blue: {
      primary: 'from-blue-600 to-indigo-600',
      accent: 'blue-500',
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      light: 'bg-blue-50',
      dark: 'bg-blue-800',
      gradient: 'from-blue-600 to-indigo-700',
      cardBorder: 'border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700',
      certificate: {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        border: 'border-blue-300',
        accent: 'text-blue-700',
        heading: 'text-blue-800',
        name: 'text-indigo-900',
      }
    },
    green: {
      primary: 'from-green-600 to-emerald-600',
      accent: 'green-500',
      border: 'border-green-300',
      bg: 'bg-green-50',
      text: 'text-green-700',
      light: 'bg-green-50',
      dark: 'bg-green-800',
      gradient: 'from-green-600 to-emerald-700',
      cardBorder: 'border-green-200',
      button: 'bg-green-600 hover:bg-green-700',
      certificate: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-300',
        accent: 'text-green-700',
        heading: 'text-green-800',
        name: 'text-emerald-900',
      }
    },
    purple: {
      primary: 'from-purple-600 to-violet-600',
      accent: 'purple-500',
      border: 'border-purple-300',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      light: 'bg-purple-50',
      dark: 'bg-purple-800',
      gradient: 'from-purple-600 to-violet-700',
      cardBorder: 'border-purple-200',
      button: 'bg-purple-600 hover:bg-purple-700',
      certificate: {
        bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
        border: 'border-purple-300',
        accent: 'text-purple-700',
        heading: 'text-purple-800',
        name: 'text-violet-900',
      }
    },
    rose: {
      primary: 'from-rose-600 to-pink-600',
      accent: 'rose-500',
      border: 'border-rose-300',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      light: 'bg-rose-50',
      dark: 'bg-rose-800',
      gradient: 'from-rose-600 to-pink-700',
      cardBorder: 'border-rose-200',
      button: 'bg-rose-600 hover:bg-rose-700',
      certificate: {
        bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
        border: 'border-rose-300',
        accent: 'text-rose-700',
        heading: 'text-rose-800',
        name: 'text-pink-900',
      }
    }
  };

  const currentTheme = themes[selectedTheme];

  const positions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'INSTRUCTOR', label: 'Instructor' },
    { value: 'STUDENT', label: 'Student' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Initial form data
  const initialFormData: CertificateFormData = {
    heading: 'CERTIFICATE FOR COURSE COMPLETION',
    logoImage: '',
    personImage: '',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    position: 'STUDENT',
    otherPosition: '',
    workingTime: '5 years',
    signaturePerson: '',
    leaderSignature: '',
    certificateNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    additionalNotes: '',
    certificatePdf: '',
  };

  const [formData, setFormData] = useState<CertificateFormData>(initialFormData);

  // Mock certificates data
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      certificate_id: '550e8400-e29b-41d4-a716-446655440000',
      heading: 'CERTIFICATE FOR COURSE COMPLETION',
      logoImage: '',
      personImage: '',
      recipientName: 'Sarah Johnson',
      recipientEmail: 'sarah@example.com',
      recipientPhone: '+254 712 345 678',
      position: 'STUDENT',
      otherPosition: '',
      workingTime: '3 years',
      signaturePerson: '',
      leaderSignature: '',
      certificateNumber: 'SDC-2026-1234',
      issueDate: '2026-01-20',
      additionalNotes: 'Outstanding performance in all exams',
      certificatePdf: '',
      status: 'issued',
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z'
    },
    {
      id: '2',
      certificate_id: '550e8400-e29b-41d4-a716-446655440001',
      heading: 'CERTIFICATE OF EXCELLENCE',
      logoImage: '',
      personImage: '',
      recipientName: 'Michael Kim',
      recipientEmail: 'michael@example.com',
      recipientPhone: '+254 723 456 789',
      position: 'INSTRUCTOR',
      otherPosition: '',
      workingTime: '5 years',
      signaturePerson: '',
      leaderSignature: '',
      certificateNumber: 'SDC-2026-5678',
      issueDate: '2026-01-18',
      additionalNotes: 'Excellent teaching and mentorship',
      certificatePdf: '',
      status: 'issued',
      createdAt: '2026-01-18T10:00:00Z',
      updatedAt: '2026-01-18T10:00:00Z'
    },
    {
      id: '3',
      certificate_id: '550e8400-e29b-41d4-a716-446655440002',
      heading: 'CERTIFICATE FOR COURSE COMPLETION',
      logoImage: '',
      personImage: '',
      recipientName: 'Grace Mwangi',
      recipientEmail: 'grace@example.com',
      recipientPhone: '+254 734 567 890',
      position: 'STUDENT',
      otherPosition: '',
      workingTime: '2 years',
      signaturePerson: '',
      leaderSignature: '',
      certificateNumber: 'SDC-2026-9012',
      issueDate: '2026-01-15',
      additionalNotes: 'Showed great improvement',
      certificatePdf: '',
      status: 'pending',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z'
    },
  ]);

  const filteredCertificates = certificates.filter(cert =>
    cert.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===================== CRUD OPERATIONS =====================

  // CREATE
  const handleCreateCertificate = async () => {
    if (!formData.recipientName) {
      toast.error('Please enter recipient name');
      return;
    }

    const certNumber = generateCertificateNumber();
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      certificate_id: crypto.randomUUID ? crypto.randomUUID() : `cert-${Date.now()}`,
      ...formData,
      certificateNumber: certNumber,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCertificates(prev => [newCertificate, ...prev]);
    toast.success(`Certificate draft created for ${formData.recipientName}!`);
    resetForm();
    setActiveTab('manage');
  };

  // READ - View Certificate
  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setActiveTab('preview');
  };

  // UPDATE - Edit Certificate
  const handleEditCertificate = (cert: Certificate) => {
    setIsEditMode(true);
    setEditingId(cert.id);
    setFormData({
      heading: cert.heading,
      logoImage: cert.logoImage || '',
      personImage: cert.personImage || '',
      recipientName: cert.recipientName,
      recipientEmail: cert.recipientEmail || '',
      recipientPhone: cert.recipientPhone || '',
      position: cert.position,
      otherPosition: cert.otherPosition || '',
      workingTime: cert.workingTime || '5 years',
      signaturePerson: cert.signaturePerson || '',
      leaderSignature: cert.leaderSignature || '',
      certificateNumber: cert.certificateNumber,
      issueDate: cert.issueDate,
      additionalNotes: cert.additionalNotes || '',
      certificatePdf: cert.certificatePdf || '',
    });
    setActiveTab('edit');
  };

  const handleUpdateCertificate = async () => {
    if (!editingId) return;

    const updatedCertificates = certificates.map(cert =>
      cert.id === editingId
        ? {
            ...cert,
            ...formData,
            updatedAt: new Date().toISOString(),
          }
        : cert
    );

    setCertificates(updatedCertificates);
    toast.success('Certificate updated successfully!');
    resetForm();
    setActiveTab('manage');
  };

  // DELETE
  const handleDeleteCertificate = (id: string) => {
    showConfirmationModal({
      title: 'Delete Certificate',
      message: 'Are you sure you want to delete this certificate? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        setCertificates(prev => prev.filter(cert => cert.id !== id));
        toast.success('Certificate deleted successfully!');
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ISSUE
  const handleIssueCertificate = (id: string) => {
    showConfirmationModal({
      title: 'Issue Certificate',
      message: 'Are you sure you want to issue this certificate? The recipient will receive a notification.',
      confirmText: 'Issue',
      type: 'success',
      onConfirm: () => {
        setCertificates(prev =>
          prev.map(cert =>
            cert.id === id
              ? { ...cert, status: 'issued', updatedAt: new Date().toISOString() }
              : cert
          )
        );
        toast.success('Certificate issued successfully!');
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ARCHIVE
  const handleArchiveCertificate = (id: string) => {
    showConfirmationModal({
      title: 'Archive Certificate',
      message: 'Are you sure you want to archive this certificate? It will be moved to archived status.',
      confirmText: 'Archive',
      type: 'warning',
      onConfirm: () => {
        setCertificates(prev =>
          prev.map(cert =>
            cert.id === id
              ? { ...cert, status: 'archived', updatedAt: new Date().toISOString() }
              : cert
          )
        );
        toast.success('Certificate archived successfully!');
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // BULK DELETE (Demo)
  const handleBulkDelete = () => {
    showConfirmationModal({
      title: 'Delete All Certificates',
      message: 'Are you sure you want to delete ALL certificates? This action cannot be undone.',
      confirmText: 'Delete All',
      type: 'danger',
      onConfirm: () => {
        setCertificates([]);
        toast.success('All certificates deleted successfully!');
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ===================== HELPER FUNCTIONS =====================

  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SDC-${year}-${random}`;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setEditingId(null);
    setShowPreview(false);
  };

  const showConfirmationModal = ({
    title,
    message,
    confirmText,
    type,
    onConfirm,
  }: {
    title: string;
    message: string;
    confirmText: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      confirmText,
      type,
      onConfirm,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      issued: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-blue-100 text-blue-700',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [field]: reader.result as string
      }));
      toast.success('Image uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDraft = () => {
    toast.success('Certificate draft saved successfully!');
  };

  const handleDownloadPDF = () => {
    toast.success('PDF download started!');
  };

  const getPositionLabel = (value: string) => {
    return positions.find(p => p.value === value)?.label || value;
  };

  // ===================== RENDER =====================

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
        isLoading={isSubmitting}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaCertificate className="text-amber-500 mr-2" />
              Certificate Management
            </h1>
            <p className="text-sm text-gray-600">Create, manage and issue certificates</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { resetForm(); setActiveTab('issue'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
              activeTab === 'issue' || activeTab === 'edit'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaPlus className="mr-2" />
            New Certificate
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
              activeTab === 'manage'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaFileAlt className="mr-2" />
            All Certificates
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      {(activeTab === 'issue' || activeTab === 'edit') && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <FaPalette className="mr-2 text-amber-500" />
              Certificate Theme:
            </span>
            <div className="flex space-x-2">
              {Object.keys(themes).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme as any)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedTheme === theme
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: theme === 'gold' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                              theme === 'blue' ? 'linear-gradient(135deg, #3b82f6, #4f46e5)' :
                              theme === 'green' ? 'linear-gradient(135deg, #22c55e, #059669)' :
                              theme === 'purple' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
                              'linear-gradient(135deg, #f43f5e, #db2777)'
                  }}
                  title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {activeTab === 'manage' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-amber-500">
            <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
            <p className="text-2xl font-bold text-green-600">
              {certificates.filter(c => c.status === 'issued').length}
            </p>
            <p className="text-xs text-gray-500">Issued</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-yellow-500">
            <p className="text-2xl font-bold text-yellow-600">
              {certificates.filter(c => c.status === 'pending').length}
            </p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-gray-500">
            <p className="text-2xl font-bold text-gray-600">
              {certificates.filter(c => c.status === 'draft').length}
            </p>
            <p className="text-xs text-gray-500">Drafts</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">
              {certificates.filter(c => c.status === 'archived').length}
            </p>
            <p className="text-xs text-gray-500">Archived</p>
          </div>
        </div>
      )}

      {/* Main Content - Issue/Edit Tab */}
      {(activeTab === 'issue' || activeTab === 'edit') && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className={`p-6 border-b border-gray-200 bg-gradient-to-r ${currentTheme.primary} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <FaGem className="mr-2" />
                  {isEditMode ? 'Edit Certificate' : 'Create New Certificate'}
                </h3>
                <p className="text-white/80 text-sm">
                  {isEditMode ? 'Update certificate information' : 'Fill in all the certificate information'}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                <FaCrown className="text-yellow-300" />
                <span>Premium Certificate</span>
              </div>
            </div>
          </div>

          <form className="p-6 space-y-6">
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <FaImage className="mr-2 text-amber-500" />
                Header Section
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    name="heading"
                    value={formData.heading}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="CERTIFICATE FOR COURSE COMPLETION"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo Image
                  </label>
                  <div className="flex items-center space-x-3">
                    {formData.logoImage && (
                      <img src={formData.logoImage} alt="Logo" className="h-12 w-auto object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <FaUpload className="mr-2" />
                      Upload Logo
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logoImage')}
                      className="hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Photo
                  </label>
                  <div className="flex items-center space-x-3">
                    {formData.personImage && (
                      <img src={formData.personImage} alt="Person" className="h-12 w-12 rounded-full object-cover border-2 border-amber-300" />
                    )}
                    <button
                      type="button"
                      onClick={() => personImageInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <FaUpload className="mr-2" />
                      Upload Photo
                    </button>
                    <input
                      ref={personImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'personImage')}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <FaUserGraduate className="mr-2 text-amber-500" />
                Recipient Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Full name of the certificate recipient"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="recipientEmail"
                    value={formData.recipientEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {positions.map(pos => (
                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Time
                  </label>
                  <input
                    type="text"
                    name="workingTime"
                    value={formData.workingTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <FaSignature className="mr-2 text-amber-500" />
                Signature Section
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Person Signature
                  </label>
                  <div className="flex items-center space-x-3">
                    {formData.signaturePerson && (
                      <img src={formData.signaturePerson} alt="Signature" className="h-12 w-auto" />
                    )}
                    <button
                      type="button"
                      onClick={() => signatureInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <FaUpload className="mr-2" />
                      Upload Signature
                    </button>
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'signaturePerson')}
                      className="hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Signature
                  </label>
                  <div className="flex items-center space-x-3">
                    {formData.leaderSignature && (
                      <img src={formData.leaderSignature} alt="Leader Signature" className="h-12 w-auto" />
                    )}
                    <button
                      type="button"
                      onClick={() => leaderSignatureInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <FaUpload className="mr-2" />
                      Upload Signature
                    </button>
                    <input
                      ref={leaderSignatureInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'leaderSignature')}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <FaNoteSticky className="mr-2 text-amber-500" />
                Additional Notes
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Any additional notes or remarks..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200 pt-4">
              {isEditMode ? (
                <button
                  type="button"
                  onClick={handleUpdateCertificate}
                  className="flex-1 flex justify-center items-center py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <FaSave className="mr-2" />
                  Update Certificate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateCertificate}
                  className="flex-1 flex justify-center items-center py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <FaGem className="mr-2" />
                  Create Certificate
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FaSave className="inline mr-2" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => { resetForm(); setActiveTab('manage'); }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && selectedCertificate && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className={`p-6 border-b border-gray-200 bg-gradient-to-r ${currentTheme.primary} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaAward className="text-3xl" />
                <div>
                  <h3 className="text-xl font-bold">Certificate Preview</h3>
                  <p className="text-white/80 text-sm">{selectedCertificate.recipientName}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => { setActiveTab('manage'); setSelectedCertificate(null); }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => handleEditCertificate(selectedCertificate)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Certificate Display */}
          <div className={`p-8 m-6 rounded-lg border-4 border-double ${currentTheme.certificate.border} ${currentTheme.certificate.bg}`}>
            <div className="text-center relative">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-amber-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-amber-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-amber-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-amber-400 rounded-br-lg"></div>

              {selectedCertificate.logoImage && (
                <img src={selectedCertificate.logoImage} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
              )}
              
              <h2 className={`text-2xl font-serif font-bold ${currentTheme.certificate.heading}`}>
                {selectedCertificate.heading}
              </h2>
              <div className="w-32 h-0.5 bg-amber-400 mx-auto my-3"></div>
              
              <p className="text-gray-600 text-sm">This certificate is proudly presented to</p>
              
              <h3 className={`text-3xl font-serif font-bold ${currentTheme.certificate.name} my-3 uppercase tracking-wider`}>
                {selectedCertificate.recipientName}
              </h3>
              
              <div className="w-48 h-0.5 bg-amber-300 mx-auto my-3"></div>
              
              {selectedCertificate.personImage && (
                <div className="flex justify-center my-3">
                  <img src={selectedCertificate.personImage} alt="Recipient" className="h-20 w-20 rounded-full object-cover border-4 border-amber-300" />
                </div>
              )}
              
              <div className="flex justify-center space-x-6 my-3">
                <div>
                  <p className="text-xs text-gray-500">Position</p>
                  <p className="font-semibold text-gray-800">
                    {selectedCertificate.position === 'OTHER' ? selectedCertificate.otherPosition : getPositionLabel(selectedCertificate.position)}
                  </p>
                </div>
                {selectedCertificate.workingTime && (
                  <div>
                    <p className="text-xs text-gray-500">Working Time</p>
                    <p className="font-semibold text-gray-800">{selectedCertificate.workingTime}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-6 my-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Certificate #</p>
                  <p className="font-mono text-gray-700">{selectedCertificate.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Issue Date</p>
                  <p className="text-gray-700">
                    {new Date(selectedCertificate.issueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-16 my-4">
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-gray-400 mx-auto mb-1"></div>
                  <p className="text-xs text-gray-500">Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-gray-400 mx-auto mb-1"></div>
                  <p className="text-xs text-gray-500">Church Leader</p>
                </div>
              </div>

              {selectedCertificate.additionalNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
                  <p className="font-medium">Notes:</p>
                  <p>{selectedCertificate.additionalNotes}</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">© Lean Digitally Tanzania - All Rights Reserved</p>
              </div>
            </div>
          </div>

          <div className={`p-6 border-t border-gray-200 bg-gradient-to-r ${currentTheme.light}`}>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleIssueCertificate(selectedCertificate.id)}
                className="flex-1 flex justify-center items-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <FaCertificate className="mr-2" />
                Issue Certificate
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center"
              >
                <FaDownload className="mr-2" />
                Download PDF
              </button>
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center">
                <FaPrint className="mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Certificates Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by recipient, certificate number or email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    showConfirmationModal({
                      title: 'Refresh Certificates',
                      message: 'This will refresh the certificate list from the server.',
                      confirmText: 'Refresh',
                      type: 'info',
                      onConfirm: () => {
                        toast.success('Certificates refreshed!');
                        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                      }
                    });
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
                {certificates.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    Delete All
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FaCertificate className="text-amber-500" />
                          <span className="text-sm font-medium text-gray-900">{cert.certificateNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cert.recipientName}</p>
                          <p className="text-xs text-gray-500">{cert.recipientEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{getPositionLabel(cert.position)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(cert.status)}`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <button 
                            onClick={() => handleViewCertificate(cert)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handleEditCertificate(cert)}
                            className="p-2 text-gray-500 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          {cert.status !== 'issued' && (
                            <button 
                              onClick={() => handleIssueCertificate(cert.id)}
                              className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                              title="Issue"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                          <button 
                            onClick={() => handleArchiveCertificate(cert.id)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Archive"
                          >
                            <FaArchive />
                          </button>
                          <button 
                            onClick={() => handleDeleteCertificate(cert.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add missing imports */}
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

export default CertificateAdmin;
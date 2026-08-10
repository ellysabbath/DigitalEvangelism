// src/pages/Certificates.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaAward, FaSearch, FaDownload, FaShare, 
  FaEye, FaCheckCircle, FaClock, FaPrint,
  FaCertificate, FaTimes,
  FaSpinner, FaArrowLeft, FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../auth/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
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

// ============================================================
// MAIN COMPONENT
// ============================================================

const Certificates: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);

  // ============================================================
  // API BASE URL
  // ============================================================

  const API_BASE_URL = 'https://hopeprojects.pythonanywhere.com/api/certificates/certificates';

  // ============================================================
  // GET AUTH HEADERS
  // ============================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // ============================================================
  // FETCH USER'S CERTIFICATES ONLY
  // ============================================================

  const fetchUserCertificates = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/?user_id=${user.id}`;
      
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
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      setError(err.message || t('common.error'));
      toast.error(t('certificates.loadError'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserCertificates();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchUserCertificates]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'issued':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'archived':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'issued':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'draft':
        return <FaFileAlt className="text-gray-500" />;
      case 'archived':
        return <FaTimes className="text-red-500" />;
      default:
        return null;
    }
  };

  // ============================================================
  // FILTER CERTIFICATES
  // ============================================================

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.heading?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setShowViewModal(true);
  };

  const handleDownloadPDF = (certificateId: string) => {
    window.open(`${API_BASE_URL}/${certificateId}/download_pdf/`, '_blank');
  };

  const handlePreviewPDF = (certificateId: string) => {
    window.open(`${API_BASE_URL}/${certificateId}/preview_pdf/`, '_blank');
  };

  const handleShare = (cert: Certificate) => {
    const url = `${window.location.origin}/certificates/${cert.certificate_id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t('certificates.linkCopied'));
    }).catch(() => {
      toast.success(`${t('certificates.shareLink')}: ${url}`);
    });
  };

  const handlePrint = (cert: Certificate) => {
    window.open(`${API_BASE_URL}/${cert.certificate_id}/download_pdf/`, '_blank');
  };

  // ============================================================
  // STATS
  // ============================================================

  const stats = {
    total: certificates.length,
    issued: certificates.filter(c => c.status === 'issued').length,
    pending: certificates.filter(c => c.status === 'pending').length,
    draft: certificates.filter(c => c.status === 'draft').length,
    archived: certificates.filter(c => c.status === 'archived').length,
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // NOT AUTHENTICATED
  // ============================================================

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-md">
        <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCertificate className="text-4xl text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('auth.loginTitle')}</h3>
        <p className="text-gray-500">{t('certificates.loginToView')}</p>
        <button 
          onClick={() => navigate('/login')}
          className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          {t('auth.login')}
        </button>
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
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              {t('certificates.title')}
            </h1>
            <p className="mt-1 text-gray-600">
              {t('certificates.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchUserCertificates}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaSpinner className={loading ? 'animate-spin' : ''} />
            <span>{t('common.refresh')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-cyan-500">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">{t('certificates.total')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.issued}</p>
          <p className="text-xs text-gray-500">{t('certificates.issued')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">{t('certificates.pending')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-500">
          <p className="text-2xl font-bold text-gray-600">{stats.draft + stats.archived}</p>
          <p className="text-xs text-gray-500">{t('certificates.other')}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('certificates.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('certificates.allStatus')}</option>
              <option value="issued">{t('certificates.issued')}</option>
              <option value="pending">{t('certificates.pending')}</option>
              <option value="draft">{t('certificates.draft')}</option>
              <option value="archived">{t('certificates.archived')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <div key={cert.certificate_id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaAward className="text-yellow-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {cert.heading}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(cert.status)} inline-flex items-center space-x-1`}>
                      {getStatusIcon(cert.status)}
                      <span>{cert.status_display}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">{t('certificates.certificateNumber')}:</span> {cert.certificate_number}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">{t('certificates.recipient')}:</span> {cert.recipient_name || user?.full_name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">{t('certificates.position')}:</span> {cert.display_position}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">{t('certificates.date')}:</span> {cert.issue_date_display}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">{t('certificates.workingTime')}:</span> {cert.working_time}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => handleViewCertificate(cert)}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center space-x-1"
                >
                  <FaEye className="text-xs" />
                  <span>{t('certificates.view')}</span>
                </button>
                <div className="flex space-x-2">
                  {cert.status === 'issued' && (
                    <>
                      <button 
                        onClick={() => handlePreviewPDF(cert.certificate_id)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title={t('certificates.preview')}
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(cert.certificate_id)}
                        className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
                        title={t('certificates.download')}
                      >
                        <FaDownload />
                      </button>
                      <button 
                        onClick={() => handlePrint(cert)}
                        className="p-2 text-gray-500 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                        title={t('certificates.print')}
                      >
                        <FaPrint />
                      </button>
                      <button 
                        onClick={() => handleShare(cert)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                        title={t('certificates.share')}
                      >
                        <FaShare />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCertificate className="text-4xl text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('certificates.noCertificates')}</h3>
          <p className="text-gray-500">
            {searchTerm ? t('certificates.adjustSearch') : t('certificates.earnCertificates')}
          </p>
          <button 
            onClick={() => navigate('/sermons')}
            className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
          >
            <FaArrowLeft className="mr-2 transform rotate-180" />
            {t('nav.sermons')}
          </button>
        </div>
      )}

      {/* View Certificate Modal */}
      {showViewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('certificates.details')}</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCertificate(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 rounded-xl p-6 text-white text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <FaAward className="text-4xl" />
                  </div>
                </div>
                <h4 className="text-2xl font-serif font-bold">{selectedCertificate.heading}</h4>
                <p className="text-cyan-100 mt-2">{t('certificates.certificateNumber')} #{selectedCertificate.certificate_number}</p>
                <p className="text-cyan-100 text-sm mt-1">{selectedCertificate.display_position}</p>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t('certificates.certificateNumber')}</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.certificate_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('certificates.status')}</p>
                  <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getStatusColor(selectedCertificate.status)}`}>
                    {getStatusIcon(selectedCertificate.status)}
                    <span>{selectedCertificate.status_display}</span>
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('certificates.recipient')}</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.recipient_name || user?.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('certificates.position')}</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.display_position}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('certificates.workingTime')}</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.working_time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('certificates.issueDate')}</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.issue_date_display}</p>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedCertificate.additional_notes && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">{t('certificates.additionalNotes')}</h4>
                  <p className="text-sm text-gray-600">{selectedCertificate.additional_notes}</p>
                </div>
              )}

              {/* QR Code */}
              <div className="flex justify-center pt-4 border-t border-gray-200">
                <div className="text-center">
                  <QRCodeSVG 
                    value={`${window.location.origin}/certificates/${selectedCertificate.certificate_id}`}
                    size={120}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-xs text-gray-500 mt-2">{t('certificates.scanToVerify')}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {selectedCertificate.status === 'issued' && (
                  <>
                    <button 
                      onClick={() => handlePreviewPDF(selectedCertificate.certificate_id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FaEye />
                      <span>{t('certificates.preview')}</span>
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(selectedCertificate.certificate_id)}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FaDownload />
                      <span>{t('certificates.download')}</span>
                    </button>
                    <button 
                      onClick={() => handlePrint(selectedCertificate)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FaPrint />
                      <span>{t('certificates.print')}</span>
                    </button>
                    <button 
                      onClick={() => handleShare(selectedCertificate)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FaShare />
                      <span>{t('certificates.share')}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
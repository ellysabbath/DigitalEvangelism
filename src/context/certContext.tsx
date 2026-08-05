// src/context/certContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { certApi } from '../services/certApi';
import type {
  Certificate,
  CertificateCreateData,
  CertificateUpdateData,
  CertificateFilterParams,
  CertificateStats,
  
  GenerateForUserData
} from '../types/certData';
import toast from 'react-hot-toast';

// ============================================
// CONTEXT INTERFACE
// ============================================

interface CertificateContextType {
  // State
  certificates: Certificate[];
  selectedCertificate: Certificate | null;
  stats: CertificateStats | null;
  loading: boolean;
  error: string | null;
  
  // CRUD Operations
  listCertificates: (params?: CertificateFilterParams) => Promise<Certificate[]>;
  getCertificate: (id: string) => Promise<Certificate>;
  createCertificate: (data: CertificateCreateData | FormData) => Promise<Certificate>;
  updateCertificate: (id: string, data: CertificateUpdateData | FormData) => Promise<Certificate>;
  deleteCertificate: (id: string) => Promise<void>;
  
  // Special Actions
  issueCertificate: (id: string) => Promise<void>;
  downloadPDF: (id: string) => Promise<void>;
  previewPDF: (id: string) => Promise<void>;
  regeneratePDF: (id: string) => Promise<void>;
  generateForUser: (data: GenerateForUserData) => Promise<Certificate>;
  
  // Stats
  refreshStats: () => Promise<void>;
  
  // Helpers
  refreshCertificates: () => Promise<void>;
  clearError: () => void;
  setSelectedCertificate: (cert: Certificate | null) => void;
}

// ============================================
// CREATE CONTEXT
// ============================================

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
};

// ============================================
// PROVIDER COMPONENT
// ============================================

interface CertificateProviderProps {
  children: React.ReactNode;
}

export const CertificateProvider: React.FC<CertificateProviderProps> = ({ children }) => {
  // ========== STATE ==========
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ========== LOAD INITIAL DATA ==========
  useEffect(() => {
    refreshCertificates();
    refreshStats();
  }, []);

  // ========== HELPERS ==========
  const clearError = () => setError(null);

  // ========== CRUD OPERATIONS ==========

  /**
   * List all certificates with optional filters
   */
  const listCertificates = useCallback(async (params?: CertificateFilterParams): Promise<Certificate[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.listCertificates(params);
      setCertificates(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load certificates';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a single certificate by ID
   */
  const getCertificate = useCallback(async (id: string): Promise<Certificate> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.getCertificate(id);
      setSelectedCertificate(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load certificate';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new certificate
   */
  const createCertificate = useCallback(async (data: CertificateCreateData | FormData): Promise<Certificate> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.createCertificate(data);
      setCertificates(prev => [response.data, ...prev]);
      toast.success('Certificate created successfully!');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create certificate';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a certificate
   */
  const updateCertificate = useCallback(async (id: string, data: CertificateUpdateData | FormData): Promise<Certificate> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.updateCertificate(id, data);
      setCertificates(prev => prev.map(c => c.certificate_id === id ? response.data : c));
      if (selectedCertificate?.certificate_id === id) {
        setSelectedCertificate(response.data);
      }
      toast.success('Certificate updated successfully!');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update certificate';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCertificate]);

  /**
   * Delete a certificate
   */
  const deleteCertificate = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await certApi.deleteCertificate(id);
      setCertificates(prev => prev.filter(c => c.certificate_id !== id));
      if (selectedCertificate?.certificate_id === id) {
        setSelectedCertificate(null);
      }
      toast.success('Certificate deleted successfully!');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete certificate';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCertificate]);

  // ========== SPECIAL ACTIONS ==========

  /**
   * Issue a certificate
   */
  const issueCertificate = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.issueCertificate(id);
      // Refresh the certificate to get updated status
      await getCertificate(id);
      toast.success(response.data.message || 'Certificate issued successfully!');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to issue certificate';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCertificate]);

  /**
   * Download PDF
   */
  const downloadPDF = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.downloadPDF(id);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to download PDF';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Preview PDF
   */
  const previewPDF = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.previewPDF(id);
      
      // Open PDF in new window
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      
      toast.success('PDF preview opened!');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to preview PDF';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Regenerate PDF
   */
  const regeneratePDF = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.regeneratePDF(id);
      toast.success(response.data.message || 'PDF regenerated successfully!');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to regenerate PDF';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate certificate for a user
   */
  const generateForUser = useCallback(async (data: GenerateForUserData): Promise<Certificate> => {
    setLoading(true);
    setError(null);
    try {
      const response = await certApi.generateForUser(data);
      setCertificates(prev => [response.data.certificate, ...prev]);
      toast.success(response.data.message || 'Certificate generated successfully!');
      return response.data.certificate;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to generate certificate';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== STATS ==========

  /**
   * Refresh statistics
   */
  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const response = await certApi.getStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  /**
   * Refresh certificates list
   */
  const refreshCertificates = useCallback(async (): Promise<void> => {
    try {
      await listCertificates();
    } catch (err) {
      console.error('Error refreshing certificates:', err);
    }
  }, [listCertificates]);

  // ========== CONTEXT VALUE ==========

  const value: CertificateContextType = {
    // State
    certificates,
    selectedCertificate,
    stats,
    loading,
    error,
    
    // CRUD Operations
    listCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    
    // Special Actions
    issueCertificate,
    downloadPDF,
    previewPDF,
    regeneratePDF,
    generateForUser,
    
    // Stats
    refreshStats,
    
    // Helpers
    refreshCertificates,
    clearError,
    setSelectedCertificate,
  };

  return (
    <CertificateContext.Provider value={value}>
      {children}
    </CertificateContext.Provider>
  );
};

export default CertificateProvider;
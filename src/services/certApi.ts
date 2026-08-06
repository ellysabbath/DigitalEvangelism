// src/services/certApi.ts
import apiClient from './api';  // Import the default export
import type {
  Certificate,
  CertificateCreateData,
  CertificateUpdateData,
  CertificateFilterParams,
  CertificateStats,
  CertificateFormData,
  GenerateForUserData
} from '../types/certData';

const BASE_URL = '/certificates/certificates';

// Use apiClient.api to access the axios instance
export const certApi = {
  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Get all certificates with optional filters
   */
  listCertificates: (params?: CertificateFilterParams) => 
    apiClient.api.get<Certificate[]>(BASE_URL, { params }),

  /**
   * Get a single certificate by ID
   */
  getCertificate: (id: string) => 
    apiClient.api.get<Certificate>(`${BASE_URL}/${id}/`),

  /**
   * Create a new certificate
   */
  createCertificate: (data: CertificateCreateData | FormData) => 
    apiClient.api.post<Certificate>(BASE_URL, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    }),

  /**
   * Update a certificate
   */
  updateCertificate: (id: string, data: CertificateUpdateData | FormData) => 
    apiClient.api.patch<Certificate>(`${BASE_URL}/${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    }),

  /**
   * Delete a certificate
   */
  deleteCertificate: (id: string) => 
    apiClient.api.delete(`${BASE_URL}/${id}/`),

  // ============================================
  // Special Actions
  // ============================================

  /**
   * Issue a certificate (change status to 'issued')
   */
  issueCertificate: (id: string) => 
    apiClient.api.post<{ success: boolean; message: string; certificate_number: string }>(
      `${BASE_URL}/${id}/issue/`
    ),

  /**
   * Preview PDF
   */
  previewPDF: (id: string) => 
    apiClient.api.get(`${BASE_URL}/${id}/preview_pdf/`, { 
      responseType: 'blob' 
    }),

  /**
   * Download PDF
   */
  downloadPDF: (id: string) => 
    apiClient.api.get(`${BASE_URL}/${id}/download_pdf/`, { 
      responseType: 'blob' 
    }),

  /**
   * Regenerate PDF
   */
  regeneratePDF: (id: string) => 
    apiClient.api.post<{ success: boolean; message: string; certificate_number: string }>(
      `${BASE_URL}/${id}/regenerate_pdf/`
    ),

  /**
   * Generate certificate for a specific user
   */
  generateForUser: (data: GenerateForUserData) => 
    apiClient.api.post<{ success: boolean; message: string; certificate: Certificate }>(
      `${BASE_URL}/generate_for_user/`,
      data
    ),

  // ============================================
  // Stats
  // ============================================

  /**
   * Get certificate stats
   */
  getStats: () => 
    apiClient.api.get<CertificateStats>(`${BASE_URL}/stats/`),

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Convert FormData for file uploads
   */
  toFormData: (data: CertificateFormData): FormData => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        if (value) {
          formData.append(`${key}_file`, value);
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    return formData;
  },

  /**
   * Convert base64 to File
   */
  base64ToFile: (base64: string, filename: string): File | null => {
    try {
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      return null;
    }
  },

  /**
   * Convert File to base64
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
};

export default certApi;
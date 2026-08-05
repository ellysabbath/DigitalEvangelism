// src/types/certData.ts

export interface Certificate {
  certificate_id: string;
  certificate_number: string;
  heading: string;
  logo_image: string | null;
  person_image: string | null;
  recipient_name: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  position: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'EVANGELIST' | 'PASTOR' | 'CHURCH_ADMIN' | 'OTHER';
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

export interface CertificateCreateData {
  user_id?: number;
  heading?: string;
  logo_image?: string | null;
  person_image?: string | null;
  recipient_name?: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  position?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'EVANGELIST' | 'PASTOR' | 'CHURCH_ADMIN' | 'OTHER';
  other_position?: string | null;
  working_time?: string;
  signature_person?: string | null;
  leader_signature?: string | null;
  additional_notes?: string | null;
  status?: 'draft' | 'issued' | 'pending' | 'archived';
}

export interface CertificateUpdateData {
  heading?: string;
  logo_image?: string | null;
  person_image?: string | null;
  recipient_name?: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  position?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'EVANGELIST' | 'PASTOR' | 'CHURCH_ADMIN' | 'OTHER';
  other_position?: string | null;
  working_time?: string;
  signature_person?: string | null;
  leader_signature?: string | null;
  additional_notes?: string | null;
  status?: 'draft' | 'issued' | 'pending' | 'archived';
}

export interface CertificateFilterParams {
  user_id?: number;
  position?: string;
  status?: string;
  search?: string;
  my_certificates?: boolean;
}

export interface CertificateStats {
  total: number;
  issued: number;
  pending: number;
  draft: number;
  archived: number;
  by_position: Record<string, number>;
}

export interface CertificateFormData {
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
}

export interface GenerateForUserData {
  user_id: number;
  heading?: string;
  position?: string;
  working_time?: string;
}
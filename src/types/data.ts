// src/types/data.ts

// ============================================
// USER TYPES
// ============================================
export interface User {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  role: string;
  role_display: string;
  country_code: string;
  church_name: string;
  region: string;
  city: string;
  street: string;
  profile: {
    id: number;
    profile_picture: string | null;
    profile_picture_thumbnail: string | null;
    bio: string;
    location: string;
    created_at: string;
    updated_at: string;
  };
  is_verified: boolean;
  is_active: boolean;
  is_online: boolean;
  date_joined: string;
  last_login: string | null;
  last_seen: string | null;
  full_phone_number: string;
}

export interface RegisterData {
  full_name: string;
  phone_number: string;
  email: string;
  country_code: string;
  church_name?: string;
  region: string;
  city: string;
  street?: string;
  profile?: {
    bio?: string;
    profile_picture?: string | null;
  };
}

export interface RegisterResponse {
  message: string;
  user: User;
  verification_codes: string[];
  phone_number: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  requires_verification?: boolean;
  phone_number?: string;
}

export interface VerifyResponse {
  message: string;
  access: string;
  refresh: string;
  user: User;
}

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

export interface AuthError {
  error?: string;
  [key: string]: any;
}

export interface CheckUserCodesResponse {
  exists: boolean;
  has_codes: boolean;
  is_verified?: boolean;
  full_name?: string;
  phone_number?: string;
  is_active?: boolean;
  role?: string;
  verification_codes_count?: number;
  verification_codes?: string[];
}

export interface GenerateLoginCodesResponse {
  message: string;
  verification_codes: string[];
  phone_number: string;
  user?: User;
}

// ============================================
// USER CRUD TYPES
// ============================================
export interface UserCRUD {
  id: number;
  phone_number: string;
  email: string;
  full_name: string;
  role: string;
  role_display: string;
  church_name: string;
  region: string;
  city: string;
  street: string;
  country_code: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_online: boolean;
  date_joined: string;
  last_login: string | null;
  last_seen: string | null;
  verification_codes: string[];
  profile: {
    id: number;
    profile_picture: string | null;
    profile_picture_thumbnail: string | null;
    bio: string;
    location: string;
    created_at: string;
    updated_at: string;
  };
  full_phone_number: string;
}

export interface UserCreateData {
  phone_number: string;
  email: string;
  full_name: string;
  role: string;
  password: string;
  church_name?: string;
  region: string;
  city: string;
  street?: string;
  country_code?: string;
  is_verified?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  profile?: {
    bio?: string;
    profile_picture?: string | null;
    location?: string;
  };
}

export interface UserUpdateData {
  phone_number?: string;
  email?: string;
  full_name?: string;
  role?: string;
  church_name?: string;
  region?: string;
  city?: string;
  street?: string;
  country_code?: string;
  is_verified?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  profile?: {
    bio?: string;
    profile_picture?: string | null;
    location?: string;
  };
}

export interface BulkCreateData {
  users: UserCreateData[];
}

export interface BulkCreateResponse {
  message: string;
  total_processed: number;
  total_created: number;
  total_errors: number;
  users?: UserCRUD[];
  errors?: Array<{
    index: number;
    data: any;
    error: string;
  }>;
}

export interface FilterOptions {
  roles: string[];
  regions: string[];
  cities: string[];
  churches: string[];
  filters: {
    is_verified: boolean[];
    is_active: boolean[];
    is_online: boolean[];
  };
}

export interface UserStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  online_users: number;
  role_stats: {
    evangelist: number;
    pastor: number;
    church_admin: number;
    super_admin: number;
    admin: number;
  };
  inactive_users: number;
  unverified_users: number;
}

// ============================================
// STUDENT TYPES (Matches Students/models.py)
// ============================================
export interface Student {
  id: number;
  user: User;
  full_name: string;
  email: string;
  phone: string;
  student_id: string;
  enrollment_date: string;
  graduation_date: string | null;
  is_graduated: boolean;
  exams_completed: number;
  certificates_earned: number;
  total_score: number;
  groups: number[];
  assigned_evangelist: number | null;
  status: 'active' | 'pending' | 'graduated' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface StudentStats {
  total: number;
  active: number;
  pending: number;
  graduated: number;
  average_progress: number;
  top_students: Student[];
}

// ============================================
// EVANGELIST TYPES (Matches Evangelists/models.py)
// ============================================
export interface Evangelist {
  id: number;
  user: User;
  full_name: string;
  email: string;
  phone: string;
  evangelist_id: string;
  ordination_date: string | null;
  years_of_service: number;
  ministry_name: string;
  ministry_focus: string;
  total_students: number;
  total_groups: number;
  total_certificates_issued: number;
  groups: number[];
  created_at: string;
  updated_at: string;
}

export interface EvangelistStats {
  total: number;
  active: number;
  inactive: number;
  top_evangelists: Evangelist[];
}

export interface EvangelistCreateData {
  user_id: number;
  ordination_date?: string;
  years_of_service?: number;
  ministry_name?: string;
  ministry_focus?: string;
}

export interface EvangelistUpdateData {
  ordination_date?: string;
  years_of_service?: number;
  ministry_name?: string;
  ministry_focus?: string;
}

// ============================================
// GROUP TYPES (Matches Groups/models.py)
// ============================================
export interface Group {
  id: number;
  name: string;
  type: 'evangelist' | 'student' | 'mixed';
  description: string;
  leader: number | null;
  leader_name: string;
  members: User[];
  member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupCreateData {
  name: string;
  type: 'evangelist' | 'student' | 'mixed';
  description?: string;
  leader?: number | null;
  members?: number[];
  is_active?: boolean;
}

export interface GroupUpdateData {
  name?: string;
  type?: 'evangelist' | 'student' | 'mixed';
  description?: string;
  leader?: number | null;
  members?: number[];
  is_active?: boolean;
}

// ============================================
// CERTIFICATE TYPES (Matches Certificates/models.py)
// ============================================
export interface Certificate {
  id: number;
  certificate_id: string;
  certificate_number: string;
  recipient: number;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  heading: string;
  position: string;
  working_time: string;
  logo_image: string;
  person_image: string;
  signature_person: string;
  leader_signature: string;
  additional_notes: string;
  issue_date: string;
  status: 'draft' | 'issued' | 'pending' | 'archived';
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateStats {
  total: number;
  issued: number;
  pending: number;
  draft: number;
  archived: number;
}

// ============================================
// SERMON TYPES (Matches Sermons/models.py)
// ============================================
export interface Sermon {
  id: number;
  title: string;
  topic: string;
  author: number;
  author_name: string;
  content: string;
  scripture: string;
  questions: SermonQuestion[];
  questions_count: number;
  views: number;
  likes: number;
  shares: number;
  status: 'draft' | 'published' | 'archived';
  status_display: string;
  created_at: string;
  published_at: string | null;
  updated_at: string;
}

export interface SermonQuestion {
  id: string;
  text: string;
  type: 'short_answer' | 'long_answer' | 'checkbox' | 'radio' | 'true_false';
  options?: string[];
  correctAnswer?: string | string[];
  required: boolean;
  maxScore?: number;
}

export interface SermonStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  total_views: number;
  total_questions: number;
}

// ============================================
// COMMENT TYPES (Matches Comments/models.py)
// ============================================
export interface Comment {
  id: number;
  sermon: number;
  user: number;
  user_name: string;
  user_avatar: string | null;
  content: string;
  likes: number;
  like_count: number;
  reply_count: number;
  is_liked: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent: number | null;
  replies: Comment[];
}

export interface CommentStats {
  total_comments: number;
  top_comments: Comment[];
}

// ============================================
// EVANGELISM TYPES
// ============================================
export interface EvangelismActivity {
  id: number;
  evangelist: number;
  evangelist_name: string;
  title: string;
  description: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  type: 'crusade' | 'street_evangelism' | 'home_visitation' | 'online' | 'other';
  participants_count: number;
  souls_won: number;
  follow_up_count: number;
  created_at: string;
  updated_at: string;
}

export interface EvangelismActivityStats {
  total_activities: number;
  scheduled: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  total_participants: number;
  total_souls_won: number;
  total_follow_ups: number;
}

export interface SoulWinning {
  id: number;
  evangelist: number;
  evangelist_name: string;
  person_name: string;
  phone_number: string;
  email: string;
  location: string;
  date: string;
  follow_up_date: string | null;
  follow_up_status: 'pending' | 'contacted' | 'visited' | 'saved' | 'baptized' | 'discipled';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SoulWinningStats {
  total_souls: number;
  pending_follow_up: number;
  contacted: number;
  visited: number;
  saved: number;
  baptized: number;
  discipled: number;
  weekly_target: number;
  monthly_target: number;
}

export interface EvangelismReport {
  id: number;
  evangelist: number;
  evangelist_name: string;
  report_date: string;
  souls_won: number;
  follow_ups: number;
  prayers_led: number;
  bibles_given: number;
  tracts_given: number;
  testimonies: string;
  challenges: string;
  prayer_requests: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// EXAM SUBMISSION TYPES (Sermon-based exams)
// ============================================
export interface ExamAnswer {
  questionId: string;
  answer: string | string[];
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ExamSubmission {
  id: number;
  sermon: number;
  sermon_title: string;
  student: number;
  student_name: string;
  student_email: string;
  answers: ExamAnswer[];
  total_score: number;
  max_possible_score: number;
  percentage: number;
  is_passed: boolean;
  status: 'pending' | 'graded' | 'reviewed';
  status_display: string;
  feedback: string;
  graded_by: number | null;
  graded_by_name: string | null;
  graded_at: string | null;
  time_taken: number;
  submitted_at: string;
  updated_at: string;
  questions: SermonQuestion[];
}

export interface ExamFilterParams {
  status?: 'all' | 'pending' | 'graded' | 'reviewed';
  search?: string;
  sermonId?: string;
  studentId?: string;
}

export interface ExamStats {
  total: number;
  pending: number;
  graded: number;
  reviewed: number;
  average_score: number;
  passing_rate: number;
}

export interface ExamAnalytics {
  total_submissions: number;
  average_score: number;
  passing_rate: number;
  score_distribution: {
    '0-20': number;
    '21-40': number;
    '41-60': number;
    '61-80': number;
    '81-100': number;
  };
  question_stats: Array<{
    questionId: string;
    text: string;
    averageScore: number;
    maxScore: number;
    difficulty: 'easy' | 'medium' | 'hard';
    submissionCount: number;
  }>;
  top_performers: ExamSubmission[];
}




export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: string;
  status_code?: number;
  success?: boolean;
  errors?: string[] | Record<string, string[]>;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}



// Add these to your src/types/data.ts file

// ============================================
// AUTHENTICATION TYPES
// ============================================

export interface LoginRequest {
  phone_number?: string;
  email?: string;
  password: string;
  // If using verification codes
  code?: string;
}

export interface RegisterRequest {
  full_name: string;
  phone_number: string;
  email: string;
  country_code: string;
  church_name?: string;
  region: string;
  city: string;
  street?: string;
  password?: string;
  profile?: {
    bio?: string;
    profile_picture?: string | null;
  };
}

export interface VerifyRequest {
  phone_number: string;
  code: string;
}

export interface AuthResponse {
  access?: string;
  refresh?: string;
  user: User;
  message?: string;
  requires_verification?: boolean;
  phone_number?: string;
  verification_codes?: string[];
  status?: string;
  data?: {
    access?: string;
    refresh?: string;
    user?: User;
    message?: string;
    requires_verification?: boolean;
    phone_number?: string;
  };
}

// Also add these if they're not already defined
export interface LoginData {
  username?: string;
  email?: string;
  phone_number?: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
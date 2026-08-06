// src/context/AdminContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  studentsAPI, 
  sermonsAPI, 
  crudAPI, 
  evangelistsAPI,
  groupsAPI,
  commentsAPI,
  evangelismAPI,
  examAPI
} from '../../services/api';
import type { 
  Student, 
  StudentStats, 
  Sermon, 
  SermonStats,
  UserCRUD,
  Evangelist,
  EvangelistStats,
  Group,
  Comment,
  CommentStats,
  EvangelismActivity,
  EvangelismActivityStats,
  SoulWinning,
  SoulWinningStats,
  EvangelismReport,
  ExamSubmission,
  ExamFilterParams,
  ExamStats,
  ExamAnalytics
} from '../../types/data';
import toast from 'react-hot-toast';

// ============================================
// CONTEXT INTERFACE
// ============================================
interface AdminContextType {
  // Users
  users: UserCRUD[];
  loadingUsers: boolean;
  loadingUsersError: string | null;
  
  // Students
  students: Student[];
  studentStats: StudentStats | null;
  loadingStudents: boolean;
  studentError: string | null;
  
  // Evangelists
  evangelists: Evangelist[];
  evangelistStats: EvangelistStats | null;
  loadingEvangelists: boolean;
  evangelistError: string | null;
  
  // Groups
  groups: Group[];
  loadingGroups: boolean;
  groupError: string | null;
  
  // Sermons
  sermons: Sermon[];
  sermonStats: SermonStats | null;
  loadingSermons: boolean;
  sermonError: string | null;
  
  // Comments
  comments: Comment[];
  commentStats: CommentStats | null;
  loadingComments: boolean;
  commentError: string | null;
  
  // Evangelism
  activities: EvangelismActivity[];
  activityStats: EvangelismActivityStats | null;
  souls: SoulWinning[];
  soulStats: SoulWinningStats | null;
  reports: EvangelismReport[];
  loadingEvangelism: boolean;
  evangelismError: string | null;
  
  // Exam Submissions
  examSubmissions: ExamSubmission[];
  examStats: ExamStats | null;
  loadingExams: boolean;
  examError: string | null;
  
  // Global Loading
  loading: boolean;
  
  // User Functions
  refreshUsers: () => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  activateUser: (id: number) => Promise<void>;
  deactivateUser: (id: number) => Promise<void>;
  
  // Student Functions
  refreshStudents: () => Promise<void>;
  refreshStudentStats: () => Promise<void>;
  refreshAllStudents: () => Promise<void>;
  addStudent: (student: Student) => void;
  updateStudent: (id: number, student: Student) => void;
  deleteStudent: (id: number) => Promise<void>;
  bulkDeleteStudents: (ids: number[]) => Promise<void>;
  filterStudents: (searchQuery: string, statusFilter: string) => Student[];
  getStudentStatsSummary: () => {
    total: number;
    active: number;
    pending: number;
    graduated: number;
    averageProgress: number;
  };
  getStudentStatusBadge: (student: Student) => {
    label: string;
    className: string;
    icon: React.ReactElement;
  };
  
  // Evangelist Functions
  refreshEvangelists: () => Promise<void>;
  refreshEvangelistStats: () => Promise<void>;
  refreshAllEvangelists: () => Promise<void>;
  deleteEvangelist: (id: number) => Promise<void>;
  
  // Group Functions
  refreshGroups: () => Promise<void>;
  refreshAllGroups: () => Promise<void>;
  addGroup: (group: Group) => void;
  updateGroup: (id: number, group: Group) => void;
  deleteGroup: (id: number) => Promise<void>;
  addGroupMember: (groupId: number, userId: number) => Promise<void>;
  removeGroupMember: (groupId: number, userId: number) => Promise<void>;
  
  // Sermon Functions
  refreshSermons: () => Promise<void>;
  refreshSermonStats: () => Promise<void>;
  refreshAllSermons: () => Promise<void>;
  addSermon: (sermon: Sermon) => void;
  updateSermon: (id: number, sermon: Sermon) => void;
  deleteSermon: (id: number) => Promise<void>;
  publishSermon: (id: number) => Promise<void>;
  filterSermons: (searchQuery: string, statusFilter: string, topicFilter: string) => Sermon[];
  getSermonStatsSummary: () => {
    total: number;
    published: number;
    draft: number;
    archived: number;
    totalViews: number;
    totalQuestions: number;
  };
  getSermonStatusBadge: (sermon: Sermon) => {
    label: string;
    className: string;
    icon: React.ReactElement;
  };
  
  // Comment Functions
  refreshComments: (sermonId: number) => Promise<void>;
  refreshCommentStats: (sermonId: number) => Promise<void>;
  addComment: (comment: Comment) => void;
  deleteComment: (id: number) => Promise<void>;
  likeComment: (id: number) => Promise<void>;
  
  // Evangelism Functions
  refreshActivities: () => Promise<void>;
  refreshSouls: () => Promise<void>;
  refreshReports: () => Promise<void>;
  refreshAllEvangelism: () => Promise<void>;
  addActivity: (activity: EvangelismActivity) => void;
  updateActivity: (id: number, activity: EvangelismActivity) => void;
  deleteActivity: (id: number) => Promise<void>;
  addSoul: (soul: SoulWinning) => void;
  updateSoul: (id: number, soul: SoulWinning) => void;
  deleteSoul: (id: number) => Promise<void>;
  addReport: (report: EvangelismReport) => void;
  updateReport: (id: number, report: EvangelismReport) => void;
  deleteReport: (id: number) => Promise<void>;
  
  // Exam Functions
  refreshExamSubmissions: (params?: ExamFilterParams) => Promise<void>;
  getSubmission: (id: number) => Promise<ExamSubmission>;
  gradeExamSubmission: (id: number, data: { answers: { questionId: string; score: number; feedback: string }[]; feedback?: string }) => Promise<ExamSubmission>;
  getExamStats: (sermonId: number) => Promise<ExamStats>;
  getExamAnalytics: (sermonId: number) => Promise<ExamAnalytics>;
  getStudentExams: (studentId: number) => Promise<ExamSubmission[]>;
  submitExam: (sermonId: number, data: { answers: { questionId: string; answer: string | string[]; maxScore: number }[]; timeTaken: number }) => Promise<any>;
  checkSubmission: (sermonId: number, studentId: number) => Promise<boolean>;
}

// ============================================
// CREATE CONTEXT
// ============================================
const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// ============================================
// PROVIDER COMPONENT
// ============================================
interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  // ============================================
  // STATE DECLARATIONS
  // ============================================
  
  // Users
  const [users, setUsers] = useState<UserCRUD[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingUsersError, setLoadingUsersError] = useState<string | null>(null);

  // Students
  const [students, setStudents] = useState<Student[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Evangelists
  const [evangelists, setEvangelists] = useState<Evangelist[]>([]);
  const [evangelistStats, setEvangelistStats] = useState<EvangelistStats | null>(null);
  const [loadingEvangelists, setLoadingEvangelists] = useState(false);
  const [evangelistError, setEvangelistError] = useState<string | null>(null);

  // Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // Sermons
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [sermonStats, setSermonStats] = useState<SermonStats | null>(null);
  const [loadingSermons, setLoadingSermons] = useState(false);
  const [sermonError, setSermonError] = useState<string | null>(null);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentStats, setCommentStats] = useState<CommentStats | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Evangelism
  const [activities, setActivities] = useState<EvangelismActivity[]>([]);
  const [activityStats, setActivityStats] = useState<EvangelismActivityStats | null>(null);
  const [souls, setSouls] = useState<SoulWinning[]>([]);
  const [soulStats, setSoulStats] = useState<SoulWinningStats | null>(null);
  const [reports, setReports] = useState<EvangelismReport[]>([]);
  const [loadingEvangelism, setLoadingEvangelism] = useState(false);
  const [evangelismError, setEvangelismError] = useState<string | null>(null);

  // Exam Submissions
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);

  // Global
  const [loading, setLoading] = useState(true);

  // ============================================
  // USER FUNCTIONS - FIXED
  // ============================================
// src/context/AdminContext.tsx - Fixed refreshUsers function

const refreshUsers = useCallback(async () => {
  setLoadingUsers(true);
  setLoadingUsersError(null);
  try {
    console.log('🔄 [AdminContext] Fetching users from API...');
    const response = await crudAPI.listUsers();
    console.log('📦 [AdminContext] Users API Response:', response);
    
    // Handle different response formats
    let usersData: UserCRUD[] = [];
    
    // Check if response exists
    if (response) {
      // Case 1: response.data is an array directly
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } 
      // Case 2: response.data has a results property (paginated response)
      else if (response.data && typeof response.data === 'object' && 'results' in response.data && Array.isArray(response.data.results)) {
        usersData = response.data.results;
      } 
      // Case 3: response.data has a data property that is an array
      else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      }
      // Case 4: response itself is an array (if axios returns array directly)
      else if (Array.isArray(response)) {
        usersData = response;
      }
      // Case 5: response has results property (if response is not wrapped in data)
      else if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        usersData = response.results;
      }
    }
    
    console.log(`[AdminContext] Processed ${usersData.length} users`);
    console.log(' [AdminContext] Users data:', usersData);
    
    setUsers(usersData);
    
    if (usersData.length === 0) {
      console.warn('[AdminContext] No users found in the system');
    }
  } catch (err: any) {
    console.error(' [AdminContext] Error fetching users:', err);
    const message = err.response?.data?.error || err.message || 'Failed to load users';
    setLoadingUsersError(message);
    toast.error(message);
  } finally {
    setLoadingUsers(false);
  }
}, []);

  const deleteUser = useCallback(async (id: number) => {
    try {
      await crudAPI.deleteUser(id);
      await refreshUsers();
      toast.success('User deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete user';
      toast.error(message);
      throw err;
    }
  }, [refreshUsers]);

  const activateUser = useCallback(async (id: number) => {
    try {
      await crudAPI.activateUser(id);
      await refreshUsers();
      toast.success('User activated successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to activate user';
      toast.error(message);
      throw err;
    }
  }, [refreshUsers]);

  const deactivateUser = useCallback(async (id: number) => {
    try {
      await crudAPI.deactivateUser(id);
      await refreshUsers();
      toast.success('User deactivated successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to deactivate user';
      toast.error(message);
      throw err;
    }
  }, [refreshUsers]);

  // ============================================
  // STUDENT FUNCTIONS
  // ============================================
  const refreshAllStudents = useCallback(async () => {
    setLoadingStudents(true);
    setStudentError(null);
    try {
      const [studentsRes, statsRes] = await Promise.all([
        studentsAPI.list(),
        studentsAPI.stats()
      ]);
      setStudents(studentsRes.data);
      setStudentStats(statsRes.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load students';
      setStudentError(message);
      toast.error(message);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const refreshStudents = useCallback(async () => {
    setLoadingStudents(true);
    setStudentError(null);
    try {
      const response = await studentsAPI.list();
      setStudents(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load students';
      setStudentError(message);
      toast.error(message);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const refreshStudentStats = useCallback(async () => {
    try {
      const response = await studentsAPI.stats();
      setStudentStats(response.data);
    } catch (err: any) {
      console.error('Error fetching student stats:', err);
    }
  }, []);

  const addStudent = (student: Student) => {
    setStudents(prev => [student, ...prev]);
    refreshStudentStats();
  };

  const updateStudent = (id: number, updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
    refreshStudentStats();
  };

  const deleteStudent = useCallback(async (id: number) => {
    try {
      await studentsAPI.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      refreshStudentStats();
      toast.success('Student deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete student';
      toast.error(message);
      throw err;
    }
  }, [refreshStudentStats]);

  const bulkDeleteStudents = useCallback(async (ids: number[]) => {
    if (ids.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    try {
      await studentsAPI.bulkDelete(ids);
      setStudents(prev => prev.filter(s => !ids.includes(s.id)));
      refreshStudentStats();
      toast.success(`${ids.length} student(s) deleted successfully`);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete students';
      toast.error(message);
      throw err;
    }
  }, [refreshStudentStats]);

  const filterStudents = useCallback((searchQuery: string, statusFilter: string): Student[] => {
    return students.filter(student => {
      const matchesSearch = 
        student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone?.includes(searchQuery) ||
        student.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students]);

  const getStudentStatsSummary = useCallback(() => {
    if (!studentStats) {
      return { total: 0, active: 0, pending: 0, graduated: 0, averageProgress: 0 };
    }
    return {
      total: studentStats.total || 0,
      active: studentStats.active || 0,
      pending: studentStats.pending || 0,
      graduated: studentStats.graduated || 0,
      averageProgress: studentStats.average_progress || 0
    };
  }, [studentStats]);

  const getStudentStatusBadge = useCallback((student: Student) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactElement; }> = {
      active: { label: 'Active', className: 'bg-green-100 text-green-700', icon: <span className="mr-1">+</span> },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700', icon: <span className="mr-1">!</span> },
      graduated: { label: 'Graduated', className: 'bg-blue-100 text-blue-700', icon: <span className="mr-1">*</span> },
      completed: { label: 'Completed', className: 'bg-purple-100 text-purple-700', icon: <span className="mr-1">#</span> },
    };
    return statusMap[student.status] || statusMap.pending;
  }, []);

  // ============================================
  // EVANGELIST FUNCTIONS
  // ============================================
  const refreshAllEvangelists = useCallback(async () => {
    setLoadingEvangelists(true);
    setEvangelistError(null);
    try {
      const [evangelistsRes, statsRes] = await Promise.all([
        evangelistsAPI.list(),
        evangelistsAPI.stats()
      ]);
      setEvangelists(evangelistsRes.data);
      setEvangelistStats(statsRes.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load evangelists';
      setEvangelistError(message);
      toast.error(message);
    } finally {
      setLoadingEvangelists(false);
    }
  }, []);

  const refreshEvangelists = useCallback(async () => {
    setLoadingEvangelists(true);
    setEvangelistError(null);
    try {
      const response = await evangelistsAPI.list();
      setEvangelists(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load evangelists';
      setEvangelistError(message);
      toast.error(message);
    } finally {
      setLoadingEvangelists(false);
    }
  }, []);

  const refreshEvangelistStats = useCallback(async () => {
    try {
      const response = await evangelistsAPI.stats();
      setEvangelistStats(response.data);
    } catch (err: any) {
      console.error('Error fetching evangelist stats:', err);
    }
  }, []);

  const deleteEvangelist = useCallback(async (id: number) => {
    try {
      await evangelistsAPI.delete(id);
      setEvangelists(prev => prev.filter(e => e.id !== id));
      refreshEvangelistStats();
      toast.success('Evangelist deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete evangelist';
      toast.error(message);
      throw err;
    }
  }, [refreshEvangelistStats]);

  // ============================================
  // GROUP FUNCTIONS
  // ============================================
  const refreshAllGroups = useCallback(async () => {
    setLoadingGroups(true);
    setGroupError(null);
    try {
      const response = await groupsAPI.list();
      setGroups(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load groups';
      setGroupError(message);
      toast.error(message);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const refreshGroups = useCallback(async () => {
    setLoadingGroups(true);
    setGroupError(null);
    try {
      const response = await groupsAPI.list();
      setGroups(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load groups';
      setGroupError(message);
      toast.error(message);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const addGroup = (group: Group) => {
    setGroups(prev => [group, ...prev]);
  };

  const updateGroup = (id: number, updatedGroup: Group) => {
    setGroups(prev => prev.map(g => g.id === id ? updatedGroup : g));
  };

  const deleteGroup = useCallback(async (id: number) => {
    try {
      await groupsAPI.delete(id);
      setGroups(prev => prev.filter(g => g.id !== id));
      toast.success('Group deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete group';
      toast.error(message);
      throw err;
    }
  }, []);

  const addGroupMember = useCallback(async (groupId: number, userId: number) => {
    try {
      await groupsAPI.addMember(groupId, userId);
      await refreshAllGroups();
      toast.success('Member added to group');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to add member';
      toast.error(message);
      throw err;
    }
  }, [refreshAllGroups]);

  const removeGroupMember = useCallback(async (groupId: number, userId: number) => {
    try {
      await groupsAPI.removeMember(groupId, userId);
      await refreshAllGroups();
      toast.success('Member removed from group');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to remove member';
      toast.error(message);
      throw err;
    }
  }, [refreshAllGroups]);

  // ============================================
  // SERMON FUNCTIONS
  // ============================================
  const refreshAllSermons = useCallback(async () => {
    setLoadingSermons(true);
    setSermonError(null);
    try {
      const [sermonsRes, statsRes] = await Promise.all([
        sermonsAPI.list(),
        sermonsAPI.stats()
      ]);
      setSermons(sermonsRes.data);
      setSermonStats(statsRes.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load sermons';
      setSermonError(message);
      toast.error(message);
    } finally {
      setLoadingSermons(false);
    }
  }, []);

  const refreshSermons = useCallback(async () => {
    setLoadingSermons(true);
    setSermonError(null);
    try {
      const response = await sermonsAPI.list();
      setSermons(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load sermons';
      setSermonError(message);
      toast.error(message);
    } finally {
      setLoadingSermons(false);
    }
  }, []);

  const refreshSermonStats = useCallback(async () => {
    try {
      const response = await sermonsAPI.stats();
      setSermonStats(response.data);
    } catch (err: any) {
      console.error('Error fetching sermon stats:', err);
    }
  }, []);

  const addSermon = (sermon: Sermon) => {
    setSermons(prev => [sermon, ...prev]);
    refreshSermonStats();
  };

  const updateSermon = (id: number, updatedSermon: Sermon) => {
    setSermons(prev => prev.map(s => s.id === id ? updatedSermon : s));
    refreshSermonStats();
  };

  const deleteSermon = useCallback(async (id: number) => {
    try {
      await sermonsAPI.delete(id);
      setSermons(prev => prev.filter(s => s.id !== id));
      refreshSermonStats();
      toast.success('Sermon deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete sermon';
      toast.error(message);
      throw err;
    }
  }, [refreshSermonStats]);

  const publishSermon = useCallback(async (id: number) => {
    try {
      await sermonsAPI.publish(id);
      await refreshSermons();
      await refreshSermonStats();
      toast.success('Sermon published successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to publish sermon';
      toast.error(message);
      throw err;
    }
  }, [refreshSermons, refreshSermonStats]);

  const filterSermons = useCallback((searchQuery: string, statusFilter: string, topicFilter: string): Sermon[] => {
    return sermons.filter(sermon => {
      const matchesSearch = 
        sermon.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sermon.status === statusFilter;
      const matchesTopic = topicFilter === 'all' || sermon.topic?.toLowerCase().includes(topicFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesTopic;
    });
  }, [sermons]);

  const getSermonStatsSummary = useCallback(() => {
    if (!sermonStats) {
      return { total: 0, published: 0, draft: 0, archived: 0, totalViews: 0, totalQuestions: 0 };
    }
    return {
      total: sermonStats.total || 0,
      published: sermonStats.published || 0,
      draft: sermonStats.draft || 0,
      archived: sermonStats.archived || 0,
      totalViews: sermonStats.total_views || 0,
      totalQuestions: sermonStats.total_questions || 0
    };
  }, [sermonStats]);

  const getSermonStatusBadge = useCallback((sermon: Sermon) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactElement; }> = {
      published: { label: 'Published', className: 'bg-green-100 text-green-700', icon: <span className="mr-1">+</span> },
      draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-700', icon: <span className="mr-1">!</span> },
      archived: { label: 'Archived', className: 'bg-gray-100 text-gray-700', icon: <span className="mr-1">-</span> },
    };
    return statusMap[sermon.status] || statusMap.draft;
  }, []);

  // ============================================
  // COMMENT FUNCTIONS
  // ============================================
  const refreshComments = useCallback(async (sermonId: number) => {
    setLoadingComments(true);
    setCommentError(null);
    try {
      const response = await commentsAPI.list(sermonId);
      setComments(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load comments';
      setCommentError(message);
      toast.error(message);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const refreshCommentStats = useCallback(async (sermonId: number) => {
    try {
      const response = await commentsAPI.stats(sermonId);
      setCommentStats(response.data);
    } catch (err: any) {
      console.error('Error fetching comment stats:', err);
    }
  }, []);

  const addComment = (comment: Comment) => {
    setComments(prev => [comment, ...prev]);
  };

  const deleteComment = useCallback(async (id: number) => {
    try {
      await commentsAPI.delete(id);
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success('Comment deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete comment';
      toast.error(message);
      throw err;
    }
  }, []);

  const likeComment = useCallback(async (id: number) => {
    try {
      const response = await commentsAPI.like(id);
      setComments(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, likes: response.data.likes, is_liked: response.data.is_liked };
        }
        return c;
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to like comment';
      toast.error(message);
      throw err;
    }
  }, []);

  // ============================================
  // EVANGELISM FUNCTIONS
  // ============================================
  const refreshActivities = useCallback(async () => {
    try {
      const response = await evangelismAPI.activities.list();
      setActivities(response.data);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
    }
  }, []);

  const refreshSouls = useCallback(async () => {
    try {
      const response = await evangelismAPI.souls.list();
      setSouls(response.data);
    } catch (err: any) {
      console.error('Error fetching souls:', err);
    }
  }, []);

  const refreshReports = useCallback(async () => {
    try {
      const response = await evangelismAPI.reports.list();
      setReports(response.data);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
    }
  }, []);

  const refreshAllEvangelism = useCallback(async () => {
    setLoadingEvangelism(true);
    setEvangelismError(null);
    try {
      const [activitiesRes, soulsRes, reportsRes, activityStatsRes, soulStatsRes] = await Promise.all([
        evangelismAPI.activities.list(),
        evangelismAPI.souls.list(),
        evangelismAPI.reports.list(),
        evangelismAPI.activities.stats(),
        evangelismAPI.souls.stats(),
      ]);
      setActivities(activitiesRes.data);
      setSouls(soulsRes.data);
      setReports(reportsRes.data);
      setActivityStats(activityStatsRes.data);
      setSoulStats(soulStatsRes.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load evangelism data';
      setEvangelismError(message);
      toast.error(message);
    } finally {
      setLoadingEvangelism(false);
    }
  }, []);

  const addActivity = (activity: EvangelismActivity) => {
    setActivities(prev => [activity, ...prev]);
  };

  const updateActivity = (id: number, updatedActivity: EvangelismActivity) => {
    setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
  };

  const deleteActivity = useCallback(async (id: number) => {
    await evangelismAPI.activities.delete(id);
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success('Activity deleted successfully');
  }, []);

  const addSoul = (soul: SoulWinning) => {
    setSouls(prev => [soul, ...prev]);
  };

  const updateSoul = (id: number, updatedSoul: SoulWinning) => {
    setSouls(prev => prev.map(s => s.id === id ? updatedSoul : s));
  };

  const deleteSoul = useCallback(async (id: number) => {
    await evangelismAPI.souls.delete(id);
    setSouls(prev => prev.filter(s => s.id !== id));
    toast.success('Soul record deleted successfully');
  }, []);

  const addReport = (report: EvangelismReport) => {
    setReports(prev => [report, ...prev]);
  };

  const updateReport = (id: number, updatedReport: EvangelismReport) => {
    setReports(prev => prev.map(r => r.id === id ? updatedReport : r));
  };

  const deleteReport = useCallback(async (id: number) => {
    await evangelismAPI.reports.delete(id);
    setReports(prev => prev.filter(r => r.id !== id));
    toast.success('Report deleted successfully');
  }, []);

  // ============================================
  // EXAM FUNCTIONS
  // ============================================
  const refreshExamSubmissions = useCallback(async (params?: ExamFilterParams) => {
    setLoadingExams(true);
    setExamError(null);
    try {
      const response = await examAPI.listSubmissions(params);
      setExamSubmissions(response.data.results || response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load exam submissions';
      setExamError(message);
      toast.error(message);
    } finally {
      setLoadingExams(false);
    }
  }, []);

  const getSubmission = useCallback(async (id: number): Promise<ExamSubmission> => {
    try {
      const response = await examAPI.getSubmission(id);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to load submission';
      toast.error(message);
      throw err;
    }
  }, []);

  const gradeExamSubmission = useCallback(async (id: number, data: { 
    answers: { questionId: string; score: number; feedback: string }[]; 
    feedback?: string 
  }): Promise<ExamSubmission> => {
    try {
      const response = await examAPI.gradeSubmission(id, data);
      toast.success('Exam graded successfully!');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to grade exam';
      toast.error(message);
      throw err;
    }
  }, []);

  const getExamStats = useCallback(async (sermonId: number): Promise<ExamStats> => {
    try {
      const response = await examAPI.getSubmissionStats(sermonId);
      setExamStats(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching exam stats:', err);
      toast.error('Failed to load exam stats');
      throw err;
    }
  }, []);

  const getExamAnalytics = useCallback(async (sermonId: number): Promise<ExamAnalytics> => {
    try {
      const response = await examAPI.getExamAnalytics(sermonId);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching exam analytics:', err);
      toast.error('Failed to load analytics');
      throw err;
    }
  }, []);

  const getStudentExams = useCallback(async (studentId: number): Promise<ExamSubmission[]> => {
    try {
      const response = await examAPI.getStudentExams(studentId);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching student exams:', err);
      toast.error('Failed to load student exams');
      throw err;
    }
  }, []);

  const submitExam = useCallback(async (sermonId: number, data: { 
    answers: { questionId: string; answer: string | string[]; maxScore: number }[];
    timeTaken: number;
  }): Promise<any> => {
    try {
      const response = await examAPI.submitExam(sermonId, data);
      toast.success('Exam submitted successfully!');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to submit exam';
      toast.error(message);
      throw err;
    }
  }, []);

  const checkSubmission = useCallback(async (sermonId: number, studentId: number): Promise<boolean> => {
    try {
      const response = await examAPI.checkSubmission(sermonId, studentId);
      return response.data.submitted || false;
    } catch (err: any) {
      console.error('Error checking submission:', err);
      return false;
    }
  }, []);

  // ============================================
  // INITIAL LOAD
  // ============================================
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([
          refreshAllStudents(),
          refreshAllEvangelists(),
          refreshAllGroups(),
          refreshAllSermons(),
          refreshAllEvangelism(),
          refreshUsers(),
          refreshExamSubmissions()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AdminContextType = {
    // Users
    users,
    loadingUsers,
    loadingUsersError: loadingUsersError,
    
    // Students
    students,
    studentStats,
    loadingStudents,
    studentError,
    
    // Evangelists
    evangelists,
    evangelistStats,
    loadingEvangelists,
    evangelistError,
    
    // Groups
    groups,
    loadingGroups,
    groupError,
    
    // Sermons
    sermons,
    sermonStats,
    loadingSermons,
    sermonError,
    
    // Comments
    comments,
    commentStats,
    loadingComments,
    commentError,
    
    // Evangelism
    activities,
    activityStats,
    souls,
    soulStats,
    reports,
    loadingEvangelism,
    evangelismError,
    
    // Exam Submissions
    examSubmissions,
    examStats,
    loadingExams,
    examError,
    
    // Global
    loading,
    
    // User Functions
    refreshUsers,
    deleteUser,
    activateUser,
    deactivateUser,
    
    // Student Functions
    refreshStudents,
    refreshStudentStats,
    refreshAllStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkDeleteStudents,
    filterStudents,
    getStudentStatsSummary,
    getStudentStatusBadge,
    
    // Evangelist Functions
    refreshEvangelists,
    refreshEvangelistStats,
    refreshAllEvangelists,
    deleteEvangelist,
    
    // Group Functions
    refreshGroups,
    refreshAllGroups,
    addGroup,
    updateGroup,
    deleteGroup,
    addGroupMember,
    removeGroupMember,
    
    // Sermon Functions
    refreshSermons,
    refreshSermonStats,
    refreshAllSermons,
    addSermon,
    updateSermon,
    deleteSermon,
    publishSermon,
    filterSermons,
    getSermonStatsSummary,
    getSermonStatusBadge,
    
    // Comment Functions
    refreshComments,
    refreshCommentStats,
    addComment,
    deleteComment,
    likeComment,
    
    // Evangelism Functions
    refreshActivities,
    refreshSouls,
    refreshReports,
    refreshAllEvangelism,
    addActivity,
    updateActivity,
    deleteActivity,
    addSoul,
    updateSoul,
    deleteSoul,
    addReport,
    updateReport,
    deleteReport,
    
    // Exam Functions
    refreshExamSubmissions,
    getSubmission,
    gradeExamSubmission,
    getExamStats,
    getExamAnalytics,
    getStudentExams,
    submitExam,
    checkSubmission,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
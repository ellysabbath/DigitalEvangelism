// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { AuthProvider } from './auth/context/AuthContext';
import { AdminProvider } from './auth/context/AdminContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Destinations from './pages/Destinations';
import Activities from './pages/Activities';
import Accommodation from './pages/Accommodation';
import Contact from './pages/Contact';
import News from './pages/News';
import Gallery from './pages/Gallery';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import VerifyAccount from './pages/auth/VerifyAccount';
import AdminDashboard from './pages/admin/AdminDashboard';
import GroupsManagement from './pages/admin/GroupsManagement';
import EvangelistsManagement from './pages/admin/EvangelistsManagement';
import StudentsManagement from './pages/admin/StudentsManagement';
import SermonsManagement from './pages/admin/SermonsManagement';
import CreateGroup from './pages/admin/CreateGroup';
import CreateSermon from './pages/admin/CreateSermon';
import EditGroup from './pages/admin/EditGroup';
import EditSermon from './pages/admin/EditSermon';
import ViewSermon from './pages/admin/ViewSermon';
import ViewStudent from './pages/admin/ViewStudent';
import Certificates from './pages/Certificates';
import EvangelistDashboard from './pages/evangelist/EvangelistDashboard';
import ExamManagement from './pages/evangelist/ExamManagement';
import MyExams from './pages/student/MyExams';
import JoinSermon from './pages/JoinSermon';
import Dashboard from './pages/Dashboard';
import Sermons from './pages/Sermons';
import SermonDetail from './pages/SermonDetail';
import GroupsView from './pages/admin/GroupsView';
import UserManagement from './pages/admin/UserManagement';
import CertificateManagement from './pages/admin/CertificateManagement';
import Profile from './pages/Profile';
import StudentDashboard from './pages/student/StudentDashboard';
import SubscriptionsManagement from './pages/admin/SubscriptionsManagement';

// Import i18n
import i18n from './i18n';


// Loading component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <AuthProvider>
          <AdminProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Auth Routes - Outside Layout */}
                <Route path="/join" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify" element={<VerifyAccount />} />
                
                {/* Main App Routes with Layout */}
                <Route path="/" element={<Layout />}>
                  {/* Public Pages */}
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="destinations" element={<Destinations />} />
                  <Route path="activities" element={<Activities />} />
                  <Route path="accommodation" element={<Accommodation />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="news" element={<News />} />
                  <Route path="gallery" element={<Gallery />} />
                  <Route path="profile" element={<Profile />} />
                  
                  {/* Sermon Public Pages */}
                  <Route path="sermons" element={<Sermons />} />
                  <Route path="sermons/:id" element={<SermonDetail />} />
                  <Route path="join/:sermonId" element={<JoinSermon />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="students" element={<StudentDashboard />} />
                  <Route path="/admin/subscriptions" element={<SubscriptionsManagement />} />
                  
                  {/* Student Pages */}
                  <Route path="student/exams" element={<MyExams />} />
                  
                  {/* Evangelist Pages */}
                  <Route path="ev/dashboard" element={<EvangelistDashboard />} />
                  <Route path="evangelist/exams" element={<ExamManagement />} />
                  <Route path="evangelist/exams/:id" element={<ExamManagement />} />
                  
                  {/* Admin Pages */}
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/users" element={<UserManagement />} />
                  <Route path="admin/groups" element={<GroupsManagement />} />
                  <Route path="admin/groups/:id" element={<GroupsView />} />
                  <Route path="admin/evangelists" element={<EvangelistsManagement />} />
                  <Route path="admin/students" element={<StudentsManagement />} />
                  <Route path="admin/sermons" element={<SermonsManagement />} />
                  <Route path="certificates" element={<Certificates />} />
                  <Route path="admin/issue-certificate" element={<CertificateManagement />} />
                  
                  {/* Admin CRUD Routes */}
                  <Route path="admin/create-group" element={<CreateGroup />} />
                  <Route path="admin/create-sermon" element={<CreateSermon />} />
                  <Route path="admin/sermons/create" element={<CreateSermon />} />
                  <Route path="admin/groups/edit/:id" element={<EditGroup />} />
                  <Route path="admin/sermons/edit/:id" element={<EditSermon />} />
                  <Route path="admin/sermons/:id" element={<ViewSermon />} />
                  <Route path="admin/students/:id" element={<ViewStudent />} />
                  
                  {/* 404 - Catch all */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </AdminProvider>
        </AuthProvider>
      </Router>
    </I18nextProvider>
  );
};

// NotFound Component with Translation
const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('common.error')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t('nav.home')}
        </Link>
      </div>
    </div>
  );
};

export default App;
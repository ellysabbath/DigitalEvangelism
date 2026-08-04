// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/context/AuthContext';
import { AdminProvider } from './auth/context/AdminContext';  // FIXED: Correct import path
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

// Admin Pages
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
import IssueCertificate from './pages/admin/IssueCertificate';

// Evangelist Pages
import EvangelistDashboard from './pages/evangelist/EvangelistDashboard';

import ExamManagement from './pages/evangelist/ExamManagement';

// Student Pages
import MyExams from './pages/student/MyExams';

// Public Pages
import JoinSermon from './pages/JoinSermon';
import Dashboard from './pages/Dashboard';
import Sermons from './pages/Sermons';
import SermonDetail from './pages/SermonDetail';
import GroupsView from './pages/admin/GroupsView';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
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
              
              {/* Sermon Public Pages */}
              <Route path="sermons" element={<Sermons />} />
              <Route path="sermons/:id" element={<SermonDetail />} />
              <Route path="join/:sermonId" element={<JoinSermon />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Student Pages */}
              <Route path="student/exams" element={<MyExams />} />
              
              {/* Evangelist Pages */}
              <Route path="ev/dashboard" element={<EvangelistDashboard />} />
             
              <Route path="evangelist/exams" element={<ExamManagement />} />
              <Route path="evangelist/exams/:id" element={<ExamManagement />} />
              
              {/* Admin Pages */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/groups" element={<GroupsManagement />} />
              <Route path="admin/groups/:id" element={<GroupsView />} />  {/* ADD THIS LINE */}
              <Route path="admin/evangelists" element={<EvangelistsManagement />} />
              <Route path="admin/students" element={<StudentsManagement />} />
              <Route path="admin/sermons" element={<SermonsManagement />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="admin/issue-certificate" element={<IssueCertificate />} />
              
              {/* Admin CRUD Routes - Static routes BEFORE dynamic routes */}
              <Route path="admin/create-group" element={<CreateGroup />} />
              <Route path="admin/create-sermon" element={<CreateSermon />} />
              <Route path="admin/sermons/create" element={<CreateSermon />} />
              <Route path="admin/groups/edit/:id" element={<EditGroup />} />
              <Route path="admin/sermons/edit/:id" element={<EditSermon />} />
              
              {/* Dynamic routes - These come AFTER static routes */}
              <Route path="admin/sermons/:id" element={<ViewSermon />} />
              <Route path="admin/students/:id" element={<ViewStudent />} />
              
              {/* 404 - Catch all */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
};

// NotFound Component
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default App;
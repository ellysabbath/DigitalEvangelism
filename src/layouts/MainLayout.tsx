// src/layouts/MainLayout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { useTheme } from '../auth/context/ThemeContext';
import { FaUser, FaSignOutAlt, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated, userRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavigation = () => {
    const common = [
      { to: '/', label: 'Dashboard' },
      { to: '/sermons', label: 'Sermons' },
      { to: '/groups', label: 'Groups' },
    ];

    const roleBased = {
      admin: [
        ...common,
        { to: '/admin/students', label: 'Students' },
        { to: '/admin/evangelists', label: 'Evangelists' },
        { to: '/admin/certificates', label: 'Certificates' },
      ],
      evangelist: [
        ...common,
        { to: '/evangelist/students', label: 'My Students' },
        { to: '/evangelist/exams', label: 'Exams to Grade' },
      ],
      student: [
        ...common,
        { to: '/student/exams', label: 'My Exams' },
        { to: '/student/certificates', label: 'Certificates' },
      ],
    };

    return userRole ? roleBased[userRole as keyof typeof roleBased] || common : common;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-serif text-church-gold">✝</span>
                <span className="text-xl font-serif font-bold text-primary-700 dark:text-primary-400">
                  Digital Evangelism
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {navigation.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                  </button>
                  <div className="flex items-center space-x-3 ml-4">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <span className="text-sm font-medium hidden lg:inline">
                        {user?.fullName}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <FaSignOutAlt />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {navigation.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-base font-medium"
                  >
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>© 2026 Digital Evangelism System. All rights reserved.</p>
            <p className="mt-1">Empowering believers to spread the Gospel worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
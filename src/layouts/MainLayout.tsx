// src/layouts/MainLayout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { useTheme } from '../auth/context/ThemeContext';
import { FaSignOutAlt, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user role from user object
  const userRole = user?.role || user?.role_display || '';

  const getNavigation = () => {
    const common = [
      { to: '/', label: 'Dashboard' },
      { to: '/sermons', label: 'Sermons' },
      { to: '/groups', label: 'Groups' },
    ];

    const roleBased: Record<string, Array<{ to: string; label: string }>> = {
      admin: [
        ...common,
        { to: '/admin/students', label: 'Students' },
        { to: '/admin/evangelists', label: 'Evangelists' },
        { to: '/admin/certificates', label: 'Certificates' },
        { to: '/admin/users', label: 'Users' },
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
      church_admin: [
        ...common,
        { to: '/admin/students', label: 'Students' },
        { to: '/admin/evangelists', label: 'Evangelists' },
      ],
      super_admin: [
        ...common,
        { to: '/admin/students', label: 'Students' },
        { to: '/admin/evangelists', label: 'Evangelists' },
        { to: '/admin/certificates', label: 'Certificates' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/settings', label: 'Settings' },
      ],
    };

    return userRole ? roleBased[userRole as keyof typeof roleBased] || common : common;
  };

  const navigation = getNavigation();

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.full_name || user.phone_number || 'User';
  };

  // Get user profile picture from profile object
  const getUserProfilePicture = () => {
    if (!user) return null;
    // Access profile picture through the profile object
    return user.profile?.profile_picture || 
           user.profile?.profile_picture_thumbnail || 
           null;
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.full_name || '';
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return (user.phone_number || 'U').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
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
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                  </button>
                  <div className="flex items-center space-x-3 ml-4">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center overflow-hidden">
                        {getUserProfilePicture() ? (
                          <img
                            src={getUserProfilePicture()!}
                            alt={getUserDisplayName()}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {getUserInitials()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium hidden lg:inline">
                        {getUserDisplayName()}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      aria-label="Logout"
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
                aria-label="Toggle menu"
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
                  {/* Mobile user info */}
                  <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center overflow-hidden">
                      {getUserProfilePicture() ? (
                        <img
                          src={getUserProfilePicture()!}
                          alt={getUserDisplayName()}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {getUserInitials()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {userRole || 'User'}
                      </p>
                    </div>
                  </div>
                  
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Digital Evangelism System. All rights reserved.</p>
            <p className="mt-1">Empowering believers to spread the Gospel worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
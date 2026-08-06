// src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { 
  RiLoginBoxLine, 
  
  RiHomeLine,
  RiDashboardLine,
  RiUserLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiBookLine,
  RiAwardLine,
  RiGroupLine,
  RiBarChartLine,
  RiUserStarLine,
  RiGraduationCapLine,
  RiFileListLine,
  RiAdminLine,
  RiUserSettingsLine,
  
  RiNewspaperLine,

  RiMenuLine,
  RiCloseLine
} from 'react-icons/ri';
import { FaChevronDown, FaSpinner } from 'react-icons/fa';
import aptecLogo from '../assets/aptec.jpg';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface DropdownLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  divider?: boolean;
}

// ============================================
// HEADER COMPONENT
// ============================================

const Header: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ============================================
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // GET DROPDOWN LINKS BASED ON ROLE
  // ============================================

  const getDropdownLinks = (): DropdownLink[] => {
    const role = user?.role || 'student';
    
    const commonLinks: DropdownLink[] = [
      { to: '/dashboard', label: 'Dashboard', icon: <RiDashboardLine /> },
      { to: '/profile', label: 'Profile', icon: <RiUserLine /> },
      { to: '/settings', label: 'Settings', icon: <RiSettingsLine /> },
      { to: '/sermons', label: 'My Sermons', icon: <RiBookLine /> },
      { to: '/certificates', label: 'My Certificates', icon: <RiAwardLine /> },
    ];

    const roleLinks: Record<string, DropdownLink[]> = {
      admin: [
        { to: '/admin', label: 'Admin Dashboard', icon: <RiAdminLine /> },
        { to: '/admin/users', label: 'Manage Users', icon: <RiUserSettingsLine /> },
        { to: '/admin/groups', label: 'Manage Groups', icon: <RiGroupLine /> },
        { to: '/admin/evangelists', label: 'Manage Evangelists', icon: <RiUserStarLine /> },
        { to: '/admin/students', label: 'Manage Students', icon: <RiGraduationCapLine /> },
        { to: '/admin/sermons', label: 'Manage Sermons', icon: <RiBookLine /> },
        { to: '/admin/certificates', label: 'Certificate Management', icon: <RiAwardLine /> },
        { to: '/admin/subscriptions', label: 'Subscriptions', icon: <RiNewspaperLine /> },
        { divider: true } as DropdownLink,
      ],
      evangelist: [
        { to: '/ev/dashboard', label: 'Evangelist Dashboard', icon: <RiBarChartLine /> },
        { to: '/admin/students', label: 'My Students', icon: <RiGraduationCapLine /> },
        { to: '/admin/groups', label: 'My Groups', icon: <RiGroupLine /> },
        { to: '/admin/sermons', label: 'My Sermons', icon: <RiBookLine /> },
        { to: '/evangelist/exams', label: 'Exam Management', icon: <RiFileListLine /> },
        { divider: true } as DropdownLink,
      ],
      student: [
        { to: '/students', label: 'Student Dashboard', icon: <RiGraduationCapLine /> },
        { to: '/student/exams', label: 'My Exams', icon: <RiFileListLine /> },
        { to: '/admin/groups', label: 'My Groups', icon: <RiGroupLine /> },
        { divider: true } as DropdownLink,
      ],
      church_admin: [
        { to: '/admin', label: 'Church Dashboard', icon: <RiAdminLine /> },
        { to: '/admin/students', label: 'Students', icon: <RiGraduationCapLine /> },
        { to: '/admin/evangelists', label: 'Evangelists', icon: <RiUserStarLine /> },
        { to: '/admin/groups', label: 'Groups', icon: <RiGroupLine /> },
        { to: '/admin/sermons', label: 'Sermons', icon: <RiBookLine /> },
        { divider: true } as DropdownLink,
      ],
      super_admin: [
        { to: '/admin', label: 'Admin Dashboard', icon: <RiAdminLine /> },
        { to: '/admin/users', label: 'User Management', icon: <RiUserSettingsLine /> },
        { to: '/admin/groups', label: 'Manage Groups', icon: <RiGroupLine /> },
        { to: '/admin/evangelists', label: 'Manage Evangelists', icon: <RiUserStarLine /> },
        { to: '/admin/students', label: 'Manage Students', icon: <RiGraduationCapLine /> },
        { to: '/admin/sermons', label: 'Manage Sermons', icon: <RiBookLine /> },
        { to: '/admin/certificates', label: 'Certificate Management', icon: <RiAwardLine /> },
        { to: '/admin/subscriptions', label: 'Subscriptions', icon: <RiNewspaperLine /> },
        { divider: true } as DropdownLink,
      ],
    };

    const links = [...commonLinks];
    const roleSpecific = roleLinks[role] || roleLinks.student;
    
    const dashboardIndex = links.findIndex(l => l.to === '/dashboard');
    if (dashboardIndex !== -1) {
      links.splice(dashboardIndex + 1, 0, ...roleSpecific);
    } else {
      links.push(...roleSpecific);
    }

    return links;
  };

  // ============================================
  // HELPERS
  // ============================================

  const getUserInitials = () => {
    if (!user?.full_name) return '?';
    return user.full_name
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfilePicture = (): string | undefined => {
    if (user?.profile?.profile_picture) {
      return user.profile.profile_picture;
    }
    return undefined;
  };

  const getRoleDisplayName = () => {
    const role = user?.role || 'student';
    const names: Record<string, string> = {
      admin: 'Administrator',
      evangelist: 'Evangelist',
      student: 'Student',
      super_admin: 'Super Admin',
      church_admin: 'Church Admin'
    };
    return names[role] || 'Member';
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const dropdownLinks = getDropdownLinks();

  // ============================================
  // RENDER AUTHENTICATED VIEW
  // ============================================

  if (user) {
    return (
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <Link to="/dashboard" className="flex-shrink-0">
              <img
                src={aptecLogo}
                alt="Digital Evangelism Logo"
                className="h-[50px] w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation - Authenticated */}
            <div className="hidden lg:flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors flex items-center gap-1"
              >
                <RiHomeLine className="text-lg" />
                Home
              </Link>
              <Link 
                to="/sermons" 
                className="text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors flex items-center gap-1"
              >
                <RiBookLine className="text-lg" />
                Sermons
              </Link>
              <Link 
                to="/certificates" 
                className="text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors flex items-center gap-1"
              >
                <RiAwardLine className="text-lg" />
                Certificates
              </Link>
            </div>

            {/* User Profile Dropdown */}
            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  {getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt={user?.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm border-2 border-cyan-500">
                      {getUserInitials()}
                    </div>
                  )}
                  
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {getRoleDisplayName()}
                    </p>
                  </div>
                  
                  <FaChevronDown className={`text-gray-400 text-sm transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                      <div className="flex items-center space-x-3">
                        {getProfilePicture() ? (
                          <img
                            src={getProfilePicture()}
                            alt={user?.full_name || 'User'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-cyan-500">
                            {getUserInitials()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.email || 'No email'}
                          </p>
                          <p className="text-xs text-cyan-600 capitalize">
                            {getRoleDisplayName()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      {dropdownLinks.map((link, index) => {
                        if ('divider' in link && link.divider) {
                          return <div key={`divider-${index}`} className="border-t border-gray-100 my-1"></div>;
                        }
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-colors group"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <span className="mr-3 text-gray-400 group-hover:text-cyan-500 transition-colors text-lg">
                              {link.icon}
                            </span>
                            <span className="font-medium">{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={authLoading}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 group"
                    >
                      <RiLogoutBoxLine className="mr-3 text-red-400 group-hover:text-red-500 transition-colors text-lg" />
                      <span className="font-medium">{authLoading ? 'Logging out...' : 'Logout'}</span>
                      {authLoading && <FaSpinner className="ml-2 animate-spin" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <RiCloseLine className="w-6 h-6 text-gray-700" />
              ) : (
                <RiMenuLine className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu - Authenticated */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-cyan-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <RiHomeLine className="text-lg text-cyan-500" />
                  Home
                </Link>
                <Link 
                  to="/sermons" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-cyan-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <RiBookLine className="text-lg text-cyan-500" />
                  Sermons
                </Link>
                <Link 
                  to="/certificates" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-cyan-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <RiAwardLine className="text-lg text-cyan-500" />
                  Certificates
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-cyan-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <RiUserLine className="text-lg text-cyan-500" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <RiLogoutBoxLine className="text-lg text-red-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // ============================================
  // RENDER PUBLIC VIEW (Not Authenticated)
  // ============================================

  const mainMenu = [
    { label: 'About digital evangelism', path: '/about' },
    { label: 'Discover', path: '/#' },
    { label: 'Activities', path: '/activities' },
    { label: 'Accommodation', path: '/accommodation' },
  ];

  const topMenu = [
    { label: 'Gallery', path: '/gallery' },
    { label: 'Preach Digitally', path: '/news' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const CrossIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16" />
    </svg>
  );

  return (
    <header className="bg-white shadow-md">
      {/* Top Navigation */}
      <nav className="bg-[#1a1a1a] py-2">
        <div className="container-custom flex justify-between items-center">
          <span className="text-gray-400 text-sm">
            Sunday, July 19 2026
          </span>
          <div className="hidden md:flex gap-6">
            {topMenu.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `text-gray-400 text-sm hover:text-white transition-colors ${
                    isActive ? 'text-white' : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Navigation */}
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={aptecLogo}
              alt="Digital Evangelism Logo"
              className="h-[60px] w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {mainMenu.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `text-xs font-bold uppercase tracking-wide hover:text-[#0e5488] transition-colors ${
                    isActive ? 'text-[#0e5488]' : 'text-gray-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link 
              to="/login" 
              className="inline-block bg-[#0e5488] text-white px-4 py-2 rounded hover:bg-[#002256] transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <RiLoginBoxLine />
              Login
            </Link>
            <Link 
              to="/join" 
              className="inline-block bg-[#0e5488] text-white px-4 py-2 rounded hover:bg-[#002256] transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <CrossIcon />
              Join Our Ministry
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 bg-gray-700"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
          </button>
        </div>

        {/* Mobile Menu - Public */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            {mainMenu.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `block py-2 text-sm font-bold uppercase tracking-wide hover:text-[#0e5488] transition-colors ${
                    isActive ? 'text-[#0e5488]' : 'text-gray-700'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <Link 
                to="/login" 
                className="block w-full bg-[#0e5488] text-white px-4 py-2 rounded hover:bg-[#002256] transition-colors text-sm font-semibold text-center flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <RiLoginBoxLine />
                Login
              </Link>
              <Link 
                to="/join" 
                className="block w-full bg-[#0e5488] text-white px-4 py-2 rounded hover:bg-[#002256] transition-colors text-sm font-semibold text-center flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CrossIcon />
                Join Our Ministry
              </Link>
              {topMenu.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `block py-1 text-sm text-gray-600 hover:text-[#0e5488] transition-colors ${
                      isActive ? 'text-[#0e5488]' : ''
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
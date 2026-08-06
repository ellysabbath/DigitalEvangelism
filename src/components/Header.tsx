// src/components/Header.tsx
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { 
  RiLoginBoxLine, 
  RiHomeLine,
  
  RiUserLine,
  RiLogoutBoxLine,
  RiBookLine,
  RiAwardLine,
  RiBarChartLine,
  
  RiFileListLine,
  RiAdminLine,
  RiShieldUserLine,
  RiMenuLine,
  RiCloseLine
} from 'react-icons/ri';
import { FaSpinner } from 'react-icons/fa';
import aptecLogo from '../assets/aptec.jpg';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactElement;
}

interface MenuItem {
  label: string;
  path: string;
}

// ============================================
// HEADER COMPONENT
// ============================================

const Header: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // ============================================
  // HELPERS
  // ============================================

  const getUserInitials = (): string => {
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

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // ============================================
  // GET NAVIGATION ITEMS BY ROLE
  // ============================================

  const getNavItems = (): NavItem[] => {
    const role = user?.role || 'student';
    
    // Common items for all authenticated users
    const commonItems: NavItem[] = [
      { 
        to: '/dashboard', 
        label: 'Home', 
        icon: <RiHomeLine className="text-lg" /> 
      },
      { 
        to: '/sermons', 
        label: 'Sermons', 
        icon: <RiBookLine className="text-lg" /> 
      },
      { 
        to: '/certificates', 
        label: 'Certificates', 
        icon: <RiAwardLine className="text-lg" /> 
      },
      { 
        to: '/profile', 
        label: 'Profile', 
        icon: <RiUserLine className="text-lg" /> 
      },
    ];
    
    // Role-specific items
    const roleItems: Record<string, NavItem[]> = {
      admin: [
        { 
          to: '/admin', 
          label: 'Admin', 
          icon: <RiAdminLine className="text-lg" /> 
        },
      ],
      evangelist: [
        { 
          to: '/ev/dashboard', 
          label: 'Evangelist', 
          icon: <RiBarChartLine className="text-lg" /> 
        },
        { 
          to: '/evangelist/exams', 
          label: 'Exams', 
          icon: <RiFileListLine className="text-lg" /> 
        },
      ],
      student: [
        { 
          to: '/student/exams', 
          label: 'My Exams', 
          icon: <RiFileListLine className="text-lg" /> 
        },
      ],
      church_admin: [
        { 
          to: '/admin', 
          label: 'Church Admin', 
          icon: <RiAdminLine className="text-lg" /> 
        },
      ],
      super_admin: [
        { 
          to: '/admin', 
          label: 'Super Admin', 
          icon: <RiShieldUserLine className="text-lg" /> 
        },
      ],
    };
    
    const extraItems = roleItems[role] || [];
    return [...commonItems, ...extraItems];
  };

  const navItems: NavItem[] = getNavItems();

  // ============================================
  // CROSS ICON COMPONENT
  // ============================================

  const CrossIcon = (): React.ReactElement => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16" />
    </svg>
  );

  // ============================================
  // MENU DATA
  // ============================================

  const mainMenu: MenuItem[] = [
    { label: 'About digital evangelism', path: '/about' },
    { label: 'Discover', path: '/#' },
    { label: 'Activities', path: '/activities' },
    { label: 'Accommodation', path: '/accommodation' },
  ];

  const topMenu: MenuItem[] = [
    { label: 'Gallery', path: '/gallery' },
    { label: 'Preach Digitally', path: '/news' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const currentDate: string = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // ============================================
  // RENDER AUTHENTICATED VIEW
  // ============================================

  if (user) {
    return (
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <Link to="/dashboard" className="flex-shrink-0">
              <img
                src={aptecLogo}
                alt="Digital Evangelism Logo"
                className="h-[50px] w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              {navItems.map((item: NavItem) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={authLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {authLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <RiLogoutBoxLine className="text-lg" />
                )}
                {authLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            {/* User Info Display */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 rounded-full">
                {getProfilePicture() ? (
                  <img
                    src={getProfilePicture()}
                    alt={user?.full_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-cyan-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    {getUserInitials()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.full_name || 'User'}
                </span>
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
              <div className="flex flex-col space-y-1">
                {navItems.map((item: NavItem) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-cyan-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <RiLogoutBoxLine className="text-lg" />
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

  return (
    <header className="bg-white shadow-md">
      {/* Top Navigation */}
      <nav className="bg-[#1a1a1a] py-2">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span className="text-gray-400 text-sm">
            {currentDate}
          </span>
          <div className="hidden md:flex gap-6">
            {topMenu.map((item: MenuItem) => (
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
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
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
            {mainMenu.map((item: MenuItem) => (
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
            {mainMenu.map((item: MenuItem) => (
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
              {topMenu.map((item: MenuItem) => (
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
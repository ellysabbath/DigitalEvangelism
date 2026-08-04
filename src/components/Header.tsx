import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
// Import the image from assets
import aptecLogo from '../assets/aptec.jpg';
import { RiLoginBoxLine } from 'react-icons/ri';

// If you have multiple images, you can import them like this:
// import logoDark from '../assets/aptec-dark.jpg';
// import logoLight from '../assets/aptec-light.jpg';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainMenu = [
    { label: 'About digital evangilism', path: '/about' },
   
    { label: 'Discover', path: '/#' },
    { label: 'Activities', path: '/activities' },
    { label: 'Accommodation', path: '/accommodation' },
  ];



    const CrossIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16" />
    </svg>
  );

  const topMenu = [
    { label: 'Gallery', path: '/gallery' },
    { label: 'Preach Digitally', path: '/news' },
    { label: 'Contact Us', path: '/contact' },
  ];

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
          {/* Logo with aptec.jpg */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={aptecLogo}
              alt="digital evangilism Logo"
              className="h-[60px] w-auto object-contain"
              // You can add more image attributes if needed:
              // width="200"
              // height="60"
              // loading="lazy"
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

          {/* Search Icon */}
                    <div className="hidden lg:block"> 
                       <Link 
                  to="/login" 
                  className="inline-block bg-[#0e5488] text-white px-2 py-1 rounded hover:bg-[#002256] transition-colors text-sm font-semibold w-full text-center flex items-center justify-center gap-2"
                    >
                  <RiLoginBoxLine />
                  Login
                </Link>
                 </div>
                  <div className="hidden lg:block"> 
                  <Link 
                  to="/join" 
                  className="inline-block bg-[#0e5488] text-white px-2 py-1 rounded hover:bg-[#002256] transition-colors text-sm font-semibold w-full text-center flex items-center justify-center gap-2"
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

        {/* Mobile Menu */}
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
            <div className="mt-4 pt-4 border-t border-gray-200">
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
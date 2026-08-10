// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import aptecLogo from '../assets/aptec.jpg';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const socialLinks = [
    { name: 'Facebook', icon: 'F' },
    { name: 'Twitter', icon: 'T' },
    { name: 'YouTube', icon: 'Y' },
    { name: 'Instagram', icon: 'I' },
    { name: 'TikTok', icon: 'Tk' },
    { name: 'LinkedIn', icon: 'In' },
  ];

  const footerLinks = [
    { label: t('footer.contactUs'), path: '/contact' },
    { label: t('footer.aboutUs'), path: '/about' },
    { label: t('footer.terms'), path: '/#' },
    { label: t('footer.privacy'), path: '/#' },
    { label: t('footer.newsletter'), path: '/#' },
    { label: t('footer.resources'), path: '/#' },
    { label: t('footer.help'), path: '/#' },
    { label: t('footer.siteMap'), path: '/#' },
  ];

  // SVG Icons
  const MailIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );

  const LocationIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const ArrowIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  );

  const CrossIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16" />
    </svg>
  );

  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-12">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - Ministry Logo in Circle */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0e5488] shadow-lg shadow-[#0e5488]/20 mb-4">
              <img
                src={aptecLogo}
                alt={t('common.ministry')}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed text-center md:text-left">
              {t('home.welcomeMessage')}
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[#0e5488] text-xl">C</span>
              <span className="text-[#0e5488] text-xl">T</span>
              <span className="text-[#0e5488] text-xl">B</span>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 border-b border-gray-700 pb-2">
              {t('footer.quickLinks')}
            </h4>
            {footerLinks.slice(0, 4).map((link) => (
              <p key={link.label} className="mb-2">
                <Link to={link.path} className="hover:text-[#0e5488] transition-colors flex items-center gap-2">
                  <ArrowIcon />
                  {link.label}
                </Link>
              </p>
            ))}
          </div>

          {/* Column 3 - Ministry Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 border-b border-gray-700 pb-2">
              {t('footer.ministry')}
            </h4>
            {footerLinks.slice(4).map((link) => (
              <p key={link.label} className="mb-2">
                <Link to={link.path} className="hover:text-[#0e5488] transition-colors flex items-center gap-2">
                  <ArrowIcon />
                  {link.label}
                </Link>
              </p>
            ))}
          </div>

          {/* Column 4 - Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4 border-b border-gray-700 pb-2">
              {t('footer.connect')}
            </h4>
            <div className="space-y-3">
              <p className="flex items-center gap-3 hover:text-white transition-colors">
                <span className="text-[#0e5488]"><MailIcon /></span>
                <a href="mailto:info@digitalevangelism.org" className="hover:text-[#0e5488] transition-colors text-sm">
                  mwananjelaeliisha36@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-3 hover:text-white transition-colors">
                <span className="text-[#0e5488]"><PhoneIcon /></span>
                <a href="tel:+255742578691" className="hover:text-[#0e5488] transition-colors text-sm">
                  +255 (742) 578-691
                </a>
              </p>
              <p className="flex items-center gap-3 hover:text-white transition-colors">
                <span className="text-[#0e5488]"><LocationIcon /></span>
                <span className="text-sm">{t('common.ministry')}</span>
              </p>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <Link 
                  to="/join" 
                  className="inline-block bg-[#0e5488] text-white px-6 py-2.5 rounded hover:bg-[#002256] transition-colors text-sm font-semibold w-full text-center flex items-center justify-center gap-2"
                >
                  <CrossIcon />
                  {t('footer.join')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <span className="text-sm block">
              {t('common.copyright')}
            </span>
            <span className="text-xs text-gray-600 block mt-1">
              {t('common.verse')}
            </span>
          </div>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#0e5488] transition-colors text-xs font-bold"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
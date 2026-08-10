// src/components/NewsSection.tsx (with full translation support)
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';

interface NewsItem {
  id: number;
  titleKey: string;
  excerptKey: string;
  date: string;
  image: string;
  views: number;
  fallbackTitle: string;
  fallbackExcerpt: string;
}

const NewsSection: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const itemsPerPage = 2;

  const newsItems: NewsItem[] = [
    {
      id: 1,
      titleKey: 'news.item1.title',
      excerptKey: 'news.item1.excerpt',
      date: 'July 17, 2026',
      image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/TAT-Upgrading-Festival-Database-and-Expanding-the-Sukjai-Chatbot-AI-Assistant-1-220x150.jpg',
      views: 4,
      fallbackTitle: 'Church members of Mpwapwa are working together with Aptec members, get involved',
      fallbackExcerpt: 'Mpwapwa DODOMA, Tanzania, July 17, 2026 / TRAVELINDEX / Recently, church members are working with Aptec members...'
    },
    {
      id: 2,
      titleKey: 'news.item2.title',
      excerptKey: 'news.item2.excerpt',
      date: 'July 17, 2026',
      image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/Fred-Finn-the-Worlds-Most-Traveled-Man-to-Receive-Prestigious-Award-220x150.jpg',
      views: 3,
      fallbackTitle: 'Pr Working together with APTEC members at DODOMA during Efforts',
      fallbackExcerpt: 'DODOMA, Tanzania, July 17, 2026 / TRAVELINDEX / Clevenard is proud to announce that Fred Finn...'
    },
    {
      id: 3,
      titleKey: 'news.item3.title',
      excerptKey: 'news.item3.excerpt',
      date: 'July 17, 2026',
      image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/SG-FT-2-220x150.jpg',
      views: 3,
      fallbackTitle: 'Church members of Mpwapwa are working together with Aptec members, get involved',
      fallbackExcerpt: 'Mpwapwa DODOMA, Tanzania, July 17, 2026 / TRAVELINDEX / Recently, church members are working with Aptec members...'
    },
    {
      id: 4,
      titleKey: 'news.item4.title',
      excerptKey: 'news.item4.excerpt',
      date: 'July 16, 2026',
      image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/Sustainability-220x150.jpg',
      views: 4,
      fallbackTitle: 'Aptec Group at Iringa, they are preaching to anyone they meet, get involved with them',
      fallbackExcerpt: 'Iringa town, Iringa, July 16, 2026 / TRAVELINDEX / a&o Hostels has released its annual sustainability report.'
    }
  ];

  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const currentItems = newsItems.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  // Helper function to get translated text with fallback
  const getTranslation = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-[#0e5488]">
          {t('home.dailyNews')}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-[#0e5488] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('common.previous') || 'Previous'}
          >
            <BiArrowToLeft />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-[#0e5488] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('common.next') || 'Next'}
          >
            <BiArrowToRight />
          </button>
        </div>
      </div>

      {currentItems.map((item) => (
        <div key={item.id} className="flex flex-col md:flex-row gap-5 py-5 border-b border-gray-100 last:border-0">
          <div className="md:flex-none md:w-[220px]">
            <img
              src={item.image}
              alt={getTranslation(item.titleKey, item.fallbackTitle)}
              className="w-full h-[150px] object-cover rounded"
              loading="lazy"
            />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-2">
              <span>📅 {item.date}</span>
              <span className="ml-4">🔥 {item.views} {t('dashboard.views')}</span>
            </div>
            <h4 className="text-lg font-semibold mb-2">
              <a href="#" className="text-gray-800 hover:text-[#0e5488] transition-colors">
                {getTranslation(item.titleKey, item.fallbackTitle)}
              </a>
            </h4>
            <p className="text-sm text-gray-600">
              {getTranslation(item.excerptKey, item.fallbackExcerpt)}
            </p>
            <div className="mt-3">
              <a 
                href="#" 
                className="text-[#0e5488] hover:text-[#002256] text-sm font-medium transition-colors inline-flex items-center gap-1"
              >
                {t('sermons.readMore')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Page indicator */}
      <div className="flex justify-center mt-6">
        <span className="text-sm text-gray-500">
          {t('common.page') || 'Page'} {page + 1} {t('common.of') || 'of'} {totalPages}
        </span>
      </div>
    </div>
  );
};

export default NewsSection;
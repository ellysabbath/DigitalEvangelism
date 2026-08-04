import React, { useState } from 'react';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';


interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  views: number;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: 'Church members of Mpwapwa are workig together with Aptec members,get involved',
    excerpt: 'Mpwapwa DODOMA , Tanzania, July 17, 2026 / TRAVELINDEX / Recently, church members are working wit Aptec members...',
    date: 'July 17, 2026',
    image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/TAT-Upgrading-Festival-Database-and-Expanding-the-Sukjai-Chatbot-AI-Assistant-1-220x150.jpg',
    views: 4
  },
  {
    id: 2,
    title: "Pr Workig together wih APTEC members  at DODOMA  during Efforts",
    excerpt: 'DODOMA, Tanzania, July 17, 2026 / TRAVELINDEX / Clevenard is proud to announce that Fred Finn...',
    date: 'July 17, 2026',
    image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/Fred-Finn-the-Worlds-Most-Traveled-Man-to-Receive-Prestigious-Award-220x150.jpg',
    views: 3
  },
  {
    id: 3,
    title: 'Church members of Mpwapwa are workig together with Aptec members,get involved',
    excerpt: 'Mpwapwa DODOMA , Tanzania, July 17, 2026 / TRAVELINDEX / Recently, church members are working wit Aptec members...',
    date: 'July 17, 2026',
    image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/SG-FT-2-220x150.jpg',
    views: 3
  },
  {
    id: 4,
    title: "Aptec Group at Iringa, they are  preaching to  any oe  they meet, get nvolved with them",
    excerpt: 'Inringa town, Iringa, July 16, 2026 / TRAVELINDEX / a&o Hostels has released its annual sustainability report.',
    date: 'July 16, 2026',
    image: 'https://www.visittanzania.org/wp-content/uploads/2026/07/Sustainability-220x150.jpg',
    views: 4
  }
];

const NewsSection: React.FC = () => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const currentItems = newsItems.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-[#0e5488]">
          Aptec Daily News
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-[#0e5488] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
           <BiArrowToLeft/>
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-[#0e5488] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiArrowToRight/>
            
          </button>
        </div>
      </div>

      {currentItems.map((item) => (
        <div key={item.id} className="flex flex-col md:flex-row gap-5 py-5 border-b border-gray-100 last:border-0">
          <div className="md:flex-none md:w-[220px]">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-[150px] object-cover rounded"
            />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-2">
              <span>📅 {item.date}</span>
              <span className="ml-4">🔥 {item.views}</span>
            </div>
            <h4 className="text-lg font-semibold mb-2">
              <a href="#" className="text-gray-800 hover:text-[#0e5488] transition-colors">
                {item.title}
              </a>
            </h4>
            <p className="text-sm text-gray-600">{item.excerpt}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsSection;
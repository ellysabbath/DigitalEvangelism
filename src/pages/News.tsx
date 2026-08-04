import React from 'react';

const News: React.FC = () => {
  const news = [
    {
      title: 'Preaching Camp  at Manyara  & DODOMA',
      date: 'July 17, 2026',
      excerpt: 'The members  of APTEC   and   UDOM ZONE  will have  preaching   camps   i  these  two  regions  for  preaching, welcome.'
    },
    {
      title: "Second phase preaching  mission  at Iringa",
      date: 'July 17, 2026',
      excerpt: 'Aptec  and  CTF  leaders  have  the mission to   preach much  at IRINGA  region  for  making others  the students  of  God...'
    },
    {
      title: 'Special   Charity   at  prisons',
      date: 'July 17, 2026',
      excerpt: 'TUCASA    CIVE/UDM  central  SDA  church  now  expects  to  have   charity  at   Isanga prison    including preaching...'
    },
    {
      title: "Providing  Books  to  the   people",
      date: 'July 16, 2026',
      excerpt: 'TUCASA  students  expects  to have   an  event   of providig   books  to  their  fellow    as   a  Good  technique    of  reaching the world.'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">Digital Evangelism  News</h1>
      <div className="space-y-6">
        {news.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
            <h3 className="text-xl font-semibold text-gray-800 hover:text-[#0e5488] transition-colors">
              <a href="#">{item.title}</a>
            </h3>
            <p className="text-sm text-gray-500 mt-1">{item.date}</p>
            <p className="text-gray-600 mt-2">{item.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
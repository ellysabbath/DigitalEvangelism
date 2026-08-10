// src/pages/About.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">{t('about.title')}</h1>
      <div className="space-y-4 text-gray-600">
        <p className="leading-relaxed">
          {t('about.description1')}
        </p>
        <p className="leading-relaxed">
          {t('about.description2')}
        </p>
        <h2 className="text-2xl font-semibold text-[#0e5488] mt-6">{t('about.fastFacts')}</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t('about.capital')}</li>
          <li>{t('about.largestCity')}</li>
          <li>{t('about.officialLanguages')}</li>
          <li>{t('about.population')}</li>
          <li>{t('about.field')}</li>
          <li>{t('about.timeOpen')}</li>
        </ul>
        <h2 className="text-2xl font-semibold text-[#0e5488] mt-6">{t('about.history')}</h2>
        <p className="leading-relaxed">
          {t('about.historyText')}
        </p>
      </div>
    </div>
  );
};

export default About;
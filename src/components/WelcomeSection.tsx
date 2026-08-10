// src/components/WelcomeSection.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Preaching from '../assets/sda.jpg';

const WelcomeSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0e5488] mb-4">
        {t('home.welcome')}
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={Preaching}
          alt={t('home.welcome')}
          className="w-full md:max-w-[300px] rounded-lg"
        />
        <p className="text-gray-600 leading-relaxed">
          {t('home.welcomeMessage')}
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
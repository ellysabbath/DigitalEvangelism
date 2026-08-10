// src/pages/Accommodation.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const Accommodation: React.FC = () => {
  const { t } = useTranslation();

  const accommodations = [
    {
      titleKey: 'accommodation.eternalLife',
      descKey: 'accommodation.eternalLifeDesc'
    },
    {
      titleKey: 'accommodation.angelSupervision',
      descKey: 'accommodation.angelSupervisionDesc'
    },
    {
      titleKey: 'accommodation.noRightsLost',
      descKey: 'accommodation.noRightsLostDesc'
    },
    {
      titleKey: 'accommodation.eternalReward',
      descKey: 'accommodation.eternalRewardDesc'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">{t('accommodation.title')}</h1>
      <div className="space-y-6">
        {accommodations.map((item, index) => (
          <div 
            key={index} 
            className={index < accommodations.length - 1 ? 'border-b border-gray-200 pb-6' : ''}
          >
            <h2 className="text-2xl font-semibold text-[#0e5488]">{t(item.titleKey)}</h2>
            <p className="text-gray-600 mt-2">{t(item.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accommodation;
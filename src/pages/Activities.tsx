// src/pages/Activities.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const Activities: React.FC = () => {
  const { t } = useTranslation();

  const activities = [
    { 
      nameKey: 'activities.charities', 
      descKey: 'activities.charitiesDesc', 
      icon: '🦁' 
    },
    { 
      nameKey: 'activities.healthEducations', 
      descKey: 'activities.healthEducationsDesc', 
      icon: '🏔️' 
    },
    { 
      nameKey: 'activities.seventhDayTruth', 
      descKey: 'activities.seventhDayTruthDesc', 
      icon: '🏖️' 
    },
    { 
      nameKey: 'activities.campingForEvangelism', 
      descKey: 'activities.campingForEvangelismDesc', 
      icon: '🐠' 
    },
    { 
      nameKey: 'activities.effectiveEducation', 
      descKey: 'activities.effectiveEducationDesc', 
      icon: '🎭' 
    },
    { 
      nameKey: 'activities.specialPrayers', 
      descKey: 'activities.specialPrayersDesc', 
      icon: '🎉' 
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">{t('activities.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <div key={activity.nameKey} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">{activity.icon}</div>
            <h3 className="text-xl font-semibold text-[#0e5488]">{t(activity.nameKey)}</h3>
            <p className="text-gray-600 mt-2">{t(activity.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;
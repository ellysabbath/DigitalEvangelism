// src/components/VideoSection.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Pumziko from '../assets/pumziko.mp4';

const VideoSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
      <h3 className="text-2xl font-semibold text-[#0e5488] mb-4">
        {t('home.videoTitle')}
      </h3>
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
        <iframe
          src={Pumziko}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={t('home.videoTitle')}
        ></iframe>
      </div>
    </div>
  );
};

export default VideoSection;
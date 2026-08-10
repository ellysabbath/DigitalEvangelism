// src/components/ScrollingSlider.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Slide {
  id: number;
  titleKey: string;
  image: string;
  fallbackTitle: string;
}

const ScrollingSlider: React.FC = () => {
  const { t } = useTranslation();

  const scrollingSlides: Slide[] = [
    {
      id: 1,
      titleKey: 'home.digitalEvangelism',
      image: 'https://www.visittanzania.org/wp-content/uploads/2016/02/Mwaka-Kogwa-Festival-Visit-Tanzania-Zanzibar-390x220.jpg',
      fallbackTitle: 'Digital Evangelism Day'
    },
    {
      id: 2,
      titleKey: 'scrolling.visitedByMembers',
      image: 'https://www.visittanzania.org/wp-content/uploads/2019/10/visit-tanzania-waterfall-kalambo-falls-390x220.jpg',
      fallbackTitle: 'Visited by Members'
    },
    {
      id: 3,
      titleKey: 'scrolling.history',
      image: 'https://www.visittanzania.org/wp-content/uploads/2019/10/visit-tanzania-waterfront-at-zanzibar-tanzania-390x220.jpg',
      fallbackTitle: 'History'
    },
    {
      id: 4,
      titleKey: 'scrolling.efforts',
      image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/tinga-tinga-390x220.jpg',
      fallbackTitle: 'Efforts'
    }
  ];

  // Helper function to get translated text with fallback
  const getTitle = (slide: Slide): string => {
    const translated = t(slide.titleKey);
    // If translation returns the key itself (missing), use fallback
    return translated === slide.titleKey ? slide.fallbackTitle : translated;
  };

  return (
    <div className="my-8 -mx-4">
      <div className="flex gap-5 overflow-x-auto px-4 pb-4 scroll-smooth">
        {scrollingSlides.map((slide) => (
          <div
            key={slide.id}
            className="flex-none w-[300px] relative rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
          >
            <img
              src={slide.image}
              alt={getTitle(slide)}
              className="w-full h-[220px] object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-white font-semibold">{getTitle(slide)}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollingSlider;
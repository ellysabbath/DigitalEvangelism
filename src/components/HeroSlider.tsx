// src/components/HeroSlider.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import sdaImage from '../assets/sda.jpg';
import studentImage from '../assets/student.jpg';
import preachingImage from '../assets/preaching.jpg';

interface Slide {
  id: number;
  titleKey: string;
  subtitleKey: string;
  image: string;
}

const HeroSlider: React.FC = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides: Slide[] = [
    {
      id: 1,
      titleKey: 'home.welcome',
      subtitleKey: 'home.subtitle',
      image: sdaImage
    },
    {
      id: 2,
      titleKey: 'home.empowering',
      subtitleKey: 'home.training',
      image: studentImage
    },
    {
      id: 3,
      titleKey: 'home.digitalEvangelism',
      subtitleKey: 'home.reaching',
      image: preachingImage
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[500px] overflow-hidden rounded-lg -mx-4">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={t(slide.titleKey)}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white w-full px-4">
            <h1 className="text-5xl md:text-7xl font-georgia mb-2 drop-shadow-lg">
              {t(slide.titleKey)}
            </h1>
            <p className="text-lg md:text-2xl font-medium tracking-[3px] drop-shadow-lg">
              {t(slide.subtitleKey)}
            </p>
          </div>
        </div>
      ))}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full border-2 border-white transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-transparent'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
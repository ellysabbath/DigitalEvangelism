import React, { useState, useEffect } from 'react';
// Import all images from assets
import sdaImage from '../assets/sda.jpg';
import studentImage from '../assets/student.jpg';
import preachingImage from '../assets/preaching.jpg';
// Add any additional images you have
// import image4 from '../assets/image4.jpg';
// import image5 from '../assets/image5.jpg';
// import image6 from '../assets/image6.jpg';

interface Slide {
  id: number;
  title?: string;
  subtitle?: string;
  image: string;
}

const heroSlides: Slide[] = [
  {
    id: 1,
    title: 'Welcome to digital evangelism',
    subtitle: 'Adventist Pastoral Training and Evangelism Center',
    image: sdaImage
  },
  {
    id: 2,
    title: 'Empowering Students',
    subtitle: 'Training the next generation of Gospel workers',
    image: studentImage
  },
  {
    id: 3,
    title: 'Digital Evangelism',
    subtitle: 'Reaching the world through technology',
    image: preachingImage
  }
  // Add more slides as needed
  // {
  //   id: 4,
  //   title: 'Another Title',
  //   subtitle: 'Another Subtitle',
  //   image: image4
  // },
];

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
            alt={slide.title || 'digital evangilism'}
            className="w-full h-full object-cover"
          />
          {slide.title && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white w-full px-4">
              <h1 className="text-5xl md:text-7xl font-georgia mb-2 drop-shadow-lg">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-lg md:text-2xl font-medium tracking-[3px] drop-shadow-lg">
                  {slide.subtitle}
                </p>
              )}
            </div>
          )}
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
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
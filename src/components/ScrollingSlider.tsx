import React from 'react';

interface Slide {
  id: number;
  title: string;
  image: string;
}

const scrollingSlides: Slide[] = [
  {
    id: 1,
    title: 'digital evangilism day',
    image: 'https://www.visittanzania.org/wp-content/uploads/2016/02/Mwaka-Kogwa-Festival-Visit-Tanzania-Zanzibar-390x220.jpg'
  },
  {
    id: 2,
    title: 'visited by members',
    image: 'https://www.visittanzania.org/wp-content/uploads/2019/10/visit-tanzania-waterfall-kalambo-falls-390x220.jpg'
  },
  {
    id: 3,
    title: 'History',
    image: 'https://www.visittanzania.org/wp-content/uploads/2019/10/visit-tanzania-waterfront-at-zanzibar-tanzania-390x220.jpg'
  },
  {
    id: 4,
    title: 'efforts',
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/tinga-tinga-390x220.jpg'
  }
];

const ScrollingSlider: React.FC = () => {
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
              alt={slide.title}
              className="w-full h-[220px] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-white font-semibold">{slide.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollingSlider;
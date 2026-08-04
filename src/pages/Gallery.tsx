import React from 'react';

const Gallery: React.FC = () => {
  const images = [
    'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-mount-kilimanjaro-with-elephants-visittanzania4.jpg',
    'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-cheetah-seregenti-visittanzania.jpg',
    'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-luxury-tented-camp-selous-visittanzania.jpg',
    'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-dar-es-salam-city-visittanzania.jpg',
    'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-dhow-zanzibar-visittanzania.jpg',
    'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-mnemba-beach-visittanzania.jpg',
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">Tanzania Photo Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
            <img
              src={image}
              alt={`Tanzania Gallery ${index + 1}`}
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
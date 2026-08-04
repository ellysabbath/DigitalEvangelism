import React from 'react';

const destinations = [
  {
    name: 'Serengeti National Park',
    description: 'Home to the Great Migration and the Big Five',
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-cheetah-seregenti-visittanzania.jpg'
  },
  {
    name: 'Mount Kilimanjaro',
    description: "Africa's highest peak at 5,895 meters",
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-mount-kilimanjaro-with-elephants-visittanzania4.jpg'
  },
  {
    name: 'Zanzibar',
    description: 'Tropical island paradise with rich history',
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-dhow-zanzibar-visittanzania.jpg'
  },
  {
    name: 'Ngorongoro Crater',
    description: "World's largest inactive volcanic caldera",
    image: 'https://www.visittanzania.org/wp-content/uploads/2020/04/visit-tanzania-luxury-tented-camp-selous-visittanzania.jpg'
  }
];

const Destinations: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">Destinations in Tanzania</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {destinations.map((dest) => (
          <div key={dest.name} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-[#0e5488]">{dest.name}</h3>
              <p className="text-gray-600 mt-2">{dest.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
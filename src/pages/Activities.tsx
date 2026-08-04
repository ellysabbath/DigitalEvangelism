import React from 'react';

const activities = [
  { name: 'Charities', description: 'Reaching Humans needs is  our  mission', icon: '🦁' },
  { name: 'Health Educations', description: 'Providing health   educations  to  the  ppeople  free  is  a  mission of  God', icon: '🏔️' },
  { name: 'Seventh day Truth', description: 'Telling  majority  about the true day of  prayer is  our duty', icon: '🏖️' },
  { name: 'Camping for evangelism', description: 'We  go to camp meetinng for  telling the world truth of God', icon: '🐠' },
  { name: 'Effective Education', description: 'We assure our  students  that  the  spiritual  skills  they   Get   comes  from God  self not  creature.', icon: '🎭' },
  { name: 'Special  Prayers', description: 'Join our  platform  for several  fasting  and praying for the others  to get what you have.', icon: '🎉' },
];

const Activities: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">Activities in Digital Evangelism</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <div key={activity.name} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">{activity.icon}</div>
            <h3 className="text-xl font-semibold text-[#0e5488]">{activity.name}</h3>
            <p className="text-gray-600 mt-2">{activity.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;
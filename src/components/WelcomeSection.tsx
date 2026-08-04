import React from 'react';
import Preaching from '../assets/sda.jpg'

const WelcomeSection: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0e5488] mb-4">
        welcome OneVoice27
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={Preaching}
          alt="digital evangilism CTF"
          className="w-full md:max-w-[300px] rounded-lg"
        />
        <p className="text-gray-600 leading-relaxed">
          In   this platform  you will  get  connected  with the  society of Holly church of
          Jesus christ  who died for the sins of majority. The  evangelists will  determine  your  presence
          and  they  will share questions  and  sermons  to  you  and   you  will attempt  and  gain  more  spiritual skills
          for the  ters day is  commig soon where we would not actually even incoporated with the Glory of God: <em className="text-red">welcome!</em>
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
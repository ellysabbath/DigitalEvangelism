import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">About digital evangilism</h1>
      <div className="space-y-4 text-gray-600">
        <p className="leading-relaxed">
          digital evangilism is a  platform  that  connects evangelists   and  students  of   
          spirit of prophets  and   bible students  where tey  can  learn   a  sermon   and attempt 
          examinations  they  can  get certisified   by  sermon.   welcome so much   under  this platform.
        </p>
        <p className="leading-relaxed">
          Seventh day adventist  church  in Central  Tanzania Field   at   UDOM  under   APTEC club  we    warmly   welcome   you   to
          join this  platform   for providing third  angel message  to  this   world   before second  comming of  
          Jesus  christ.
        </p>
        <h2 className="text-2xl font-semibold text-[#0e5488] mt-6">Fast Facts</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Capital: Dodoma</li>
          <li>Largest City: Dar es Salaam</li>
          <li>Official Languages: Swahili, English</li>
          <li>Population: ~60 million</li>
          <li>Field/Conference: Central Tanzania Field(CTF)</li>
          <li>Time Open:now</li>
        </ul>
        <h2 className="text-2xl font-semibold text-[#0e5488] mt-6">History</h2>
        <p className="leading-relaxed">
          This   platform developed  in 2026   whwre we expected  to  reach all  the majority
          in the word  using digital method, we  expected  to ensure effective provission of
          spiritual skills   to  the  Earth's people.      We  expected to reach all  the  prople's Population
          as   expected   before  the second comming of   Jesus Christ.
        </p>
      </div>
    </div>
  );
};

export default About;
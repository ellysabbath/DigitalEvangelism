import React from 'react';
import dis from '../assets/dis.jpg';
import disa from '../assets/disa.jpg';
import dise from '../assets/dise.jpg';

const Sidebar: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <a href="#">
          <img
            src={dis}
            alt="digital evangilism With OneVoice27"
            className="w-full rounded"
          />
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <a href="#">
          <img
            src={disa}
            alt="Get Involved with the mission"
            className="w-full rounded"
          />
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="text-lg font-semibold text-[#0e5488] pb-3 mb-4 border-b-2 border-[#0e5488]">
          SUBSCRIBE TO OUR NEWSLETTER
        </h4>
        <form>
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:border-[#0e5488]"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:border-[#0e5488]"
          />
          <button
            type="submit"
            className="w-full py-2 bg-[#0e5488] text-white rounded font-semibold hover:bg-[#002256] transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
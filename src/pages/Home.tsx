import React from 'react';
import HeroSlider from '../components/HeroSlider';
import WelcomeSection from '../components/WelcomeSection';
import ScrollingSlider from '../components/ScrollingSlider';
import VideoSection from '../components/VideoSection';
import NewsSection from '../components/NewsSection';
import Sidebar from '../components/Sidebar';

const Home: React.FC = () => {
  return (
    <div>
      <HeroSlider />
      
      <div className="flex flex-wrap -mx-4 mt-8">
        <div className="w-full lg:w-3/3 px-4">
          <WelcomeSection />
        </div>
        {/* <div className="w-full lg:w-1/3 px-4">
          <Sidebar />
        </div> */}
      </div>
      
      <ScrollingSlider />
      
      <div className="flex flex-wrap -mx-4 mt-8">
        <div className="w-full lg:w-2/3 px-4">
          <VideoSection />
          <div className="mt-8">
            <NewsSection />
          </div>
        </div>
        <div className="w-full lg:w-1/3 px-4">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Home;
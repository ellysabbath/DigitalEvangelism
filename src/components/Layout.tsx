import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container-custom section-padding">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
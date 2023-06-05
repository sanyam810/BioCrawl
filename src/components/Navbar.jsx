import React from 'react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-24">
          <img src={logo} alt="BioCrawl Logo" className="h-24" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React from 'react';
import Navbar from './components/Navbar';
import SearchP from './components/SearchP';
import Upload from './components/Upload';
import Particles from './components/Particles';
import SearchG from './components/SearchG';


const App = () => {
  return (
    <div>
      <Navbar />
      <Particles/>

      
      <div className="flex justify-center items-start min-h-screen bg-black py-40">
        <div className="flex">
          <div className='mr-24'>
            <SearchP />
          </div>
          <div className='mr-24'>
            <SearchG />
          </div>
          <div className='mr-24'>
            <Upload />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

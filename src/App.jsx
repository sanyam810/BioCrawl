import React from 'react';
import Navbar from './components/Navbar';
import SearchP from './components/SearchP';
import Upload from './components/Upload';
import Particles from './components/Particles';


const App = () => {
  return (
    <div>
      <Navbar />
      <Particles/>

      
      <div className="flex justify-center items-start min-h-screen bg-black py-40">
        <div className="flex">
          <div className='mr-48'>
            <SearchP />
          </div>
          <div>
            <Upload />
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;

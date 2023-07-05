import React from 'react';
import Navbar from './components/Navbar';
import SearchP from './components/SearchP';
import Upload from './components/Upload';
import Particles from './components/Particles';
import SearchG from './components/SearchG';
import BlastSearch from './components/BlastSearch';
import IdConverter from './components/IdConverter';


const App = () => {
  return (
    <div>
      <Navbar />
      <Particles/>

      
      <div className="flex justify-center items-start min-h-screen bg-black py-40">
        <div className="flex overflow-x-auto" style={{ width: '100%', maxWidth: '1200px' }}>
          <div className='mr-24'>
            <SearchP />
          </div>
          <div className='mr-24'>
            <IdConverter />
          </div>
          <div className='mr-24'>
            <SearchG />
          </div>
          <div className='mr-24'>
            <Upload />
          </div>
          <div className='mr-24'>
            <BlastSearch />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

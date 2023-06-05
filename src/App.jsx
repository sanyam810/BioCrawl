
import Navbar from './components/Navbar';

import SearchP from './components/SearchP';

const App=()=> {
  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        
        <Navbar/>
        <SearchP/>
      </div>

    </div>
    
  );
}

export default App;
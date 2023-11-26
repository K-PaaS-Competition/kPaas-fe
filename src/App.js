import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MapPage from './component/MapPage/MapePage';
import MainPage from './component/MainPage/MainPage';
import SubwayMapPage from './component/SubwayMap/SubwayMapPage';

function App() {
  return(
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<MainPage/>} />
          <Route path='/map' element={<MapPage/>}/>
          <Route path='/subway' element={<SubwayMapPage/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App;
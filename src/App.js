import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MapPage from './component/MapPage/MapPage';

function App() {
  return(
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<MapPage/>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
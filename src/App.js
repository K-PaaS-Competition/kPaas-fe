import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MapPage from './component/MapPage/MapePage';
import MainPage from './component/MainPage/MainPage';

function App() {
  return(
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<MainPage/>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
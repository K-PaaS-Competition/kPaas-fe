import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = ()=>{
  const navigate = useNavigate()

  const MapPageOnClickHandler = (e)=>{
    navigate("/map")
  }

  return(<div>
    <h2 onClick={MapPageOnClickHandler}>MapPage</h2>
  </div>)
}

export default MainPage;
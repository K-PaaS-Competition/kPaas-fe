import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Main from "./Main";

const MainPage = ()=>{
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const MapPageOnClickHandler = (e)=>{
    navigate("/map")
  }

  return(<div>
    <Main/>
  </div>)
}

export default MainPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Main from "./Main";
import images from '../../assets/images/images';
import style from "./MainPage.module.css"

const MainPage = ()=>{
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const MapPageOnClickHandler = (e)=>{
    navigate("/map")
  }

  return(
  <div className={style.background}>
    <img src={images.mainPageBackground} alt='mainPageBackground' className={style.backgroundImg}/>
  </div>)
}

export default MainPage;
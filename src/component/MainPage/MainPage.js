import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import images from '../../assets/images/images';
import style from "./MainPage.module.css";
import TopBar from "./TopBar.js";
import ServiceInfo from './ServiceIntro.js';
import SearchPage from './SearchPage.js';

const MainPage = ()=>{
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const MapPageOnClickHandler = (e)=>{
    navigate("/map")
  }

  useEffect(()=>{
    console.log(page)
  }, [page])
  
  return(
  <div className={style.background}>
    <TopBar currentPage={page} setPage={setPage}/>
    <img src={images.mainPageBackgroundGreen} alt='mainPageBackground' className={style.backgroundImg}/>
    {page===0 && <ServiceInfo setPage={setPage}/>}
    {page===1 && <SearchPage setPage={setPage}/>}
  </div>)
}

export default MainPage;
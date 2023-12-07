import React, { useState } from 'react';
import images from '../../assets/images/images';
import style from "./MainPage.module.css";
import TopBar from "./TopBar.js";
import ServiceInfo from './ServiceIntro.js';
import SearchPage from './SearchPage.js';

const MainPage = ()=>{
  const [page, setPage] = useState(0)

  return(
  <div className={style.background}>
    <TopBar currentPage={page} setPage={setPage}/>
    <img src={images.mainPageBackgroundGreen} alt='mainPageBackground' className={style.backgroundImg}/>
    {page===0 && <ServiceInfo setPage={setPage}/>}
    {page===1 && <SearchPage setPage={setPage}/>}
  </div>)
}

export default MainPage;
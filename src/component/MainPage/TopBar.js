import React, { useEffect, useState } from 'react';
import style from './TopBar.module.css';
import images from '../../assets/images/images';
import { useNavigate } from 'react-router-dom';

const TopBar = ({currentPage, setPage})=>{
  const menuList = ["설명", "검색", "지도", "지하철"];
  const [menuJsx, setMenuJsx] = useState(null);
  const navigate = useNavigate();

  const handleMenuClick = (e)=>{
    const id = e.currentTarget.id;
    if(!id) return;
    if(id === "설명"){ 
      setPage(()=>0);
    }else if(id === "검색"){
      setPage(()=>1);
    }else if(id === "지도"){
      navigate("/map");
    }else if(id === "지하철"){
      navigate("/subway");
    }
  }

  useEffect(()=>{
    setMenuJsx(()=>(
      <div className={style.menuContainer}>
        {menuList.map((data, idx)=>{
          return (
            <div
              key={`${data} - ${idx}`}
              className={idx===currentPage?style.selectedMenu:style.unSelectedMenu}
              id={data}
              onClick={handleMenuClick}
            >
              {data}
            </div>
          )
        })}
      </div>
    ));
  }, [currentPage])

  return (
    <div className={style.topBarContainer}>
      <div className={style.logo} onClick={()=>navigate("/")}>
        <span className={style.logoLeft}>Flooding</span>
        <span className={style.logoRight}>Point</span>
      </div>
      {menuJsx}
    </div>
  )
};

export default TopBar;
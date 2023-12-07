import React from 'react';
import style from "./ServiceInfo.module.css";
import images from '../../assets/images/images';
import { useNavigate } from 'react-router-dom';

const ServiceInfo = ({setPage})=>{
  const navigate = useNavigate();

  const handleScroll = (e) => {
    if(e.deltaY > 0){
      setPage((prev)=>{
        if(prev===0){
          return prev+1;
        }
        return prev;
      });
    }
  };

  return(
    <div className={style.background} onWheel={handleScroll}>
      <div className={style.content}>
        <div className={style.titleExplainContainer}>
          <div className={style.titleExplain}>
            <div className={style.logo}>
              <span className={style.logoLeft}>Flooding</span>
              <span className={style.logoRight}>Point</span>
            </div>
            <div className={style.explain}>
              <div>우리나라는 기후 변화로 갑작스러운 날씨의 변화에 대처하지 못하고 있습니다. 하지만 걱정하지 마세요.</div> 
              <div>우리는 실시간으로 침수를 예측하고 위험을 알려줍니다. Flooding Point는 침수를 대비할 강력한 방패가 될 것입니다.</div>
            </div>
          </div>
          <div className={style.moveButtons}>
            <div className={style.buttonContainer} onClick={()=>navigate("/subway")}>
              <img src={images.subwayWhiteIcon} alt='subwayPageNav' className={style.subwayPageNav}/>
            </div>
            <div className={style.buttonContainer} onClick={()=>navigate("/map")}>
              <img src={images.mapIcon} alt='mapPageNav' className={style.mapPageNav}/>
            </div>
          </div>
        </div>
        <div className={style.imageContainer}>
          <img src={images.mainPageBackground} alt='introImage' className={style.introImage}/>
        </div>
      </div>
    </div>
  )
}

export default ServiceInfo;
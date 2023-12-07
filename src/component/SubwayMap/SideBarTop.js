import React, { useEffect, useRef, useState } from 'react';
import style from "./SubwayMapPage.module.css"
import { getSimilarSubway } from '../../modules/GetSimilarInput';
import { useNavigate } from 'react-router-dom';

const SideBarTop = (props)=>{
  const navigate = useNavigate();
  const inputRef = useRef(null)
  const [similarSubway, setSimilarSubway] = useState(null)
  const [similarSubwayJsx, setSimilarSubwayJsx] = useState([])
  const [option] = useState("info");

  useEffect(()=>{
    const autoComplete = (e)=>{
      if(!e.currentTarget) return;
      inputRef.current.value = e.currentTarget.id;
      props.setStationName(()=>inputRef.current.value)
    }

    const temp = []
    if(!similarSubway) return;
    for(let i=0; i<similarSubway.length; i++){
      temp.push(
        <div
          key={`similarSubway ${i}`}
          onClick={autoComplete} 
          className={style.similarSubway}
          id={similarSubway[i]['name']}
        >
          {similarSubway[i]['name']} {similarSubway[i]['line']}
        </div>
      )
    }
    setSimilarSubwayJsx(()=>temp)
  }, [similarSubway, props])

  const handleInputChange = ((e)=>{
    const value = inputRef.current.value;
    if(!value || !props.subwayList) return;
    const tmpSimilarList = getSimilarSubway(value, props.subwayList);
    setSimilarSubway(()=>tmpSimilarList);
    props.setSimilarSubwayShow(()=>true);
  })

  const handleInputKeyPress = ((e)=>{
    if(!similarSubway) return;
    if(similarSubway.length===0) return;
    if(e.key === "Enter"){
      if(similarSubway.indexOf(inputRef.current.value)<0){
        inputRef.current.value = similarSubway[0]['name']
      }
      props.setStationName(()=>inputRef.current.value)
      props.setSimilarSubwayShow(()=>false);
    }
  })

  return(
    <div className={style.sideBarTop}>
      <div className={style.logo}>
        <span className={style.logoLeft} onClick={()=>navigate("/")}>Flooding</span>
        <span className={style.logoRight} onClick={()=>navigate("/")} style={{color:"black"}}>Point</span>
      </div>
      <div
        id='input'
        className={style.inputWrapper}
        onFocus={(e)=>{
          props.setSimilarSubwayShow(()=>true)
        }}
      >
        <input 
          id='input'
          className={style.searchBox} 
          placeholder='지하철역 검색' 
          onChange={handleInputChange} 
          onKeyDown={handleInputKeyPress}
          ref={inputRef}
          maxLength={25}
        />
        {similarSubway && props.similarSubwayShow && <div className={style.similarSubwayContainer} id='input'>{similarSubwayJsx}</div>}
      </div>
      <div className={style.topBarOptionContainer}>
        <div className={style.topBarOption} style={{borderRight:"thin solid #00000026"}}>
          <div className={style.topBarOptionContent} style={option==="info"?{backgroundColor:"#15803d"}:{}}>세부 정보</div>
        </div>
        <div className={style.topBarOption} style={{borderLeft:"thin solid #00000026"}} onClick={()=>navigate("/map")}>
          <div className={style.topBarOptionContent}>지도</div>
        </div>
      </div>
    </div>
  )
}

export default SideBarTop;
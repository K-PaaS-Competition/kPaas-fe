import React, { useEffect, useState } from 'react';
import style from "./SubwayMapPage.module.css"
import images from '../../assets/images/images';

const StationBox = (props)=>{
  const colors = {
    "1호선" : "#0D3692",
    "2호선" : "#33A23D",
    "3호선" : "#FE5B10",
    "4호선" : "#32A1C8",
    "5호선" : "#8B50A4",
    "6호선" : "#CD7D30",
    "7호선" : "#54640D",
    "8호선" : "#F51361",
    "9호선" : "#AA9872",
    "9호선(연장)" : "#AA9872",
    "경의중앙" : "#78C4A3",
    "공항철도1호선" : "#3681B7",
    "수인분당" : "#FABE02",
    "경부선" : "#0D3692",
    "수인선": "#00A9E0",
    "분당선": "#FF8100",
    "우이신설선":"#6CAD45",
    "신분당선": "#FFD200",
    "인천1호선": "#FABD42",
    "인천2호선": "#00A5DE",
    "경의중앙선": "#73C7A6",
    "의정부선": "#E6007E",
  };
  const lineNumber = props.lineNumber;
  return(
    <div className={style.stationBox} style={{borderColor:colors[lineNumber]}}>
      <div className={style.stationBoxCircle} style={{backgroundColor:colors[lineNumber]}}/>
      <span className={style.stationBoxName} style={{color:colors[lineNumber]}}>{lineNumber}</span>
    </div>
  )
}

const SideBarBottom = (props)=>{
  const [stationLineJsx, setStationLineJsx] = useState([]);
  const gridData = [0, 10, 20, 50, "~"];
  const riskCriteria = ["안전", "위험"];
  const gridDataJsx = (
    <div className={style.gridDataJsxContainer}>
      {gridData.map((data)=>(<div key={`grid-${data}`}>{data}</div>))}
    </div>
  );
  const riskCriteriaJsx = (
    <div className={style.gridDataJsxContainer}>
      {riskCriteria.map((data)=>{
        return(
          <div
            key={`riskCtr-${data}`}
            style={{fontWeight:"700"}}
          >
            {data}
          </div>
        )
      })}
    </div>
  );

  useEffect(()=>{
    const tmp = []
    for(let i=0; i<props.currentStationInfo.length; i++){
      const data = props.currentStationInfo[i];
      tmp.push(
        <StationBox lineNumber={data.line} key={`stationBox-${data.line}-${i}`}/>
      )
    }
    setStationLineJsx(()=>tmp)
  }, [props.stationName, props.currentStationInfo]);

  return(
    <div className={style.stationInfoContainer}>
      <div className={style.stationInfo}>
        <div className={style.stationName}>{props.stationName}</div>
      </div>
      <div className={style.stationInfo}>
        <div className={style.infoTitle}>호선 정보</div>
        <div className={style.infoContent}>
          {stationLineJsx}
        </div>
      </div>
      <div className={style.stationInfo}>
        <div className={style.infoTitle}>강수량</div>
        <div className={style.infoContent} style={{justifyContent:"center", columnGap:"1.3rem"}}>
          <img src={images.rainIcon} alt='rainIcon' className={style.rainIcon}/>
          <div className={style.rainFall}>{props.rainFall}mm/h</div>
        </div>
      </div>
      <div className={style.stationInfo}>
        <div className={style.infoTitle}>역 침수정보</div>
        <div className={style.infoContent}>
          <div className={style.riskInfograph}>
            <div className={style.graphDivisor} style={{width:`calc(100% - ${(props.floodRiskLevel)*12.5}%)`, left:`${(props.floodRiskLevel)*12.5}%`}}/>
            <div className={style.graphGrid}>
              {gridDataJsx}
            </div>
          </div>
        </div>
      </div>
      <div className={style.stationInfo} style={{border:"none"}}>
        <div className={style.infoTitle}>침수 높이 기준</div>
        <div className={style.infoContent}>
          <div className={style.riskInfograph}>
            <div className={style.graphGrid}>
              {riskCriteriaJsx}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBarBottom;
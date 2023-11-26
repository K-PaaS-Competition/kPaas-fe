import React, { useEffect, useRef, useState } from 'react';
import SubwayMap from './SubwayMap';
import style from "./SubwayMapPage.module.css"
import images from '../../assets/images/images';
import CbcConvert from "../../modules/CbcConvert";
import axios from 'axios';

const SideBarTop = (props)=>{
  const inputRef = useRef(null)
  const subwayList = props.subwayList
  const [similarSubway, setSimilarSubway] = useState([])
  const [similarSubwayJsx, setSimilarSubwayJsx] = useState([])

  const autoComplete = (e)=>{
    inputRef.current.value = e.currentTarget.id;
    props.setStationName(()=>inputRef.current.value)
  }

  useEffect(()=>{
    const temp = []
    for(let i=0; i<similarSubway.length; i++){
      temp.push(
        <div
          key={`similarSubway ${i}`}
          onClick={autoComplete} 
          className={style.similarSubway}
          id={similarSubway[i]['name']}
        >
          <div className={style.similarSubwayText}>{similarSubway[i]['name']} {similarSubway[i]['line']}</div>
        </div>
      )
    }
    setSimilarSubwayJsx(()=>temp)
  }, [similarSubway])

  const handleInputChange = ((e)=>{
    const value = inputRef.current.value;
    const similarSubwayTmp = []
    for(let i=0; i<subwayList.length; i++){
      const subwayName = subwayList[i]['name']
      if(value==="") continue;
      if(subwayName.indexOf(value)>=0){
        similarSubwayTmp.push(subwayList[i])
      }
    }
    setSimilarSubway(()=>similarSubwayTmp);
  })

  const handleInputKeyPress = ((e)=>{
    if(e.key === "Enter"){
      if(similarSubway.indexOf(inputRef.current.value)<0){
        inputRef.current.value = similarSubway[0]['name']
      }
      props.setStationName(()=>inputRef.current.value)
    }
  })

  return(
    <div className={style.sideBarTop}>
      <div className={style.menuTitle}>
        <img src={images.menu} style={{width:"1.5rem", height:"1.2rem"}}/>
        <span className={style.logo}>LOGO</span>
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
          onKeyPress={handleInputKeyPress}
          ref={inputRef}
        />
        {similarSubway.length>0 && props.similarSubwayShow && <div className={style.similarSubwayContainer}>{similarSubwayJsx}</div>}
      </div>
      <div className={style.topBarOptionContainer}>
        <div className={style.topBarOption} style={{borderRight:"thin solid #00000026"}}>
          <div className={style.topBarOptionContent}>세부 정보</div>
        </div>
        <div className={style.topBarOption} style={{borderLeft:"thin solid #00000026"}}>
          <div className={style.topBarOptionContent}>지도</div>
        </div>
      </div>
    </div>
  )
}

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
    "경의중앙" : "#78C4A3",
    "공항철도" : "#3681B7",
    "수인분당" : "#FABE02",
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
  const gridDataJsx = useState(
    <div className={style.gridDataJsxContainer}>
      {gridData.map((data)=>{
        return(
          <div key={`grid-${data}`}>{data}</div>
        )
      })}
    </div>
  );
  const riskCriteriaJsx = useState(
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

const SubwayMapPage = ()=>{
  const [stationName, setStationName] = useState("서울역");
  const [currentStationInfo, setCurrentStationInfo] = useState([]);
  const [rainFall, setRainFall] = useState(null)
  const [currentRainFall, setCurrentRainFall] = useState(0)
  const [subwayList, setSubwayList] = useState([])
  const [similarSubwayShow, setSimilarSubwayShow] = useState(false)
  const [floodRisk, setFloodRisk] = useState(null)
  const [floodRiskLevel, setFloodRiskLevel] = useState(0)

  // 기본적인 데이터 로드
  useEffect(()=>{
    async function getSubwayList(){
      await axios.get("http://localhost:8000/subway/getAll")
      .then(async (res)=>{
        await setSubwayList(()=>res.data)
      })
      .catch((err)=>{
        console.log(err)
      });
    }
    async function getCurrentSubwayInfo(){
      await axios.get(`http://localhost:8000/subway/get?station=${stationName}`)
      .then(async (res)=>{
        const subwayData = res.data[0]
        const subwayCbc = CbcConvert.LlcToCbc([subwayData.lng, subwayData.lat])
        await setCurrentStationInfo(()=>res.data);
        return subwayCbc;
      }).then(async (cbc)=>{
        for(let i=1; i<3; i++){
          const roundNumber = Math.round(cbc[i]/100)
          cbc[i] = roundNumber
        }
        await axios.get(`http://localhost:8000/floodRisk/getByCbc?gidChar=${cbc[0]}&gidCode1=${cbc[1]}&gidCode2=${cbc[2]}`)
        .then(async (res)=>{
          await(setFloodRisk(()=>res.data[0]))
        })
      })
      .catch((err)=>{
        console.log(err)
      });
    }
    async function getRainFallData(){
      await axios.get(`http://localhost:8000/rain/get?city=seoul&Cumulative_time=30`)
      .then(res=>{
        setRainFall(()=>res.data)
      })
    }
    getSubwayList()
    getCurrentSubwayInfo()
    getRainFallData()
    const loadRainFall = setInterval(()=>getRainFallData(), 6000)
    return (()=>clearInterval(loadRainFall))
  }, [stationName]);

  // 현재 지역 강수량 데이터 저장
  useEffect(()=>{
    if(!floodRisk || !rainFall) return;
    const location = floodRisk['location'];
    if(Object.keys(rainFall).indexOf(location)>=0){
      const rainFallAmount = parseFloat(rainFall[location]['rainFall'])*2;
      setCurrentRainFall(()=>{
        const rainFall1Hour = parseFloat(rainFall[location]['rainFall'])*2;
        console.log(rainFall1Hour)
        return rainFall1Hour;
      });
      const rainFall3Hour = parseFloat(rainFall[location]['rainFall'])*6;
      const depth10Risk = floodRisk['depth10Risk'];
      const depth20Risk = floodRisk['depth20Risk'];
      const depth50Risk = floodRisk['depth50Risk'];
      if(rainFall3Hour == 0) setFloodRiskLevel(()=>0)
      else if(rainFall3Hour < depth10Risk) setFloodRiskLevel(1)
      else if(depth10Risk <= rainFall3Hour && rainFall3Hour < depth20Risk) setFloodRiskLevel(()=>3)
      else if(depth20Risk <= rainFall3Hour && rainFall3Hour < depth50Risk) setFloodRiskLevel(()=>5)
      else if(depth50Risk <= rainFall3Hour) setFloodRiskLevel(()=>8)
    }
  }, [floodRisk, rainFall])

  return(
    <div className={style.background} onClick={(e)=>{
      if(e.target.id !== 'input') setSimilarSubwayShow(false) 
    }}>
      <div className={style.sideBar}>
        <SideBarTop 
          subwayList={subwayList} 
          setStationName={setStationName} 
          similarSubwayShow={similarSubwayShow} 
          setSimilarSubwayShow={setSimilarSubwayShow}
        />
        <SideBarBottom 
          rainFall={currentRainFall} 
          currentStationInfo={currentStationInfo} 
          stationName={stationName}
          floodRiskLevel={floodRiskLevel}
        />
      </div>
      <SubwayMap/>
    </div>
  )
};

export default SubwayMapPage;
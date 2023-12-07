import React, { useEffect, useState } from 'react';
import SubwayMap from './SubwayMap';
import style from "./SubwayMapPage.module.css"
import CbcConvert from "../../modules/CbcConvert";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import SideBarTop from './SideBarTop';
import SideBarBottom from './SideBarBottom';

const SubwayMapPage = ()=>{
  const location = useLocation();
  const [stationName, setStationName] = useState(location.state?location.state.name:"서울역");
  const [currentStationInfo, setCurrentStationInfo] = useState(null);
  const [rainFall, setRainFall] = useState(null)
  const [currentRainFall, setCurrentRainFall] = useState(0)
  const [subwayList, setSubwayList] = useState(null)
  const [similarSubwayShow, setSimilarSubwayShow] = useState(false)
  const [floodRisk, setFloodRisk] = useState(null)
  const [floodRiskLevel, setFloodRiskLevel] = useState(0);
  
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
    getSubwayList();
  }, []);

  useEffect(()=>{
    async function getCurrentSubwayInfo(){
      await axios.get(`http://localhost:8000/subway/get?station=${stationName}`)
      .then(async (res)=>{
        const subwayData = res.data[0]
        const subwayCbc = CbcConvert.LlcToCbc([subwayData.lng, subwayData.lat])
        await setCurrentStationInfo(()=>res.data);
        return subwayCbc;
      })
      .then(async (cbc)=>{
        for(let i=1; i<3; i++){
          const roundNumber = Math.round(cbc[i]/100)
          cbc[i] = roundNumber
        }
        await axios.get(`http://localhost:8000/floodRisk/getByCbc?gidChar=${cbc[0]}&gidCode1=${cbc[1]}&gidCode2=${cbc[2]}`)
        .then(async (res)=>{
          await(setFloodRisk(()=>res.data[0]))
        }).catch((err)=>{
          console.log(err)
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
      .catch(err=>{
        console.log(err)
      })
    }
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
      setCurrentRainFall(()=>{
        const rainFall1Hour = parseFloat(rainFall[location]['rainFall'])*2;
        return rainFall1Hour;
      });
      const rainFall3Hour = parseFloat(rainFall[location]['rainFall'])*6;
      const depth10Risk = floodRisk['depth10Risk'];
      const depth20Risk = floodRisk['depth20Risk'];
      const depth50Risk = floodRisk['depth50Risk'];
      if(rainFall3Hour === 0) setFloodRiskLevel(()=>0)
      else if(rainFall3Hour < depth10Risk) setFloodRiskLevel(1)
      else if(depth10Risk <= rainFall3Hour && rainFall3Hour < depth20Risk) setFloodRiskLevel(()=>3)
      else if(depth20Risk <= rainFall3Hour && rainFall3Hour < depth50Risk) setFloodRiskLevel(()=>5)
      else if(depth50Risk <= rainFall3Hour) setFloodRiskLevel(()=>8)
    }else{
      setCurrentRainFall(()=>-1)
      setFloodRiskLevel(()=>0)
    }
  }, [floodRisk, rainFall])

  return(
    <div>
      {
        subwayList && currentStationInfo && rainFall &&
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
      }{
        (!subwayList || !currentStationInfo || !rainFall) && 
        <div className={style.square}>
          <div className={style.spin}></div>
          <div className={style.loadingMent}>Loading</div>
        </div>
      }
    </div>
  )
};

export default SubwayMapPage;
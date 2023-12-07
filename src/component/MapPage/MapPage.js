import Maps from './Maps'
import React, { useEffect, useRef, useState } from 'react'
import style from "./MapPage.module.css"
import images from '../../assets/images/images'
import axios from 'axios'
import { getSimilarRegion } from '../../modules/GetSimilarInput'
import { useLocation, useNavigate } from 'react-router-dom'

const mapStyle = {
  width:"100vw",
  height:"100vh"
}

const RiskGraph = ()=>{
  const gridData = [0, 10, 20, 50, "~"];
  const gridDataJsx = (
    <div className={style.gridDataJsxContainer}>
      {gridData.map((data)=>{
        return(
          <div key={`grid-${data}`}>{data}</div>
        )
      })}
    </div>
  );

  return(
    <div className={style.riskRraphContainer}>
      <div className={style.graphTitle}>예상 침수 높이</div>
      <div className={style.riskGraph}>
        {gridDataJsx}
      </div>
    </div>
  )
}

const MapPage = ()=>{
  const location = useLocation();
  const [mapCenter, setMapCenter] = useState(null);
  const [cityList, setCityList] = useState(null)
  const [regionList, setRegionList] = useState(null)
  const [currentRegion, setCurrentRegion] = useState(location.state?location.state.name:"서울")
  const [similarRegion, setSimilarRegion] = useState(null);
  const [similarRegionJsx, setSimilarRegionJsx] = useState([]);
  const [showSimilarRegion, setShowSimilarRegion] = useState(false);
  const [locationJsx, setLocationJsx] = useState(null)
  const [rainFall, setRainFall] = useState(null)
  const [currentRainFall, setCurrentRainFall] = useState("데이터 없음")
  const searchBoxRef = useRef(null)
  const navigate = useNavigate();

  // 도시 정보 받아옴
  useEffect(()=>{
    // 도시 정보 받아옴
    async function getRegionList(){
      await axios.get("https://floodingpoint.p-e.kr/city/getAll")
      .then(async (res)=>{
        await setCityList(()=>res.data.data)
        return res.data.data
      })
      .then(async (city)=>{
        let tmp = {}
        for(let i=0; i<city.length; i++){
          const cityName = city[i]['name'];
          await axios.get(`https://floodingpoint.p-e.kr/city/subRegion/city?city=${cityName}`)
          .then((res)=>{
            const data = res.data.data;
            tmp[cityName] = data;
          })
          .catch((err)=>console.log(err))
        }
        await setRegionList(()=>tmp)
      })
      .catch(err=>{
        console.log(err)
      })
    };
    getRegionList();
  }, []);

  // 중심 위치 변경
  useEffect(()=>{
    try{
      if(!currentRegion || !cityList || !regionList) return;
      const currentRegionData = currentRegion.split(" ");
      for(let i=0; i<cityList.length; i++){
        const city = cityList[i];
        if(city['name'] === currentRegionData[0]){
          let tmpCenter = {}
          tmpCenter = ({
            "lat":((city['maxLat']+city['minLat'])/2),
            "lng":((city['maxLng']+city['minLng'])/2),
          });
          if(currentRegionData.length>1 && regionList[city['name']].length>0){
            const currentRegionList = regionList[city['name']];
            for(let j=0; j<currentRegionList.length; j++){
              const data = currentRegionList[j];
              if(data['name'] === currentRegionData[1]){
                tmpCenter = ({
                  "lat":data['lat'], 'lng':data['lng']
                })
              }
            }
          }
          setMapCenter(()=>tmpCenter);
          break;
        }
      }
    }catch(err){
      console.log(err)
    }
  }, [currentRegion, cityList, regionList])

  // location 정보 갱신
  useEffect(()=>{
    const lst = currentRegion.split(" ");
    const tmp = []
    for(let i=0; i<lst.length; i++){
      tmp.push(
        <div className={style.locationName} key={`${lst[i]}-${i}`}>
          {lst[i]}
        </div>
      )
      if(i<(lst.length-1)){
        tmp.push(
          <img src={images.locationPointer} alt='locationPointer' className={style.locationPointer} key={i}/>
        )
      }
    }
    setLocationJsx(()=>tmp);
  },[currentRegion]);

  // 강수량 정보 받아옴
  useEffect(()=>{
    try{
      const lst = currentRegion.split(" ");
      async function getRainFall(){
        await axios.get(`https://floodingpoint.p-e.kr/rain/get?city=${lst[0]}&Cumulative_time=30`)
        .then(async (res)=>{
          let rainFallData = res.data;
          const keys = Object.keys(rainFallData);
          for(let i=0; i<keys.length; i++){
            if(!rainFallData[keys[i]]) continue;
            rainFallData[keys[i]]['rainFall'] *= 6;
          }
          await(setRainFall(()=>rainFallData));
        }).catch(err=>{
          console.log(err)
        })
      }
      getRainFall();
      const rainFallInterval = setInterval(getRainFall, 10000);
      return (()=>clearInterval(rainFallInterval));
    }catch(err){
      console.log(err)
    }
  },[currentRegion])

  // 현재 지역 강수량 구하기
  useEffect(()=>{
    if(!rainFall || !currentRegion) return;
    const lst = currentRegion.split(" ");
    let tmp = -1;
    if(lst.length===1){
      const keys = Object.keys(rainFall);
      for(let i=0; i<keys.length; i++){
        if(tmp<0) tmp=0;
        tmp+=rainFall[keys[i]]['rainFall'];
      }
      tmp = tmp/keys.length;
    }else if(rainFall[lst[1]]){
      if(tmp<0) tmp = 0;
      tmp = rainFall[lst[1]]['rainFall']
    }
    if(tmp<0) tmp="데이터 없음"
    else setCurrentRainFall(()=><div className={style.rainFallValue}>{`${Math.round(tmp*200)/100}mm/h`}</div>);
  },[currentRegion, rainFall])

  useEffect(()=>{
    if(!similarRegion) return;
    const tmpSimilarInputJsx = [];
    similarRegion.forEach((data)=>{
      tmpSimilarInputJsx.push(
        <div 
          key={data} 
          id='searchBox'
          className={style.similarRegion}
          onClick={()=>{
            searchBoxRef.current.value=data;
            setCurrentRegion(()=>data.trim());
          }}
        >
          {data}
        </div>
      );
    });
    setSimilarRegionJsx(()=>tmpSimilarInputJsx);
  }, [similarRegion]);

  const showSimilarRegionHandler = (e)=>{
    const target = e.target;
    if(target.id==='searchBox') setShowSimilarRegion(true);
    else{
      setShowSimilarRegion(()=>false)
    };
  }

  const searchBoxChangeHandler = (e)=>{
    if(!regionList || !cityList || !e.target.value) return;
    if(e.target.value === "") return;
    const regionArray = getSimilarRegion(e.target.value, cityList, regionList);
    setSimilarRegion(()=>regionArray);
  }

  const searchEnterHandler = (e)=>{
    if(similarRegionJsx.length===0) return;
    if(e.key==='Enter'){
      const searchValue = similarRegionJsx[0].key;
      searchBoxRef.current.value = searchValue;
      setCurrentRegion(()=>searchValue.trim());
    }
  }

  return(
  <div>
    {(regionList && cityList && rainFall && mapCenter) &&
    <div className={style.MapPageBackground} onClick={showSimilarRegionHandler}>
      <div className={style.topBar}>
        <div className={style.inputContainer}>
          <div className={style.logoMenu}>
            <div className={style.logo} onClick={()=>navigate("/")}>
              <span className={style.logoLeft}>Flooding</span>
              <span className={style.logoRight}>P</span>
              <span className={style.logoRight}>oint</span>
            </div>
          </div>
          <div className={style.inputWrapper}>
            <input 
              className={style.searchBox} 
              onChange={searchBoxChangeHandler} 
              ref={searchBoxRef} 
              id='searchBox' 
              onFocus={showSimilarRegionHandler} 
              onKeyDown={searchEnterHandler} 
              maxLength={20}
            />
            {
              showSimilarRegion && similarRegionJsx.length>0 && 
              <div className={style.similarRegionContainer}  id='searchBox'>{similarRegionJsx}</div>
            }
          </div>
        </div>
        <div className={style.locationInfoContainer}>
          <div className={style.location}>
            {locationJsx}
          </div>
          <div className={style.rainFall}>
            <img src={images.rainIconWhite} alt='rainIcon' className={style.rainIcon}/>
            {currentRainFall}
          </div>
        </div>
        <div className={style.buttonContainer} onClick={()=>navigate("/subway")}>
          <img src={images.subwayIcon} alt='subwayMap' className={style.subwayMapButton}/>
        </div>
      </div>
      <Maps 
        mapStyle={mapStyle} 
        cityName={(currentRegion.split(" "))[0]} 
        mapCenter={mapCenter} rainFall={rainFall} 
      />
      <RiskGraph/>
    </div>}
    {
      (!regionList || !cityList || !rainFall || !mapCenter) && 
      <div className={style.square}>
        <div className={style.spin}></div>
        <div className={style.loadingMent}>Loading</div>
      </div>
    }
</div>
  )
};

export default MapPage;
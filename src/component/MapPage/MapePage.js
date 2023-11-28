import Maps from './Maps'
import React, { useEffect, useRef, useState } from 'react'
import style from "./MapPage.module.css"
import images from '../../assets/images/images'
import axios from 'axios'

const mapStyle = {
  width:"100vw",
  height:"100vh"
}

const RiskGraph = ()=>{
  const gridData = [0, 10, 20, 50, "~"];
  const gridDataJsx = useState(
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
  const [mapCenter, setMapCenter] = useState({
    "lat":37.5666103, "lng":126.9783882
  })
  const [cityList, setCityList] = useState(null)
  const [regionList, setRegionList] = useState(null)
  const [currentRegion, setCurrentRegion] = useState("서울")
  const [similarRegionJsx, setSimilarRegionJsx] = useState([]);
  const [showSimilarRegion, setShowSimilarRegion] = useState(false);
  const [locationJsx, setLocationJsx] = useState(null)
  const [rainFall, setRainFall] = useState(null)
  const [currentRainFall, setCurrentRainFall] = useState("데이터 없음")
  const searchBoxRef = useRef(null)

  // 도시 정보 받아옴
  useEffect(()=>{
    // 도시 정보 받아옴
    async function getRegionList(){
      await axios.get("http://localhost:8000/city/getAll")
      .then(async (res)=>{
        await setCityList(()=>res.data.data)
        return res.data.data
      })
      .then(async (city)=>{
        let tmp = {}
        for(let i=0; i<city.length; i++){
          const cityName = city[i]['name'];
          await axios.get(`http://localhost:8000/city/subRegion/city?city=${cityName}`)
          .then((res)=>{
            const data = res.data.data;
            tmp = ({...tmp, [cityName]:data})
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
      if(!currentRegion || !cityList) return;
      const currentRegionData = currentRegion.split(" ");
      for(let i=0; i<cityList.length; i++){
        const city = cityList[i];
        if(city['name'] == currentRegionData[0]){
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
  }, [currentRegion])

  // location 정보 갱신
  useEffect(()=>{
    const lst = currentRegion.split(" ");
    const tmp = []
    for(let i=0; i<lst.length; i++){
      tmp.push(
        <div className={style.locationName}>
          {lst[i]}
        </div>
      )
      if(i<(lst.length-1)){
        tmp.push(
          <img src={images.locationPointer} alt='locationPointer' className={style.locationPointer}/>
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
        await axios.get(`http://localhost:8000/rain/get?city=${lst[0]}&Cumulative_time=30`)
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
  },[])

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
      console.log(keys)
    }else if(rainFall[lst[1]]){
      if(tmp<0) tmp = 0;
      tmp = rainFall[lst[1]]['rainFall']
    }
    if(tmp<0) tmp="데이터 없음"
    else setCurrentRainFall(()=><div className={style.rainFallValue}>{`${tmp*2}mm/h`}</div>);
  },[currentRegion, rainFall])
  const showSimilarRegionHandler = (e)=>{
    const target = e.target;
    if(target.id==='searchBox') setShowSimilarRegion(true);
    else{
      setShowSimilarRegion(()=>false)
    };
  }

  const searchBoxChangeHandler = (e)=>{
    if(!regionList || !cityList) return;
    const value = e.target.value;
    const valueArray = value.split(" ")
    const regionArray = []
    const tmp = []
    searchBoxRef.current.value = value;
    for(let i=0; i<cityList.length; i++){
      const cityName = cityList[i]['name'];
      const regionData = regionList[cityName];
      if(cityName.indexOf(valueArray[0]) >= 0) regionArray.push(cityName);
      for(let j=0; j<regionData.length; j++){
        let cityDetail = regionData[j]['name']
        // 비슷한 단어가 아니면 continue
        let skipAble = true;
        for(let i=0; i<valueArray.length; i++){
          if(cityDetail==='0') continue;
          const v = valueArray[i]
          if(cityName.indexOf(v)<0 && cityDetail.indexOf(v)<0){
            continue;
          }
          skipAble = false;
        }
        if(skipAble) continue;
        // region 문자열 생성
        const region = `${cityName} ${cityDetail}`;
        regionArray.push(region);
      }
    }
    regionArray.forEach((data)=>{
      tmp.push(
        <div 
          key={data} 
          id='searchBox'
          className={style.similarRegion}
          onClick={()=>{
            searchBoxRef.current.value=data;
            setCurrentRegion(()=>data);
          }}
        >
          {data}
        </div>
      );
    });
    setSimilarRegionJsx(()=>tmp)
  }

  const searchEnterHandler = (e)=>{
    if(similarRegionJsx.length===0) return;
    if(e.key==='Enter'){
      const searchValue = similarRegionJsx[0].key;
      searchBoxRef.current.value = searchValue;
      setCurrentRegion(()=>searchValue);
    }
  }

  return(
  <div className={style.MapPageBackground} onClick={showSimilarRegionHandler}>
    <div className={style.topBar}>
      <div className={style.inputContainer}>
        <div className={style.logoMenu}>
          <img src={images.menu} alt='menu' className={style.menu}/>
          <div className={style.logo}>LOGO</div>
        </div>
        <div className={style.inputWrapper}>
          <input className={style.searchBox} onChange={searchBoxChangeHandler} ref={searchBoxRef} id='searchBox' onFocus={showSimilarRegionHandler} onKeyPress={searchEnterHandler}/>
          {showSimilarRegion && similarRegionJsx.length>0 && <div className={style.similarRegionContainer}  id='searchBox'>{similarRegionJsx}</div>}
        </div>
      </div>
      <div className={style.locationInfoContainer}>
        <div className={style.location}>
          {locationJsx}
        </div>
        <div className={style.rainFall}>
          <img src={images.rainIcon} alt='rainIcon' className={style.rainIcon}/>
          {currentRainFall}
        </div>
      </div>
      <div className={style.buttonContainer}>
        <img src={images.subwayIcon} alt='subwayMap' className={style.subwayMapButton}/>
      </div>
    </div>
    <Maps mapStyle={mapStyle} cityName={(currentRegion.split(" "))[0]} mapCenter={mapCenter} rainFall={rainFall}/>
    <RiskGraph/>
  </div>  
  )
};

export default MapPage;
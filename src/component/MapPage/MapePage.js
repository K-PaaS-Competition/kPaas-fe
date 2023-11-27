import Maps from './Maps'
import React, { useEffect, useRef, useState } from 'react'
import style from "./MapPage.module.css"
import images from '../../assets/images/images'
import axios from 'axios'
import { constSelector } from 'recoil'

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
      <div>예상 침수 높이</div>
      <div className={style.riskGraph}>
        {gridDataJsx}
      </div>
    </div>
  )
}

const MapPage = ()=>{
  const [map, setMap] = useState(null)
  const [mapCenter, setMapCenter] = useState({
    "lat":null, "lng":null
  })
  const [cityList, setCityList] = useState(null)
  const [regionList, setRegionList] = useState(null)
  const [currentRegion, setCurrentRegion] = useState("서울")
  const [currentRegionInfo, setCurrentRegionInfo] = useState(null)
  const [similarRegionJsx, setSimilarRegionJsx] = useState([]);
  const [showSimilarRegion, setShowSimilarRegion] = useState(false);
  const searchBoxRef = useRef(null)

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

  useEffect(()=>{
    if(!currentRegion || !cityList) return;
    const currentRegionData = currentRegion.split(" ");
    console.log("city : ", cityList)
    for(let i=0; i<cityList.length; i++){
      const city = cityList[i];
      if(city['name'] == currentRegionData[0]){
        let tmpCenter = {}
        console.log(city)
        setCurrentRegionInfo(()=>city);
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
        console.log(tmpCenter);
        setMapCenter(()=>tmpCenter);
        break;
      }
    }
  }, [currentRegion])

  useEffect(()=>{
    if(map && mapCenter){
      const position = [mapCenter['lat'], mapCenter['lng']];
      map.target.setView(position, 13);
    }
  },[mapCenter])

  const showSimilarRegionHandler = (e)=>{
    const target = e.target;
    if(target.id==='searchBox') setShowSimilarRegion(true);
    else{
      setShowSimilarRegion(()=>false)
    };
  }

  const mapMoveHandler = ()=>{
    if(map){
      const position = [37.5, 127]
      map.target.setView(position, 13)
    }
  }

  const searchBoxChangeHandler = (e)=>{
    if(!regionList || !cityList) return;
    const value = e.target.value;
    const tmp = []
    searchBoxRef.current.value = value;
    for(let i=0; i<cityList.length; i++){
      const cityName = cityList[i]['name'];
      const regionData = regionList[cityName];
      for(let j=0; j<regionData.length; j++){
        let cityDetail = regionData[j]['name']
        // 비슷한 단어가 아니면 continue
        let valueArray = value.split(" ")
        let skipAble = true;
        for(let i=0; i<valueArray.length; i++){
          const v = valueArray[i]
          if(cityName.indexOf(v)<0 && cityDetail.indexOf(v)<0){
            continue;
          }
          skipAble = false;
        }
        if(skipAble) continue;
        // 세부 지역이 비어있으면 빈 문자열로 변경
        if(cityDetail==='0') cityDetail=''
        // region 문자열 생성
        const region = `${cityName} ${cityDetail}`;
        tmp.push(
          <div 
            key={region} 
            id='searchBox'
            className={style.similarRegion}
            onClick={()=>{
              searchBoxRef.current.value=region;
              setCurrentRegion(()=>region);
            }}
          >
            {region}
          </div>
        )
      }
    }
    tmp.push(
      <div 
        key={"region"} 
        id='searchBox'
        className={style.similarRegion}
        onClick={()=>{
          searchBoxRef.current.value="대전";
          setCurrentRegion(()=>"대전");
        }}
      >
        {"대전"}
      </div>
    )
    setSimilarRegionJsx(()=>tmp)
  }

  return(
  <div className={style.MapPageBackground} onClick={showSimilarRegionHandler}>
    <div className={style.topBar}>
      <div className={style.inputContainer}>
        <div className={style.logoMenu}>logoMenu</div>
        <div className={style.inputWrapper}>
          <input className={style.searchBox} onChange={searchBoxChangeHandler} ref={searchBoxRef} id='searchBox' onFocus={showSimilarRegionHandler}/>
          {showSimilarRegion && similarRegionJsx.length>0 && <div className={style.similarRegionContainer}  id='searchBox'>{similarRegionJsx}</div>}
        </div>
      </div>
      <div className={style.locationInfoContainer}>
        <div className={style.location}>location</div>
        <div className={style.rainFall}>rainFall</div>
      </div>
      <div className={style.buttonContainer}>
        <img src={images.subwayIcon} alt='subwayMap' className={style.subwayMapButton}/>
      </div>
      <button onClick={mapMoveHandler}>test</button>
    </div>
    <Maps mapStyle={mapStyle} cityName={(currentRegion.split(" "))[0]} setMap={setMap} mapCenter={mapCenter}/>
    <RiskGraph/>
  </div>  
  )
};

export default MapPage;
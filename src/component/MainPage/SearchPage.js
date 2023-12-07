import React, { useEffect, useRef, useState } from 'react';
import style from "./SearchPage.module.css";
import images from '../../assets/images/images';
import {getSimilarRegion, getSimilarSubway} from "../../modules/GetSimilarInput";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchPage = ({setPage})=>{
  const [mapType,setMapType] = useState("map");
  const [subwayList, setSubwayList] = useState(null);
  const [cityList, setCityList] = useState(null);
  const [regionList, setRegionList] = useState(null);
  const [similarInput, setSimilarInput] = useState(null);
  const [similarInputJsx, setSimilarInputJsx] = useState(null);
  const [showSimilarInput, setShowSimilarInput] = useState(false); 
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(()=>{
    async function getRegionList(city){
      let tmp = {}
      for(let i=0; i<city.length; i++){
        const cityName = city[i]['name'];
        await axios.get(`http://49.50.164.200:8000/city/subRegion/city?city=${cityName}`)
        .then((res)=>{
          const data = res.data.data;
          tmp[cityName] = data;
        })
        .catch((err)=>console.log(err))
      }
      await setRegionList(()=>tmp)
    }
    async function getCityList(){
      await axios.get("http://49.50.164.200:8000/city/getAll")
      .then(async (res)=>{
        await setCityList(()=>res.data.data)
        return res.data.data
      })
      .then(async (city)=>{
        getRegionList(city);
      })
      .catch(err=>{
        console.log(err)
      })
    };
    async function getSubwayList(){
      //'https://cors-anywhere.herokuapp.com/
      // await axios.get("http://49.50.164.200:8000/subway/getAll")
      await axios.get("'https://cors.bridged.cc/http://49.50.164.200:8000/subway/getAll")
      .then(async (res)=>{
        await setSubwayList(()=>res.data)
      })
      .catch((err)=>{
        console.log(err)
      });
    };
    getCityList();
    getSubwayList();
  }, []);

  useEffect(()=>{
    const handleClickSimilarInput = (e)=>{
      if(!similarInput || similarInput.length===0) return;
      if(!e.target.innerText) return;
      inputRef.current.value = e.target.innerText;
      if(mapType === "map"){
        navigate("/map", {state:{"name":e.target.innerText}});
      }else if(mapType === "subway"){
        const stationName = ((e.target.innerText).split(" "))[0];
        navigate("/subway", {state:{"name":stationName}})
      }
    }

    if(!similarInput) return;
    const tmpSimilarInputJsx = [];
    for(let i=0; i<similarInput.length; i++){
      tmpSimilarInputJsx.push(
        <div 
          key={`${i} - ${Math.random(0,1)}`}
          className={style.similarInput} 
          id='similarInput' 
          onClick={handleClickSimilarInput}
        >
          {mapType==='map'?similarInput[i]:`${similarInput[i]['name']} ${similarInput[i]['line']}`}
        </div>
      )
    }
    setSimilarInputJsx(()=>tmpSimilarInputJsx);
  }, [similarInput, mapType, navigate]);

  const handleScroll = (e) => {
    if(e.target.id === "similarInput") return;
    if(e.deltaY < 0){
      setPage((prev)=>{
        if(prev===1){
          return prev-1;
        }
        return prev;
      });
    }
  };

  const handleClick = (e)=>{
    if(e.target.id === "similarInput") return;
    setShowSimilarInput(()=>false);
  }

  const mapTypeHandler = (e)=>{
    const targetId = e.currentTarget.id;
    setMapType(()=>targetId);
    setSimilarInput(()=>null);
    setSimilarInputJsx(()=>null);
    inputRef.current.value = "";
  };

  const searchBoxChangeHandler = (e)=>{
    let tmpList;
    if(mapType === "map"){
      tmpList = getSimilarRegion(inputRef.current.value, cityList, regionList);
      setSimilarInput(()=>tmpList);
    }else if(mapType === "subway"){
      tmpList = getSimilarSubway(inputRef.current.value, subwayList);
    }
    setSimilarInput(()=>tmpList);
  };

  const handleSearchButtonClick = (e)=>{
    if(!similarInput) return;
    const inputData = similarInput[0];
    if(!inputData) return;

    if(mapType === "map"){
      inputRef.current.value = inputData;
      navigate("/map", {state:{"name":inputData.trim()}});
    }else if(mapType === "subway"){
      inputRef.current.value = inputData['name'];
      const subwayName = inputData['name'];
      navigate("/subway", {state:{
        "name":subwayName.trim()
      }});
    }
  };

  const enterSearchHandler = (e)=>{
    if(e.key === "Enter"){
      if(!similarInput || similarInput.length===0) return;
      if(mapType === "map"){
        inputRef.current.value = similarInput[0]
        navigate("/map", {state:{"name":similarInput[0].trim()}})
      }else if(mapType === "subway"){
        inputRef.current.value = similarInput[0]['name']
        navigate("/subway", {state:{"name":similarInput[0]['name'].trim()}})
      }
    }
  }

  return(
    <div className={style.background} onWheel={handleScroll} onClick={handleClick}>
      <div className={style.searchService}>
        <div className={style.searchBoxOption}>
          <span className={style.title}>Search</span>
          <div className={style.optionDivisor}/>
          <span className={mapType==='map'?style.selectedMapOption:style.mapOption} id='map' onClick={mapTypeHandler}>map</span>
          <div className={style.optionDivisor}/>
          <span className={mapType==='subway'?style.selectedMapOption:style.mapOption} id='subway' onClick={mapTypeHandler}>subway</span>
        </div>
        <div className={style.searchBoxContainer}>
          <input 
            className={style.searchBox} 
            ref={inputRef} 
            onChange={searchBoxChangeHandler} 
            id='similarInput' 
            onFocus={()=>setShowSimilarInput(true)} 
            onKeyDown={enterSearchHandler}
            maxLength={25}
          />
          {showSimilarInput && similarInput && similarInput.length>0 && <div className={style.simiarInputContainer} id='similarInput'>{similarInputJsx}</div> }
          <div className={style.submitButtonContainer} onClick={handleSearchButtonClick}>
            <img
              src={images.searchIcon} 
              alt='submitButton' 
              className={style.submitButton}
            />
          </div>
        </div>
      </div>
      <div className={style.footer}>
        <span className={style.explain}>
          {"쉬운 검색 기능을 통해서"} <br/> {"원하는 정보를 빠르게 찾아보세요"}
        </span>
      </div>
    </div>
  )
}

export default SearchPage;
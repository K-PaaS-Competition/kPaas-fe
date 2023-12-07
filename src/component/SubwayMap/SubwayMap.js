  import React, { useRef, useState } from 'react';
  import images from '../../assets/images/images';
  import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
  import style from './SubwayMap.module.css'

  const subwayMapList = [
    "수도권",
    "부산",
    "대전",
  ]

  const subwayMapScale = {
    "수도권":{
      width:120,
      height:64
    },
    "부산":{
      width:120,
      height:40
    },
    "대전":{
      width:100,
      height:30
    },
  }

  function SubwayMap() {
    const otherSubwayRef = useRef();
    const [otherSubwayClick, setOtherSubwayClick] = useState(false);
    const [selected, setSelected] = useState("수도권")

    const SelectMapHandler = ((e)=>{
      const value = e.target.textContent;
      setSelected(()=>value);
    });

    const subwayMapSelectBar = (
      <div className={style.tools} style={{top:"3rem", justifyContent:"right"}}>
        <div className={style.subwayMapSelectBar}>
          {subwayMapList.map((data)=>{
            let color = "#000000";
            if(data === selected) color = "#656565";
            return(
              <div 
                key={`mapList-${data}`}
                className={style.subwayMapList}
                onClick={SelectMapHandler}
                style={{
                  color:color
                }}
              >
                {data}
              </div>
            );
        })}
        </div>
      </div>
    );

    const otherSubwayClickHandler = (e)=>{
      if(otherSubwayClick === false){
        otherSubwayRef.current.style.transform = "rotate(180deg)";
      }else{
        otherSubwayRef.current.style.transform = "rotate(0deg)";
      }
      otherSubwayRef.current.style.transition = "0.2s";
      setOtherSubwayClick((prev)=>!prev);
    };

    return (
      <div className={style.background}>
        <TransformWrapper 
          initialScale={1} 
          minScale={1} 
          maxScale={4} 
        >
          {({ zoomIn, zoomOut, resetTransform}) => (  
          <React.Fragment>
            <div className={style.tools}> 
              <div className={style.zoomButtonBox}>
                <button onClick={() => zoomIn()} className={style.zoomInOutCenterButton}>+</button>
                <button onClick={() => zoomOut()} className={style.zoomInOutCenterButton}>-</button>
              </div>
              <div className={style.selectMapButton} onClick={otherSubwayClickHandler}>
                <span style={{fontWeight:"700"}}>{selected}</span>
                <img src={images.showOtherSubway} className={style.otherSubway} ref={otherSubwayRef} alt='showOtherSubway'/>
              </div>
            </div>
            {otherSubwayClick && subwayMapSelectBar}
            <TransformComponent 
              wrapperStyle={{    
                position: "relative",
                width:"calc(100vw-21rem)",
                height: "100vh",
                maxWidth:"100vw",
                overflow: "hidden",
                userSelect: "none",
                margin: 0,
                padding: 0,
              }}
              contentStyle={{
                display:"flex",
                flexDirection:"row",
                flexWrap:"wrap",
                width:`${subwayMapScale[selected].width}rem`,
                height:`${subwayMapScale[selected].height}rem`,
                margin: 0,
                padding: 0,
                transformOrigin: "0% 0%"
              }}
            >
              <img src={images[`subwayRoute${selected}`]} alt="subway map"  className={style.subwayMap}/>
            </TransformComponent>
          </React.Fragment>
        )}

        </TransformWrapper>
      </div>
    );
  }

  export default SubwayMap;
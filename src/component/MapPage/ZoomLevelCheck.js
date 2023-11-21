import React, { useState } from 'react';
import {useMap, useMapEvents, Polygon, Tooltip } from 'react-leaflet';
import CbcConvert from '../../modules/CbcConvert';
import 'leaflet/dist/leaflet.css';

const ZoomLevelCheck = (props) => {
  const [mapZoomLevel, setMapZoomLevel] = useState(props.zoomLevel); // initial zoom level provided for MapContainer
  var [lineArr, setLineArr] = useState([]);
  const map = useMap();
  let state = true; // 초기화 시 한번만 실행하기 위한 state 변수

  const mapEvents = useMapEvents({
    // 지도 zoom 종료
    zoomend: () => {
      setMapZoomLevel(mapEvents.getZoom());
      setLineArr(
        CbcConvert.lineArray(
          mapZoomLevel,
          map.getBounds().getSouthWest(),
          map.getBounds().getNorthEast()
        )
      );
    },
    // 지도 움직임 종료
    moveend: () => {
      setLineArr(
        CbcConvert.lineArray(
          mapZoomLevel,
          map.getBounds().getSouthWest(),
          map.getBounds().getNorthEast()
        )
      );
    }
  });

  map.whenReady(() => {
    if (state) {
      // 전체지도에 대한 grid array 그리기
      lineArr = CbcConvert.lineArray(
        mapZoomLevel,
        map.getBounds().getSouthWest(),
        map.getBounds().getNorthEast()
      );
      state = false;
    }
  });

  const cbcCmp = (cbc1, cbc2)=>{
    if(cbc1[0]>cbc2[0]) return 1;
    else if(cbc1[0]<cbc2[0]) return -1;
    else if((cbc1[1]-cbc2[1])>10) return 1;
    else if((cbc1[1]-cbc2[1])<-10) return -1;
    else if((cbc1[2]-cbc2[2])>10) return 1;
    else if((cbc1[2]-cbc2[2])<-10) return -1;
    return 0;
  } 
  const getSameData = (cbc)=>{
    let s=0, e=props.floodRisk.length-1
    let m
    const arr = props.floodRisk
    while(s<=e){
      m = Math.floor((s+e)/2)
      const data = arr[m]
      if(!data['gidChar']) break;
      const cmp = [data['gidChar'], data['gidCode1'], data['gidCode2']]
      const cmpRes = cbcCmp(cmp, cbc)
      if(cmpRes>0){
        e = m-1;
      }else if(cmpRes<0){
        s = m+1;
      }else if(cmpRes===0){
        return {"data":data}
      }
    }
    return null;
  }

  const getColor = (grs80Codinate)=>{
    const rainFall = 30
    const cbc = CbcConvert.LlcToCbc(grs80Codinate)
    for(let i=1; i<cbc.length; i++){
      cbc[i] = parseInt(cbc[i])
    }
    let cmp
    cmp = getSameData(cbc)
    if(cmp===null) return "grey"
    const data = cmp["data"]
    if(data["depth10Risk"] && rainFall <= data["depth10Risk"]) return "green";
    if(data["depth20Risk"] && rainFall >= data["depth10Risk"] && rainFall<data["depth20Risk"]) return "yellow";
    if(data["depth50Risk"] && rainFall >= data["depth20Risk"] && rainFall<data["depth50Risk"]) return "orange";
    if(data["depth50Risk"] && data["depth50Risk"]<=rainFall) return "red";
  }

  if (lineArr.length !== 0) {
    function checkBound(llc){
      const cityInfo = props.cityInfo
      if(llc[0] > cityInfo.maxLng || llc[0] < cityInfo.minLng) return false;
      if(llc[1] > cityInfo.maxLat || llc[1] < cityInfo.minLat) return false;
      return true;
    }
    const result =  (
      <div>
        {lineArr.map(({ id, latLongArr, cbcText, ref }) => {
          if(!checkBound(ref)) return;
          return (
            <Polygon
              key={id}
              positions={latLongArr}
              color={getColor(ref)}
              pathOptions={{weight:0}}
            >
            </Polygon>
          );
        })}
      </div>
    );
    return result;
  } else {
    return null;
  }
}

export default ZoomLevelCheck
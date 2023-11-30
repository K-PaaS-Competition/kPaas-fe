import React, { useState, useEffect } from 'react';
import {useMap, useMapEvents, Polygon, Tooltip } from 'react-leaflet';
import CbcConvert from '../../modules/CbcConvert';
import 'leaflet/dist/leaflet.css';

const RiskPolygonSet = (props) => {
  const [mapZoomLevel, setMapZoomLevel] = useState(props.zoomLevel); // initial zoom level provided for MapContainer
  const [polygonData, setPolygonData] = useState()
  const [lineArr, setLineArr] = useState([]);
  const map = useMap();

  useEffect(() => {
    if(!props.rainFall || !props.floodRisk) return;
    const newLineArray = CbcConvert.lineArray(
      mapZoomLevel,
      map.getBounds().getSouthWest(),
      map.getBounds().getNorthEast()
    );
    setLineArr(()=>[...newLineArray]);
  }, [props.rainFall, props.floodRisk]);

  const mapEvents = useMapEvents({
    zoomend: () => {
      setMapZoomLevel(mapEvents.getZoom());
      setLineArr(()=>
        CbcConvert.lineArray(
          mapZoomLevel,
          map.getBounds().getSouthWest(),
          map.getBounds().getNorthEast()
        )
      );
    },

    moveend: () => {
      const newLineArray = CbcConvert.lineArray(
        mapZoomLevel,
        map.getBounds().getSouthWest(),
        map.getBounds().getNorthEast()
      );
      setLineArr(()=>[...newLineArray]);
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
    if(!props.floodRisk) return null;
    let s=0, e=props.floodRisk.length-1;
    let m
    const arr = props.floodRisk;
    while(s<=e){
      try{
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
      }catch(err){
        console.log(err);
        break;
      }
    }
    return null;
  }

  const getColor = (grs80Codinate)=>{
    try{
      const cbc = CbcConvert.LlcToCbc(grs80Codinate)
      let color = "grey";
      for(let i=1; i<cbc.length; i++){
        cbc[i] = parseInt(cbc[i])
      }
      let cmp
      cmp = getSameData(cbc)
      if(cmp===null){
        return "grey";
      }
      const data = cmp["data"];
      const location = data["location"]
      if(!props.rainFall || !props.rainFall[location]) return color;
      const rainFall = props.rainFall[location].rainFall;
      if(data["depth10Risk"] && rainFall <= data["depth10Risk"]) color= "green";
      if(data["depth20Risk"] && rainFall >= data["depth10Risk"] && rainFall<data["depth20Risk"]) color= "yellow";
      if(data["depth50Risk"] && rainFall >= data["depth20Risk"] && rainFall<data["depth50Risk"]) color= "orange";
      if(data["depth50Risk"] && data["depth50Risk"]<=rainFall) color= "red";
      return color;
    }catch(err){
      console.log(err)
    }
  }

  useEffect(() => {
    if (lineArr.length !== 0) {
      const result = lineArr.map(({ id, latLongArr, cbcText, ref }) => (
        <Polygon
          key={`${id}-${Math.random()}`}
          positions={latLongArr}
          color={getColor(ref)}
          pathOptions={{ weight: 2}}
        >
        </Polygon>
      ));
      setPolygonData(result);
    } else {
      setPolygonData(null);
    }
  }, [lineArr]);

  return(
    <div>{polygonData}</div>
  )
};

export default RiskPolygonSet
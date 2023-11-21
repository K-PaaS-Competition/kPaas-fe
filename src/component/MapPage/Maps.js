import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import images from '../../assets/images/images';
import CbcConvert from '../../modules/CbcConvert';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import ZoomLevelCheck from './ZoomLevelCheck';

const customIcon = new Icon({
  iconUrl: images.marker, // 아이콘 이미지 URL
  iconSize: [30, 30], // 아이콘 크기
  iconAnchor: [22, 94], // 아이콘 앵커포인트
  popupAnchor: [-3, -76] // 팝업 앵커포인트
});

const MapEvents = (props)=>{
  useMapEvents({
    mousemove: (e)=>{
      const llc = e.latlng;
      props.setMousePosition(()=>({
        lng:llc.lng,
        lat:llc.lat
      }));
    }
  })
  return null;
}

const Maps = (props) => {
  const [grid, setGrid] = useState({})  
  const [zoomLevel, setZoomLevel] = useState(7);
  const [position, setPosition] = useState({
    lng:0,
    lat:0
  });
  const [mousePosition, setMousePosition] = useState({
    lng:position.lng,
    lat:position.lat
  });
  const [floodRisk, setFloodRisk] = useState([{
    "location":null,
    "gidChar":null,
    "gidCode1":null,
    "gidCode2":null,
    "depth10Risk":null,
    "depth20Risk":null,
    "depth50Risk":null,
  }])
  const [cityInfo, setCityInfo] = useState({
    "name": "seoul",
    "maxLat": 37.715133,
    "maxLng": 127.269311,
    "minLat": 37.413294,
    "minLng": 126.734086
  })

  useEffect(()=> {
    async function getFloodRiskData() {
      await axios.get("http://localhost:8000/data/getFloodRisk?cityname=seoul")
      .then(async (res)=>{
        let data = res.data.data;
        for(let i=0; i<data.length; i++){
          const d = data[i]
          if(d['gidCode1']<10) data[i]['gidCode1']*=1000;
          else if(d['gidCode1']<100) data[i]['gidCode1']*=100
          if(d['gidCode2']<10) data[i]['gidCode2']*=1000;
          else if(d['gidCode2']<100) data[i]['gidCode2']*=100
        }
        data.sort(function(a,b){
          if(a['gidChar']> b['gidChar']) return 1;
          else if(a['gidChar']<b['gidChar']) return -1;
          else if(a['gidCode1']>b['gidCode1']) return 1;
          else if(a['gidCode1']<b['gidCode1']) return -1;
          else if(a['gidCode2']>b['gidCode2']) return 1;
          else if(a['gidCode2']<b['gidCode2']) return -1;
          return 0;
        })
        await setFloodRisk(()=>data)
      })
      .catch((err)=>{
        console.log(err)
      });
    }
    async function getCityData(){
      await axios.get("http://localhost:8000/city/get?name=seoul")
      .then(async(res)=>{
        const cityData = res.data.data
        const centerLat = (cityData.maxLat + cityData.minLat)/2
        const centerLng = (cityData.maxLng + cityData.minLng)/2
        await setCityInfo(()=>cityData)
        await setPosition(()=>{
          return {
            "lat":centerLat,
            "lng":centerLng
          }
        })
      }).catch(err=>{
        console.log(err)
      })
    }
    getFloodRiskData();
    getCityData()
  }, []);
  const cbc = CbcConvert.LlcToCbc([position.lng, position.lat]); 
  return (
    <div>
      <MapContainer 
        style={props.mapStyle}
        center={position}
        zoom={zoomLevel}
        minZoom={13}
        scrollWheelZoom={true}
        maxBounds={[
          [cityInfo.minLat, cityInfo.minLng], // 왼쪽 아래 좌표
          [cityInfo.maxLat, cityInfo.maxLng]  // 오른쪽 위 좌표
        ]}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomLevelCheck zoomLevel={zoomLevel} floodRisk={floodRisk} cityInfo={cityInfo} grid={grid} setGrid={setGrid}/>
        <MapEvents setMousePosition={setMousePosition}/>
        <Marker position={position} icon={customIcon}>
          <b>{`${cbc[0]} ${cbc[1]} ${cbc[2]}`}</b>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default Maps

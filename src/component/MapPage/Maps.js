import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon, point } from 'leaflet';
import images from '../../assets/images/images';
import CbcConvert from '../../modules/CbcConvert';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import RiskPolygonSet from './RiskPolygonSet';

const customIcon = new Icon({
  iconUrl: images.marker, // 아이콘 이미지 URL
  iconSize: [30, 30], // 아이콘 크기
  iconAnchor: [22, 94], // 아이콘 앵커포인트
  popupAnchor: [-3, -76] // 팝업 앵커포인트
});

const UpdateBounds = ({bounds, position}) => {
  const map = useMap();
  useEffect(() => {
    map.whenReady(()=>{
      map.setView(position, 15);
    });
  }, [map, position]);

  useEffect(() => {
    map.setMaxBounds(bounds);
    if(!position || !position['lat']) return;
    map.setView(position)
  }, [bounds, map, position]);

  return null;
};

const Maps = (props) => {
  const [zoomLevel, setZoomLevel] = useState(13);
  const [floodRisk, setFloodRisk] = useState(null);
  const [cityInfo, setCityInfo] = useState({
    "name": "seoul",
    "maxLat": 37.715133,
    "maxLng": 127.269311,
    "minLat": 37.413294,
    "minLng": 126.734086
  })

  useEffect(()=> {
    try{
      async function getFloodRiskData() {
        await axios.get(`http://localhost:8000/floodRisk/get?city=${props.cityName}`)
        .then(async (res)=>{
          let data = res.data.data;
          for(let i=0; i<data.length; i++){
            const d = data[i]
            if(d['gidCode1']<100) data[i]['gidCode1']*=100
            if(d['gidCode2']<100) data[i]['gidCode2']*=100
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
        await axios.get(`http://localhost:8000/city/get?city=${props.cityName}`)
        .then(async(res)=>{
          const cityData = res.data.data
          await setCityInfo(()=>cityData)
        }).catch(err=>{
          console.log(err)
        })
      }
      getFloodRiskData();
      getCityData();
    }catch(err){
      console.log(err)
    }
  }, [props.cityName]);

  return (
      <div>
        <MapContainer 
          style={props.mapStyle}
          center={props.mapCenter}
          zoom={zoomLevel}
          minZoom={13}
          scrollWheelZoom={true}
          maxBounds={[
            [cityInfo.minLat, cityInfo.minLng], // 왼쪽 아래 좌표
            [cityInfo.maxLat, cityInfo.maxLng]  // 오른쪽 위 좌표
          ]}
          zoomControl={false}
        >
          <UpdateBounds 
            bounds={[
              [cityInfo.minLat, cityInfo.minLng], // 왼쪽 아래 좌표
              [cityInfo.maxLat, cityInfo.maxLng]  // 오른쪽 위 좌표
            ]} 
            position={props.mapCenter}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RiskPolygonSet zoomLevel={zoomLevel} floodRisk={floodRisk} rainFall={props.rainFall}/>
          <Marker position={props.mapCenter} icon={customIcon}></Marker>
        </MapContainer>
      </div>
  )
}

export default Maps

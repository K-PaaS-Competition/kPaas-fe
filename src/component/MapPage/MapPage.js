import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polygon, Tooltip } from 'react-leaflet';
import { Icon } from 'leaflet';
import leaflet from 'leaflet';
import images from '../../assets/images/images';
import CbcConvert from '../../modules/CbcConvert';
import 'leaflet/dist/leaflet.css';

const customIcon = new Icon({
  iconUrl: images.marker, // 아이콘 이미지 URL
  iconSize: [30, 30], // 아이콘 크기
  iconAnchor: [22, 94], // 아이콘 앵커포인트
  popupAnchor: [-3, -76] // 팝업 앵커포인트
});

const MapEvents = (props)=>{
  const map = useMapEvents({
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

const MapPage = () => {
  const [zoomLevel, setZoomLevel] = useState(7);
  const [position, setPosition] = useState({
    lat: 36.37216,
    lng: 127.36035
  });
  const [mousePosition, setMousePosition] = useState({
    lng:position.lng,
    lat:position.lat
  });
  const getCbcAsString = (llc)=>{
    const cbcCode = CbcConvert.LlcToCbc(llc);
    return `${cbcCode[0]} ${cbcCode[1]} ${cbcCode[2]}`
  }
  const [map, setMap] = useState(null);
  const cbc = CbcConvert.LlcToCbc([position.lng, position.lat]); 
  const hdlr = (e)=>{
    console.log(mousePosition);
  }

  return (
    <div>
      <div>{`${mousePosition.lng} ${mousePosition.lat}`}</div>
      <div>{getCbcAsString([mousePosition.lng, mousePosition.lat])}</div>
      <MapContainer 
        style={{height:"100vh"}}
        center={position}
        zoom={zoomLevel}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents setMousePosition={setMousePosition}/>
        <Marker position={position} icon={customIcon}>
          <b>{`${cbc[0]} ${cbc[1]} ${cbc[2]}`}</b>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default MapPage

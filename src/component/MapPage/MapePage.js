import Maps from './Maps'
import React from 'react'

const mapStyle = {
  width:"100vw",
  height:"100vh"
}
const MapPage = ()=>{
  return(
  <div>
    <Maps mapStyle={mapStyle} cityName={"서울"}/>
  </div>  
  )
};

export default MapPage;
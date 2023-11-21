import Maps from './Maps'
import React from 'react'

const mapStyle = {
  width:"90rem",
  height:"70rem"
}
const MapPage = ()=>{
  
  return(
  <div>
    <Maps mapStyle={mapStyle}/>
  </div>
  )
};

export default MapPage;
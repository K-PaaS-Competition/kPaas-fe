export const getSplitedInput = (data)=>{
  const tmp = data.split(" ");
  const res = [];
  for(let i=0; i<tmp.length; i++){
    if(tmp[i] === "") continue;
    res.push(tmp[i]);
  }
  return res;
};

const isSimilar = (inputList, data)=>{
  const cmp = getSplitedInput(data);
  for(let i=0; i<cmp.length; i++){
    for(let j=0; j<inputList.length; j++){
      if(cmp[i].indexOf(inputList[j])<0) continue;
      return true;
    }
  }
  return false;
};

export const getSimilarSubway = (data, subwayList)=>{
  if(!subwayList || !data) return;
  const tmpSimilarList = [];
  const inputList = getSplitedInput(data);
  for(let i=0; i<subwayList.length; i++){
    const subwayName = subwayList[i]['name'];
    const subwayLine = subwayList[i]['line'];
    if(isSimilar(inputList, subwayName)) tmpSimilarList.push({
      "name":subwayName,
      "line":subwayLine
    });
  }
  return tmpSimilarList;
};

export const getSimilarRegion = (data, cityList, regionList)=>{
  if(!cityList || !regionList || !data) return;
  const tmpSimilarList = [];
  const inputList = getSplitedInput(data);
  if(inputList.length===0) return tmpSimilarList;
  for(let i=0; i<cityList.length; i++){
    const city = cityList[i]['name'];
    const region = regionList[city];
    if(region.length===0 && isSimilar(inputList, city)){
      console.log(inputList, city);
      tmpSimilarList.push(city);
    }
    for(let j=0; j<region.length; j++){
      const regionName = region[j]['name'];
      const cityRegion = `${city} ${regionName}`;
      if(isSimilar(inputList, cityRegion)){
        tmpSimilarList.push(cityRegion);
      }
    }
  }
  return tmpSimilarList;
};
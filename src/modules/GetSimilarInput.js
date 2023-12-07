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

const getWeight = (inputList, dataList)=>{
  let res = 0;
  for(let i=0; i<inputList.length; i++){
    const input = inputList[i];
    let maxWeight = 0;
    for(let j=0; j<dataList.length; j++){
      const data = dataList[j];
      let idx = 0, similar = 0;
      for(let k=0; k<data.length; k++){
        if(data[k] === input[idx]){
          similar+=1;
          idx+=1;
        }
      }
      let weight = similar/(data.length + input.length);
      if(weight>=maxWeight){
        maxWeight=weight;
      }
    }
    res += maxWeight;
  }
  return res/(inputList.length + dataList.length);
}

export const getSimilarRegion = (data, cityList, regionList)=>{
  if(!cityList || !regionList || !data) return;
  const tmpSimilarList = [];
  const weightObj = {};
  const inputList = getSplitedInput(data);
  if(inputList.length===0) return tmpSimilarList;
  for(let i=0; i<inputList.length; i++){
    for(let j=0; j<cityList.length; j++){
      const city = cityList[j]['name']
      if(regionList[city].length===0 && isSimilar(inputList, city)){
        const weight = getWeight(inputList, [city]);
        if(weightObj[city] === undefined) weightObj[city] = {"name":city, "weight":weight};
        else weightObj[city]["weight"] = Math.max(weight, weightObj[city]["weight"]);
      }
      for(let k=0; k<regionList[city].length; k++){
        const data = (`${city.trim()} ${regionList[city][k]['name'].trim()}`).trim();
        if(!isSimilar(inputList, data)) continue;
        const dataList = getSplitedInput(data);
        const weight = getWeight(inputList, dataList);
        if(weightObj[data] === undefined) weightObj[data] = {"name":data, "weight":weight};
        else weightObj[data]["weight"] = Math.max(weight, weightObj[data]["weight"]);
      }
    }
  }
  const weightList = (Object.values(weightObj));
  weightList.sort((data1, data2)=>{
    const w1 = data1["weight"];
    const w2 = data2["weight"];
    if(w1 < w2) return 1;
    else if(w1 === w2) return 0;
    return -1;
  });
  for(let i=0; i<weightList.length; i++){
    tmpSimilarList.push(weightList[i]['name']);
  }
  return tmpSimilarList;
};
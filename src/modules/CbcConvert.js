import proj4 from 'proj4'

export const w = { 7: "가", 8: "나", 9: "다", 10: "라", 11: "마", 12: "바", 13: "사" };
export const h = {13: "가", 14: "나", 15: "다", 16: "라", 17: "마", 18: "바", 19: "사", 20: "아",};

const grs80 =
  "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs";
const wgs84 =
  "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";


// LLC(경위도 좌표)를 CBC(국가 지점 번호 좌표)로 전환
const LlcToCbc = (llcCode)=>{
  //proj(사작 좌표계, 목표 좌표계, data) : 시작 좌표계인 data를 목표 좌표계로 바꿈
  const grs80Codinate = proj4(wgs84, grs80, llcCode)
  const widthProj4 = parseInt(grs80Codinate[0].toString().split(".")[0]);
  const heightProj4 = parseInt(grs80Codinate[1].toString().split(".")[0]);
  // code : [가나, xxxxx, yyyyy]
  const code = [
    w[Math.floor(Math.floor(widthProj4)/100000)] + h[Math.floor(Math.floor(heightProj4)/100000)],
    Math.floor((widthProj4%100000) / 10),
    Math.floor((heightProj4%100000) / 10),
  ]
  return code;
}


// CBC를 LLC로 변환
// CBC : [cbcWChar][cbcHChar] [code1] [code2] (ex. 가나 1234 4432) 
const CbcToLlc = (_cbcCode)=>{
  // 중간에 있는 " "를 없애고 배열 형태로 반환 --> cbcCode[0]=가나
  const cbcCode = _cbcCode.split(" ");
  const cbcWChar = cbcCode[0].charAt(0);
  const cbcHChar = cbcCode[0].charAt(1);
  const llc = [null, null]
  //w의 모든 value(가나다 등)에 대해서 경도계수 구하기
  Object.keys(w).forEach((key)=>{
    const keyValue = parseInt(key);
    if(w[keyValue] === cbcWChar){
      llc[0] = keyValue;
    }
  });
  //h의 모든 value(가나다 등)에 대해서 위도계수 구하기
  Object.keys(h).forEach((key)=>{
    const keyValue = parseInt(key);
    if(h[keyValue] === cbcHChar){
      llc[1] = keyValue;
    }
  });
  // 잘못된 입력이라면 -1 반환
  if(llc[0]===null || llc[1]===null || cbcCode[1].length !== cbcCode[2].length)
    return -1;
  // 경도 = 경도계수*100000 + code1 + 5
  // 위도 = 위도계수*100000 + code2 + 5
  const length = cbcCode[1].length + 1;
  llc[0] = Math.pow(10, length)*llc[0] + parseInt(cbcCode[1])*Math.pow(10, 6-length) + 5
  llc[1] = Math.pow(10, length)*llc[1] + parseInt(cbcCode[2])*Math.pow(10, 6-length) + 5
  // 구한 위경도
  const llcCode = proj4(grs80, wgs84, [llc[0], llc[1]])
  return llcCode;
}


// grid 배열을 생성하는 코드
// m : 격자 간격
// minX, maxX : x축 최소/최댓값
// minY, maxY : y축 최소/최댓값
const samplePointXY = (m, minX, maxX, minY, maxY)=>{
  const TKM = 100000;
  // x와 y에 대한 min, max 값이 범위를 벗어난다면 최소/최대값으로 설정
  // x : 700000 ~ 1500000
  // y : 1300000 ~ 2200000
  if(minX <= 7*TKM) minX = 7*TKM;
  if(maxX >= 15*TKM) maxX = 15*TKM;
  if(minY <= 13*TKM) minY = 7*TKM;
  if(maxY >= 22*TKM) maxY = 22*TKM;
  // 모든 x, y값이 들어가도록 min, max값 조율
  const getAdjustedLimitValue = (data, diff)=>{
    if(Math.floor(data/m)*m < data){
      return (Math.floor(data/m)+diff)*m;
    }else{
      return Math.floor(data/m)*m;
    }
  }
  minX = getAdjustedLimitValue(minX, -1);
  minY = getAdjustedLimitValue(minY, -1);
  maxX = getAdjustedLimitValue(maxX, 1);
  maxY = getAdjustedLimitValue(maxY, 1);
  // 격자 데이터 생성
  // gridArray : gridArrayElement들을 담는 배열
  // gridArrayElement : 특정 x축 값에 대한 y축 값의 경위도 데이터를 담는 배열
  const gridArray = [];
  for(let x = minX; x<=maxX; x+=m){
    const gridArrayElement = [];
    for(let y=minY; y<=maxY; y+=m){
      const llcData = proj4(grs80, wgs84, [x, y]);
      gridArrayElement.push(llcData);
    }
    gridArray.push(gridArrayElement);
  }
  return gridArray;
}


// 특정 경위도 좌표가 한국 지도에 들어가는지 필터링하기 위한 함수
const isInnerBound = (codinate)=>{
  // filter = w : [h1, h2] 꼴의 데이터
  // = 어떤 w값에 대한 h값이 h1와 h2 사이에 있다.
  const grs80Codinate = proj4(wgs84, grs80, codinate);
  const TKM = 100000;
  const filter = {
  7: [13, 21],
  8: [13, 20],
  9: [14, 21],
  10: [15, 21],
  11: [15, 21],
  12: [17, 21],
  13: [18, 21],
  };
  // 입력값의 경도([0]), 위도([1]) 데이터를 반올림 후 TKM으로 나눈다.
  // --> filter에서 key값 계산
  const codinateWValue = Math.round(grs80Codinate[0])
  const codinateHValue = Math.round(grs80Codinate[1]);
  // filter 데이터의 키값 구하기
  const filterKey = Math.floor(codinateWValue/TKM);
  const filterData = filter[filterKey];
  if(!filterData) return false;
  if(codinateHValue >= filterData[0]*TKM && codinateHValue < filterData[1]*TKM){
    return true
  }else{
    return false;
  }
}


// 각각의 grid에 표시할 text 생성 (ex. 가나 1234 4321)
// scale : 배율 , cordinate : CBC 좌표 ([가나] [1234] [4321])
const getLabelText = (scale, cordinate)=>{
  try{
    const longtitude = Math.floor(cordinate[1] / (scale/10)).toString();
    const latitude = Math.floor(cordinate[2] / (scale/10)).toString();
    if(scale === 100000){
      return cordinate[0];
    }else if(scale === 10000){ // 두 자리 데이터 표현 ( ex. 가나 12xxx 43xxx )
      return `${cordinate[0]} ${longtitude.toString()}XXX ${latitude.toString()}XXX`
    }else if(scale === 1000){ // 세 자리 데이터 표현 ( ex. 가나 123xx 432xx )
      return `${cordinate[0]} ${longtitude.toString()}XX ${latitude.toString()}XX`
    }else if(scale === 100){ // 네 자리 데이터 표현 ( ex. 가나 1234x 4321x )
      return `${cordinate[0]} ${longtitude.toString()}X ${latitude.toString()}X`
    }else if(scale === 10){ // 다섯 자리 데이터 표현 ( ex. 가나 12345 54321 )
      return `${cordinate[0]} ${longtitude.toString()} ${latitude.toString()}`
    }else{ // 이런 데이터는 존재하지 않는다 --> undefined
      return undefined;
    }
  }catch(err){
    console.log(err);
  }
}

// grid를 그리는 함수
const lineArray = (zoomLevel, _startLlc, _endLlc)=>{
  const returnArray = [];
  const startLlc = proj4(wgs84, grs80, [_startLlc.lng, _startLlc.lat])
  const endLlc = proj4(wgs84, grs80, [_endLlc.lng, _endLlc.lat])
  // zoomLevel에 따라서 grid를 다르게 생성한다.
  let scale = 10000;
  // if(zoomLevel>19) scale = 10;
  // else if(zoomLevel>16) scale = 100;
  // else 
  if(zoomLevel>12) scale = 1000;
  // grid 배열 생성
  const gridArray = samplePointXY(scale, startLlc[0], endLlc[0], startLlc[1], endLlc[1]);
  for(let i=0; i<gridArray.length; i++){
    for(let j=0; j<gridArray[i].length; j++){
      const dataX0Y0 = gridArray[i][j];
      try{
        if(isInnerBound(dataX0Y0) && i+1<gridArray.length && j+1<gridArray[i].length){
          const dataX1Y0 = gridArray[i+1][j];
          const dataX0Y1 = gridArray[i][j+1];
          const dataX1Y1 = gridArray[i+1][j+1];
          const centerX = (dataX0Y0[0]+dataX1Y1[0])/2;
          const centerY = (dataX0Y0[1]+dataX1Y1[1])/2;
          const cbc = LlcToCbc([centerX, centerY]);
          let cbcLabelText = "";
          if(cbc) cbcLabelText = getLabelText(scale, cbc);
          returnArray.push({
            latLongArr: [ // 00, 10, 11, 01 순으로 들어감.
            [dataX0Y0[1], dataX0Y0[0]],
            [dataX1Y0[1], dataX1Y0[0]],
            [dataX1Y1[1], dataX1Y1[0]],
            [dataX0Y1[1], dataX0Y1[0]]
          ],
            id: zoomLevel.toString() + "." + gridArray[i][j] + "y",
            cbcText: cbcLabelText,
            ref:gridArray[i][j],
          })
        }
      }catch(err){
        console.log("indefined err : " + err);
        continue;
      }
    }
  }
  return returnArray;
}

const CbcConvert = { LlcToCbc, lineArray, CbcToLlc };
export default CbcConvert;
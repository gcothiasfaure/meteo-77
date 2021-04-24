const { response } = require('express');
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient; 

/* GET home page. */
router.get('/', function(req, res, next) {
  const url = 'mongodb://localhost:27017';

  //recovery of the base url
  let donnees = parseTrame(req.baseUrl);

  //array which contains the differents types
  type_table = donnees[0];

  //array which contains the dates
  dates = donnees[1];

  const promises = [];
  //for each type a promise is created to get the corresponding datas at the dates asked by the user
  type_table.forEach(type => {
    promises.push(new Promise((resolve, reject) => {      
      chooseDb(type,dates,resolve);
      
    }))
  })    
  
  //when every promises are done, a final json object is created containing the final 
  Promise.all(promises)
    .then(promises => {
      let data = {"idStation" :"030",
          "sensors":[]
        }
      promises.forEach(p => {
          data['sensors'].push(p); 
      })
    res.json(data)
    })
});



module.exports = router;

/**
 * Cette fonction permet de choisir la bonne fonction à appeler en fonction du type de données demandées 
 * @param {array} type 
 * @param {array} dates 
 * @param {callback function} fn 
 */
function chooseDb(type,dates,fn){
  let dataType;
  if(type == "temperature" || type == "humidity" || type == "pressure"){
    dataType = callTph(type,dates,fn);
  }else if(type == "rain"){
    return callRainCounter(type,dates,fn);
  }else if(type == "location"){
    return callGpsNmea(type,dates,fn);
  }else if( type == "luminosity" || type == "wind_heading" 
  || type == "wind_speed_avg" || type == "wind_speed_max" || type == "wind_speed_min" ){
    return callSensors(type,fn);
  }
}

/**
 * This function return datas contained in the sensors table
 * @param {array} type 
 * @param {array} dates 
 * @param {callback function} fn 
 */
function callSensors(type,dates,fn){
  let unit;
  if(type == 'luminosity'){
    unit = 'Lux';
  }else if(type == 'humidity'){
    unit = '°';
  }else{
    unit = "Kts";
  }
    
  const dbName = 'meteo';
  const url = 'mongodb://localhost:27017';
  //mongo connection
  MongoClient.connect(url, function(err, client) { 
    const db = client.db(dbName);
    let dataSensors =  {"type": type,
    "unit":unit,
    "mes": []
    }
    let query = {};
    let sort = {};
    let limit = 0;
    if(dates.length == 1){
      query = { "$gt" : new Date(dates[0])};
    }else if(dates.length == 2){
      query = { "$gt" :new Date(dates[0]),"$lt" :new Date(dates[1])};
    }else{
      query = { "$ne" :new Date("0000-00-00T00:00:00.000Z")};
      sort = {"date":-1};
      limit = 1;
    }
    db.collection("sensors").find({"date": query},{"date":1,"measure.name":1,"measure.value":1}).sort(sort).limit(limit).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    
    for(i=0;i<result.length; i++){
      for(j=0;j<result[i].measure.length;j++){
        if(result[i].measure[j].name == type){
          dataSensors['mes'].push({
            "date":result[i].date, 
            "value":Number(result[i].measure[j].value)}) 
        }
      }             
    }
    fn(dataSensors);
    })
    client.close();
    
  });
}

/**
 * This function return datas contained in the gpsNmea table
 * @param {array} type 
 * @param {array} dates 
 * @param {callback function} fn 
 */
function callGpsNmea(type,dates,fn){
  const dbName = 'meteo';
  const url = 'mongodb://localhost:27017';
  MongoClient.connect(url, function(err, client) { 
    const db = client.db(dbName);
    let dataGpsNmea =  {"type": type,
    "unit":"lat/lon",
    "mes": []
    }
    let query = {};
    let sort = {};
    let limit = 0;
    if(dates.length == 1){
      query = { "$gt" : new Date(dates[0])};
    }else if(dates.length == 2){
      query = { "$gt" : new Date(dates[0]),"$lt" : new Date(dates[1])};
    }
    else{
      query = { "$ne" :new Date("0000-00-00T00:00:00.000Z")};
      sort = {"time":-1};
      limit = 1;
    }
    console.log(query);
    db.collection("gpsNmea").find({"time":query}).sort(sort).limit(limit).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    for(i=0;i<result.length; i++){
      	dataGpsNmea['mes'].push({
                  "date":result[i].time, 
                  "value":{
                    "lat":result[i].lat,
                    "lon":result[i].lon}
              })        
    }
    fn(dataGpsNmea);
    })
    client.close();
    
  });
}

/**
 * This function return datas contained in the rainCounter table
 * @param {array} type 
 * @param {array} dates 
 * @param {callback function} fn 
 */
function callRainCounter(type,dates,fn){
  const dbName = 'meteo';
  const url = 'mongodb://localhost:27017';
  MongoClient.connect(url, function(err, client) { 
    const db = client.db(dbName);
    let dataRainCounter =  {"type": type,
    "unit":"",
    "mes": []
    }
    let query = {};
    let sort = {};
    let limit = 0;
    if(dates.length == 1){
      query = { "$gt" :new Date( dates[0])};
    }else if(dates.length == 2){
      query = { "$gt" :new Date(dates[0]),"$lt" :new Date(dates[1])};
    }
    else{
      query = { "$ne" :new Date("0000-00-00T00:00:00.000Z")};
      sort = {"date":-1};
      limit = 1;
    }
    console.log(query);
    db.collection("rainCounter").find({"date": query}).sort(sort).limit(limit).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    console.log(result.length);
    for(i=0;i<result.length; i++){
      	dataRainCounter['mes'].push({
                  "date":result[i].date, 
                  "value":result[i].date})        
    }
    fn(dataRainCounter);
    })
    
    client.close();
    
  });
} 


/**
 * This function return datas contained in the tph table
 * @param {array} type 
 * @param {array} dates 
 * @param {callback function} fn 
 */
function callTph(type, dates,fn){
  
  let rType = "";
  let unit;
  if(type == 'temperature'){
    rType = 'temp';
    unit = '°C';
  }else if(type == 'humidity'){
    rType = 'hygro';
    unit = '%';
  }else{
    rType = 'press';
    unit = "hP";
  }
  const dbName = 'meteo';
  const url = 'mongodb://localhost:27017';
  MongoClient.connect(url, function(err, client) { 
    const db = client.db(dbName);
    let dataTph =  {"type": type,
    "unit":unit,
    "mes": []
    }

    let query = {};
    let sort = {};
    let limit = 0;
    if(dates.length == 1){
      query = { "$gt" : new Date(dates[0])};
    }else if(dates.length == 2){
      query = { "$gt" :new Date(dates[0]),"$lt" :new Date(dates[1])};
    }
    else{
      query = { "$ne" :new Date("0000-00-00T00:00:00.000Z")};
      sort = {"date":-1};
      limit = 1;
    }
    db.collection("tph").find({"date": query},{date:1,[rType]:1,_id:0}).sort(sort).limit(limit).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    
    for(i=0;i<result.length; i++){
      dataTph['mes'].push(result[i]);        
    }
    fn(dataTph);
    })
    client.close();
    
  });
}

/**
 * this function convert a date
 * @param {date} date 
 */
function convertDate(date){
  const rdate = new Date(date * 1000);
  return rdate;
}

/**
 * This function parse the frame sent by the client into understandable data for the api
 * @param {string} trame 
 */
function parseTrame(trame){
  const trameArray = trame.split("/");
  let types = trameArray[1].split(",");
  if(types[0] == 'all' ){
    types = ['temperature','humidity','pressure','rain','location','wind_heading','wind_speed_min','wind_speed_avg','luminosity','wind_speed_max'];
  }
  let dates = [];
  if(trameArray.length > 2){
    dates = trameArray[2].split(",");
  
    for(i=0;i < dates.length;i++){
      dates[i] = convertDate(dates[i]);
    }
  }
  console.log(dates);
  return [types,dates];
}

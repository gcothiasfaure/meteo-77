const { Console } = require('console');
const fs = require('fs');
const chokidar = require('chokidar');
const mongodb = require('mongodb');
const GPS = require('gps');

// path to the datafiles
const sensors = "../sensors";
const tph = "../tph.log";
const rainCounter = "../rainCounter.log";
const gpsNmea ="../gpsNmea";
const allFiles = [sensors,tph,rainCounter,gpsNmea];
const lineReader = require('line-reader');

const watcher = chokidar.watch(allFiles,{
    awaitWriteFinish: { stabilityThreshold: 500},
});
watcher.on("change", (path) => insertInDb(path));

/**
 * This function add datas from the file in the raspberry to the mongodb database
 * @param {string} path 
 */
function insertInDb(path){
    const fileArray = path.split("/");
    const fileWithExtension = fileArray[fileArray.length -1];
    const fileExtArray = fileWithExtension.split(".");
    const file = fileExtArray[0];
    let MongoClient = require('mongodb').MongoClient;  
    let url = "mongodb://localhost:27017/"; 

    //Mongo db connection
    MongoClient.connect(url, function(err, client) {  
        if (err) throw err;  
        const db = client.db('meteo');

        //if the path correspond to the gps nmea file
        if(file == "gpsNmea"){
            // each line is parsed and added to the gpsNmea table
            lineReader.eachLine(path, function(line) {
                let gps = new GPS;
                gps.on('data', function(parsed) {
                    return parsed;
                });
                gps.update(line);
        
                let data_parsed = gps.state;
                data_parsed['time'].setHours(data_parsed['time'].getHours() + 1 );
                db.collection(file).insertOne(data_parsed, function(err, res) {  
                    if (err) console.log("erreur mongo:" , err);  
                    console.log("1 " + file + "record inserted");
                });
            });

            
        }else{
            fs.readFile(path, 'utf8' , (err, data) => {
                if (err) {
                console.error(err)
                return
                }
                 //if the path correspond to the rainCounter file the data are added to the rainCounter table
                if(file == "rainCounter"){
                    data = data.substring(0, data.length - 1);
                    data = new Date(data);
                    let data_parsed = {"date" : data};
                    console.log(data);
                    console.log(data_parsed);
                    db.collection(file).insertOne(data_parsed, function(err, res) {  
                        if (err) console.log("erreur mongo:" , err); 
                        console.log("1 " + file + " record inserted");
                    }); 
                }    

                //if the path correspond to the sensors  file the data are added to the sensors table
                else if(file == 'sensors'){
                    let data_parsed = JSON.parse(data);
                    data_parsed['date'] = new Date(data_parsed['date']);
                    data_parsed['date'].setHours( data_parsed['date'].getHours() + 1 );
                    db.collection(file).insertOne(data_parsed, function(err, res) {  
                        if (err) console.log("erreur mongo:" , err); 
                        console.log("1 " + file + " record inserted");
                    });
                }
                //if the path correspond to the tph  file the data are added to the tph table
                else{
                let data_parsed = JSON.parse(data);
                data_parsed['date'] = data_parsed['date'].substring(0, (data_parsed['date'].length - 3));
                data_parsed['date'] = data_parsed['date'].concat("Z");
                data_parsed['date'] = new Date(data_parsed['date']);
                db.collection(file).insertOne(data_parsed, function(err, res) {  
                    if (err) console.log("erreur mongo:" , err); 
                    console.log("1 " + file + " record inserted");
                }); 
                }
                
            });
        }
    });
}

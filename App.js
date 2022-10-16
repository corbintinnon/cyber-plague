
import MapView, { Marker } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { getPreciseDistance } from 'geolib';
import { getDatabase, ref, onValue, set, database,get, child } from 'firebase/database';
var userLocation;
var location;
var id;
var sickdic={};
var healthydic={};
var everyCoord={};
import { initializeApp} from "firebase/app";
import firebase from "firebase/app";
import "firebase/firestore";
import { connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBVh4dfFfBD1yda1R0QB59wNS7m-g79KNQ",
  authDomain: "digitalplagueplayerdata.firebaseapp.com",
  projectId: "digitalplagueplayerdata",
  storageBucket: "digitalplagueplayerdata.appspot.com",
  messagingSenderId: "479186524469",
  appId: "1:479186524469:web:0329eeac8285b94bad947c",
  measurementId: "G-NXBSV6E16M"
};
let app =initializeApp(firebaseConfig);
const db = getDatabase(app);

function setUpGPSListener(userId) {
  const db = getDatabase();
  var coordinates;
  const reference = ref(db, 'users/'+userId);
  onValue(reference, (snapshot) => {
   coordinates = (snapshot.val().coordinates);
  return coordinates;
  });
  return coordinates;
}


function Infection(userId) {
  const db = getDatabase();
  // const clearDict = dict => {
  //   Object.keys(dict).map(key => delete dict[key]);
  // };
  // clearDict(sickdic);
  // clearDict(healthydic);
  var sick;
  var coordinates;
  const reference = ref(db, 'users/'+userId);
  onValue(reference, (snapshot) => {
    //console.log(snapshot.val().infectionStatus)
    sick = snapshot.val().infectionStatus;
    coordinates = snapshot.val().coordinates;
    everyCoord[userId]={coordinates,sick};
  
      
    })
  return sick;
}


function storePlayerStatus(userId, gps,infected) {
  const db = getDatabase();
  const reference = ref(db, 'users/' + userId);
  set(reference, {
    nameKey: userId,
    coordinates: gps,
    infectionStatus: infected,
  });
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export default function App(){
  var ret=[];
  var ard=[];
  var color;
  useEffect(() => {
    (async () => {
      // ... persmissions check
    let { status } = await Location.requestForegroundPermissionsAsync();
     if (status !== 'granted') {
      console.log('Permission to access location was denied');
    return;
    }
      returned= await Second();
      location=returned[0];
      id=returned[1];
      setUerLocation(location);
      var sVar=0;
      if (id == "Ryan")
        sVar = 1;
      else
        sVar = 0;
      console.log("ONLY ONCE PER INITIALIZE")
      
      storePlayerStatus(id,[location.coords.latitude, location.coords.longitude],sVar);
      console.log(everyCoord)
      // Infection(id)



      })()
   }, [] );
  const hope=ref(db, "users");
  const starCountRef = ref(db,"users");
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
   for (var balls in data){
    var gooba=setUpGPSListener(balls);
    Infection(balls);
    const coord= {latitude: gooba[0], longitude:gooba[1]}
    if(Infection(balls)==0){
      color='blue'
    }else{
      color='red'
    }
    ret.push({"coordinates": coord, "pinColor":color})
   }
    
  });


  const [userLocation, setUerLocation] = useState(null);
  useEffect(() => {
    (async () => {
     
      // ... persmissions check
    let { status } = await Location.requestForegroundPermissionsAsync();
     if (status !== 'granted') {
      console.log('Permission to access location was denied');
    return;
    }
    

      returned= await Second();
      for (var h in everyCoord) {
        for (var s in everyCoord) {
          
          if((everyCoord[h]["sick"]==0&&everyCoord[s]["sick"]==1)){

          const dist= getPreciseDistance({latitude: everyCoord[s]["coordinates"][0], longitude: everyCoord[s]["coordinates"][1] }, 
                          {latitude: everyCoord[h]["coordinates"][0] , longitude: everyCoord[h]["coordinates"][1] })

          if (dist < 3&&dist!=0) {
            console.log(h + " is sick!");
            storePlayerStatus(h, everyCoord[h]["coordinates"], 1); 
          }
          
        }
        }
      } 
      location=returned[0];
      id=returned[1];
      setUerLocation(location);
      storePlayerStatus(id,[location.coords.latitude, location.coords.longitude],Infection(id));
        
  

      })()
  })
  
  return (
   
    <View style={styles.container}>
      <MapView style={{width: '100%', height: '100%'}} initialRegion={{
        latitude:38.65554095045284, 
        longitude:-90.30184704768077,
        latitudeDelta:0.001,
        longitudeDelta:0.001
      }

      }>
        
      {ret.map((marker,index,pinColor) => (
      <Marker 
      
      key={index}
      coordinate={marker.coordinates}
      pinColor={marker.pinColor}
      /*if sick
      icon=red marker
      else
      icon=blue*/
      
    />
    ))}
       
        {/* Circle center={userLocation.coords} radius={1000} fillColor={"red"}  */}
      </MapView>
    </View>
  )
} 
async function Second(){
  await new Promise(r => setTimeout(r, 1000));
  const id = await Device.deviceName;
  //console.log(id);
  accuracy: Location.Accuracy.High
  const location = await Location.getCurrentPositionAsync({})
/* distance in meter-gonna use distance of 2 meters for tag */
return [location,id];

};

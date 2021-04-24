<template>

    <div>

      <h3 class="text-center mt-4 mb-4">Localisation des stations</h3>

      <!-- Info si aucune station dispo -->
      <div v-if="nbStationsIndispo===stations.length & !loading">
        <h4 class="text-center text-warning mb-4">Pas de stations disponibles</h4>
      </div>

      <div v-if="!loading" id="mapVue">

        <!-- Map container (carte apparaît même sans station) : -->
        <div id="mapid"></div>

        <!-- Legend container : -->
        <div  id="card-container" v-if="markers.length>0">

          <!-- Un card pour chaque station -->
          <div title="Zoom sur la station" @click="zoomOnMarker(index)" class="card bg-light" v-for="(marker,index) in markers" :key="marker">
            
            <!-- Titre et logo de la station -->
            <div class="card-header">
              Station {{marker.options.title}}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              </svg>
            </div>

            <!-- Coordonnées de la station -->
            <div class="card-body">
                <p class="card-text">Latitude : {{parseFloat(marker._latlng.lat).toFixed(5)}}</p>
                <p class="card-text">Longitude : {{parseFloat(marker._latlng.lng).toFixed(5)}}</p>
            </div>

          </div>
        
        </div>

      </div>

    </div>

</template>

<script>

  /* eslint-disable */

  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import axios from 'axios';

  export default {

    name: "Map",

    data() {
      return{
        fetchedData:[],
        stations:[],
        markers:[],
        map:null,
        tiles:null,
        nbStationsIndispo:0,
        loading:true
      }
    },

    methods: {

      // Récupération des localisations de chaque station via API
      fetchData() {

        // Création d'une instance d'axios customisée
        const customAxios = axios.create({
          timeout: 1000
        });

        // Pour chaque station, on tente de récupérer la donnée
        for (let i = 0; i < this.stations.length; i++) {
          
          customAxios.get(this.stations[i].url+"/location")
          
          // Si la donnée est bien récupérée
          .then(response => {

            this.fetchedData.push(response.data);
            this.pushMarker(response.data);

          })

          // Si la donnée n'est pas récupérée
          .catch(error => {

            this.nbStationsIndispo++;
            this.$toast("Impossible de récupérer les informations de la station "+this.stations[i].id);

          })

          .then(() => {

            // Détection de la fin des requêtes
            if (i==this.stations.length-1) {
              this.loading=false;
              this.setupLeafletMap();
              if (this.fetchedData.length>0)  this.addMarkersToMap();
            }

          })
        }
      },

      // Ajout du marker de la station dans l'objet vue marker
      pushMarker(locationData){

        var greenIcon = L.icon({
          iconUrl: 'assets/marker-icon-logo.png',
          iconAnchor:   [18, 0]
        });

        const location = locationData.sensors.filter(function(item){
          return item.type == "location";         
        })

        const lat = location[0].mes[0].value.lat;
        const long = location[0].mes[0].value.lon;

        const marker = L.marker([lat,long], {icon: greenIcon,title:locationData.idStation}).bindPopup("Station "+locationData.idStation);
        
        this.markers.push(marker);
      },

      // Mise en place de la carte leaflet, on attend que la div de la carte apparaît (un peu de temps après le loading=false)
      async setupLeafletMap() {

        // Attente de l'appartion de la div de la carte
        while(!document.querySelector("#mapid")) {
          await new Promise(r => setTimeout(r, 500));
        }

        this.map = L.map("mapid").setView([46.34808073511517, 2.6053503057705862],5);
        
        
        this.tiles = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:'Map data (c) <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-v9",
          accessToken:"pk.eyJ1IjoiZ2NvdGhpYXNmYXVyZSIsImEiOiJja2tlOXM2c3cwNHhxMnZyeGgyZmg2cTk5In0.MvY_mSV3PMZf7CgsINH_2w",
        })
        
        this.tiles.addTo(this.map);

      },

      // Ajout des marker à la carte leaflet, on attend que la div de la carte apparaît (un peu de temps après le loading=false)
      async addMarkersToMap(){

        // Attente de l'appartion de la div de la carte
        while(!document.querySelector("#mapid")) {
          await new Promise(r => setTimeout(r, 500));
        }

        var featureGroup = L.featureGroup(this.markers).addTo(this.map);

        this.map.flyToBounds(featureGroup.getBounds());
      },

      // Zoom sur un marker au click sur la card correspondante
      zoomOnMarker(index){
        this.map.flyToBounds(L.latLngBounds([this.markers[index].getLatLng()]),{maxZoom:15})
      },

      // Récupération des stations et des URLS de leurs API
      fetchStations(){
        axios
        .get("./stations.json")
        .then(response => {
          this.stations=response.data;
          this.fetchData();
        })
      }

    },

    mounted() {
      // Récupération des stations - Initialisation de la vue
      this.fetchStations();
    }

  }

</script>

<style scoped>

  #mapVue {
    width: 100%;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  .card {
    width: 100%;
    margin-bottom: 10px;
  }

  svg{
    float: right;
  }

  .card :hover{
    cursor: pointer;
  }

  #mapid {
    z-index: 0;
    border: 1px solid black;
    height: 60vh;
    width: 70%;
    border-radius:10px ;
    margin-bottom: 20px;
  }

  @media screen and (max-width: 640px) {
    #mapid {
      width: 95%;
    }
  }

  @media screen and (min-width: 640px) {
    #card-container{
      height: 60vh;
      overflow: auto;
      border: 1px solid black;
      border-radius:10px;
      padding: 10px;
    }
  }

</style>
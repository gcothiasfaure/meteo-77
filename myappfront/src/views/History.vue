<template>

  <div id="History">

    <h3 class="text-center mt-4 mb-4">Historique des données</h3>

    <!-- Info si pas de station dispo -->
    <div>
      <h4 v-if="nbStationsIndispo===stations.length & !loading" class="text-center text-warning">Pas de stations disponibles</h4>
    </div>

    <!-- Suit l'utilisateur lors du scroll -->
    <div ref="btnContainer" id="btnContainer" :class="{ fixed: btnFixed }">

      <ul v-if="availableStation.length>0">

        <!-- Boutons pour choisir la station parmis les disponibles -->
        <li v-for="(station) in availableStation" :key="station">
          <button class="btn btn-sm btn-primary" @click="onClickBtn(station.id)" :disabled="btnDisabled==station.id">Station {{ station.id }}</button>
        </li>

        <li v-if="btnFixed">

          <!-- Bouton pour revenir en haut -->
          <button class="btn btn-sm scrollTop" @click="scrollTop()">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="bi bi-arrow-bar-up" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 10a.5.5 0 0 0 .5-.5V3.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 3.707V9.5a.5.5 0 0 0 .5.5zm-7 2.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </button>

        </li>

      </ul>
      
    </div>

    <!-- Container des chart -->
    <div v-if="!loading" id="charts">

      <h4 class="text-center mt-3">Station {{currentStation.id}}</h4>

      <!-- Tous les conteneurs des chart bar -->

      <!-- Cet enfant dit au parent quand il est chargé pour afficher tous les charts a ce moment la -->
      <bar-chart :sensor="sensors[0]" :station="currentStation" @chartLoaded="handleLoading()"/>
      <bar-chart :sensor="sensors[1]" :station="currentStation"/>
      <bar-chart :sensor="sensors[2]" :station="currentStation"/>
      <bar-chart :sensor="sensors[3]" :station="currentStation"/>
      <bar-chart :sensor="sensors[4]" :station="currentStation"/>
      <bar-chart :sensor="sensors[5]" :station="currentStation"/>
      <bar-chart :sensor="sensors[6]" :station="currentStation"/>
      <bar-chart :sensor="sensors[7]" :station="currentStation"/>

      <!-- Conteneur du polar chart -->
      <polar-chart :sensor="sensors[8]" :station="currentStation"/>
      
    </div>

  </div>

</template>

<script>

  /* eslint-disable */

  import BarChart from '@/components/BarChart'
  import PolarChart from '@/components/PolarChart';

  import axios from "axios";

  export default {
    name: "History",
    components:{
      BarChart,PolarChart
    },

    data() {
      return{
        btnDisabled:null,
        // Liste des capteurs
        sensors:["temperature","humidity","rain","pressure","luminosity","wind_speed_avg","wind_speed_max","wind_speed_min","wind_heading"],
        stations:[],
        currentStation:{},
        nbStationsIndispo:0,
        availableStation:[],
        btnFixed:false,
        loading:true
      }
    },

    methods: {

      // Mise à jour la station demandée par l'utilisateur dans la vue
      getCurrentStation(idStation){

        let currentStation = {};

        this.availableStation.forEach(station => {
          if (station.id===idStation) currentStation=station;
        });

        return currentStation;
      },

      // Mise à jour la station demandée par l'utilisateur
      onClickBtn: function (idStation) {
        this.currentStation=this.getCurrentStation(idStation);
        this.btnDisabled=idStation;
      },

      // Récupère les identifiants et URL des stations
      fetchStations(){
        axios
        .get("./stations.json")
        .then(response => {
          this.stations=response.data;
          this.pingData();
        })
      },

      // Définie quelles stations sont dsspnibles en les pingant
      pingData(){

        // Création d'une instance custom de axios
        const customAxios = axios.create({
          timeout: 1000
        });

        // Ping chaque URL
        for (let i = 0; i < this.stations.length; i++) {
          
          customAxios.get(this.stations[i].url+"/all")

          // Si on a une réponse, la station est donc exploitable
          .then(response => {
            this.availableStation.push(this.stations[i]);
          })

          // Si il n'y a pas de réponse, cette station n'est pas exploitable
          .catch(error => {
            this.nbStationsIndispo++;
            this.$toast("Impossible de récupérer les informations de la station "+this.stations[i].id);
          })
          
          .then(()=>{
            // Détection de la fin des requêtes
            if (i==this.stations.length-1){
              if (this.availableStation[0]) {
                this.btnDisabled=this.availableStation[0].id;
                this.onClickBtn(this.availableStation[0].id);
              }
              
              this.loading=false;
            }
          })
          
        }
      },

      // Scroll vers le haut lors du clic sur le bouton prévu à cet effet
      scrollTop(){
        window.scroll(0,0);
      },

      // Initialise l"ffet de scroll des boutons qui suivent l'utilisateur lors du scroll
      initScrollEffect(){
        const btnTopPos = this.$refs.btnContainer.getBoundingClientRect().top;
        window.addEventListener('scroll', () =>{
          if (window.scrollY>btnTopPos) this.btnFixed=true;
          else  this.btnFixed=false;
        });
      },

      // Lorsque le premier chart est chargé, on affiche les charts
      handleLoading(){
        this.loading=false;
      }

    },

    mounted () {
      // Récupère les stations et initialise la vue
      this.fetchStations();
      // Met en place l'effet au scroll
      this.initScrollEffect();
    },

  }

</script>

<style scoped>

  ul{
    margin: 10px;
    padding: 0;
    display: flex;
    list-style-type: none;
    flex-wrap: wrap;
  }

  li{
    margin: 5px ;
  }

  button:disabled{
    background-color:blue;
    border-color:blue;
  }

  button{
    
    background-color: grey;
    border-color:grey;
  }

  .fixed{
    position: fixed;
    top: 0;
  }

  .scrollTop{
    color: white;
  }

  #btnContainer{
    z-index: 100;
  }

</style>
<template>

  <div id="Dashboard">

    <h3 class="text-center mt-4 mb-4">Dernières données disponibles</h3>

    <!-- Info si pas de station dispo -->
    <div v-if="nbStationsIndispo===5">
      <h4 class="text-center text-warning">Pas de stations disponibles</h4>
    </div>
    
    <!-- Suit l'utilisateur lors du scroll -->
    <div ref="btnContainer" id="btnContainer" :class="{ fixed: btnFixed }">
      
      <ul v-if="fetchedData.length>0">
        
        <!-- Boutons pour choisir la station parmis les disponibles -->
        <li v-for="(station,index) in fetchedData" :key="station">
          <button class="btn btn-sm btn-primary" @click="onClickBtn(index)" :disabled="btnDisabled==index">Station {{ station.idStation }}</button>
        </li>
        
        <li v-if="btnFixed">

          <!-- Bouton pour revenir en haut -->
          <button class="btn scrollTop btn-sm" @click="scrollTop()">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="bi bi-arrow-bar-up" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 10a.5.5 0 0 0 .5-.5V3.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 3.707V9.5a.5.5 0 0 0 .5.5zm-7 2.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </button>

        </li>

      </ul>

    </div>
    
    <!-- Container du card qui contient les informations sur la station -->
    <div v-if="endLoad" class="mt-4" id="data-container">

      <div class="card bg-light" style="width:500px;">
        
        <img :src="imgPath" width="500" height="300" class="card-img-top">
        
        <div class="card-body bg-light">

          <h5 class="card-title">Station {{currentStationId}}</h5>
        
          <ul class="list-group list-group-flush bg-light">

            <!-- Toutes les mesures : -->
            
            <li class="list-group-item bg-light"><b>Température :</b> {{temp}}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-thermometer" viewBox="0 0 16 16">
                <path d="M6 2a2 2 0 1 1 4 0v7.627a3.5 3.5 0 1 1-4 0V2zm2-1a1 1 0 0 0-1 1v7.901a.5.5 0 0 1-.25.433A2.499 2.499 0 0 0 8 15a2.5 2.5 0 0 0 1.25-4.666.5.5 0 0 1-.25-.433V2a1 1 0 0 0-1-1z"/>
                <path d="M9.5 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </li>

            <li class="list-group-item bg-light"><b>Humidité :</b> {{hum}}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-droplet" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 16a6 6 0 0 0 6-6c0-1.655-1.122-2.904-2.432-4.362C10.254 4.176 8.75 2.503 8 0c0 0-6 5.686-6 10a6 6 0 0 0 6 6zM6.646 4.646c-.376.377-1.272 1.489-2.093 3.13l.894.448c.78-1.559 1.616-2.58 1.907-2.87l-.708-.708z"/>
              </svg>
            </li>

            <li class="list-group-item bg-light"><b>Dernière pluie :</b> {{rain}}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-droplet" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10a5 5 0 0 0 10 0c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/>
                <path fill-rule="evenodd" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448z"/> 
              </svg>
            </li>

            <li class="list-group-item bg-light"><b>Luminosité :</b> {{lum}}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-brightness-high" viewBox="0 0 16 16">
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
              </svg>
            </li>

            <li class="list-group-item bg-light"><b>Pression :</b> {{pres}}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-thermometer-half" viewBox="0 0 16 16">
                <path d="M8 1.75a.25.25 0 0 1 .25.25v9.02a1.5 1.5 0 1 1-.5 0V2A.25.25 0 0 1 8 1.75z"/>
                <path d="M6 2a2 2 0 1 1 4 0v7.627a3.5 3.5 0 1 1-4 0V2zm2-1a1 1 0 0 0-1 1v7.901a.5.5 0 0 1-.25.433A2.499 2.499 0 0 0 8 15a2.5 2.5 0 0 0 1.25-4.666.5.5 0 0 1-.25-.433V2a1 1 0 0 0-1-1z"/>
              </svg>
            </li>

            <li class="list-group-item bg-light"><b>Direction du vent :</b> {{wDir}}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-compass" viewBox="0 0 16 16">
                <path d="M8 16.016a7.5 7.5 0 0 0 1.962-14.74A1 1 0 0 0 9 0H7a1 1 0 0 0-.962 1.276A7.5 7.5 0 0 0 8 16.016zm6.5-7.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
                <path d="M6.94 7.44l4.95-2.83-2.83 4.95-4.949 2.83 2.828-4.95z"/>
              </svg>
            </li>

            <li class="list-group-item bg-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-flag" viewBox="0 0 16 16">
                <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21.294 21.294 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21.317 21.317 0 0 0 14 7.655V1.222z"/>
              </svg>
              <b>Vitesses du vent :</b> <br>Vitesse moyenne : {{wAvg}} <br> Vitesse maximum : {{wMax}} <br> Vitesse minimum : {{wMin}}
            </li>

          </ul>

        </div>

      </div>

    </div>

  </div>

</template>

<script>

  /* eslint-disable */

  import axios from 'axios';
  import moment from 'moment';

  export default {

    name: "Dashboard",

    data() {
      return  {
        btnDisabled:0,
        fetchedData:[],
        temp:null,
        hum:null,
        lum:null,
        wHead:null,
        wAvg:null,
        wMax:null,
        wMin:null,
        rain:null,
        currentStationId:null,
        pres:null,
        stations:[],
        nbStationsIndispo:0,
        btnFixed:false,
        endLoad:false
      }
    },

    computed:{
      
      // Définie l'image à afficher selon la température la station observée
      imgPath(){
        if (parseInt(this.temp)>0 & parseInt(this.temp)<15) return "assets/weather/cloudy.jpg"
        else if (parseInt(this.temp)>15)  return "assets/weather/sunny.jpeg"
        else return "assets/weather/snowy.jpg"
      },

      // Passe la direction du vent des degrés en direction
      wDir(){
        let value = parseFloat(this.wHead);
        if (value <= 11.25) return 'N';
        value -= 11.25; 
        let allDirections = ['NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N']; 
        let dIndex = parseInt(value/22.5); 
        return allDirections[dIndex] ? allDirections[dIndex] : 'N';
      }

    },

    methods: {

      // Récupère le capteur correspondant dans les données brutes de l'API
      getSensor(index,type) {
        const sensor = this.fetchedData[index].sensors.filter(function(item){
            return item.type == type;
        })
        return sensor;
      },

      // Au clic sur un des boutons du choix de la station => récupère les données correspondantes à la nouvelle requête
      onClickBtn(index) {

        this.btnDisabled=index;

        this.currentStationId=this.fetchedData[index].idStation

        // Récupération des différentes données à afficher
        this.rain = "Le "+moment(this.getSensor(index,"rain")[0].mes[0].value).format("DD/MM/YYYY à h[h]mm");
        this.temp = this.parseAPI(index,"temperature");
        this.hum = this.parseAPI(index,"humidity");
        this.pres = this.parseAPI(index,"pressure");
        this.lum = this.parseAPI(index,"luminosity");
        this.wHead = this.parseAPI(index,"wind_heading");
        this.wAvg = this.parseAPI(index,"wind_speed_avg");
        this.wMax = this.parseAPI(index,"wind_speed_max");
        this.wMin = this.parseAPI(index,"wind_speed_min");
      },

      // Retourne la valeur de la dernière mesure
      parseAPI(index,type) {
        return Math.floor(this.getSensor(index,type)[0].mes[0].value)+" "+this.getSensor(index,type)[0].unit;
      },

      // Récupération des données brutes de l'API
      fetchData() {
        
        // Création d'une instance custom de axios
        const customAxios = axios.create({
          timeout: 1000
        });

        // Recupère les données pour chaque URL
        for (let i = 0; i < this.stations.length; i++) {
          
          customAxios.get(this.stations[i].url+"/all")

          // Si on a une réponse, la station est donc exploitable
          .then(response => {
            this.fetchedData.push(response.data);
          })

          // Si il n'y a pas de réponse, cette station n'est pas exploitable
          .catch(error => {
            this.nbStationsIndispo++;
            this.$toast("Impossible de récupérer les informations de la station "+this.stations[i].id);
          })

          .then(()=>{
            // Détection de la fin des requêtes
            if (i==this.stations.length-1 & this.fetchedData.length>0)  {
              this.onClickBtn(0);
              this.endLoad=true;
            }
          })
          
        }

      },

      // Récupère les identifiants et URL des stations
      fetchStations(){
        axios
        .get("./stations.json")
        .then(response => {
          this.stations=response.data;
          this.fetchData();
        })
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
      }

    },

    mounted () {
      // Récupère les stations et initialise la vue
      this.fetchStations();
      // Met en place l'effet au scroll
      this.initScrollEffect();
    }

  };

</script>

<style scoped>

  #btnContainer{
    z-index: 100;
  }

  .fixed{
    position: fixed;
    top: 0;
  }

  .scrollTop{
    color: white;
  }

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
    background-color: blue;
    border-color:blue;
  }

  button{
    background-color: grey;
    border-color:grey;
  }

  #data-container{
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  @media screen and (max-width: 520px) {
    #data-container{
      margin-left: 10px;
      margin-right: 10px;
    }
  }

  #data-container svg{
    float: right;
  }

</style>
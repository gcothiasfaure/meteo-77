<template>
    <div class="polarChart">
        
        <hr class="my-4">

        <h5 class="mb-4">{{label}}</h5>
        
        <!-- Boutons des choix de la date => 1 bouton pour chaque période (semaine,mois,année) -->
        <div class="mb-4 btn-group">
            <button v-for="(value, name) in dateChoice" :key="name" type="button" class="btn btn-info btn-sm" @click="onClickBtn(name)" :disabled="currentDate==name">{{ value }}</button>
        </div>

        <!-- Chart : -->
        <div id='polar-chart'></div>

    </div>  
</template>

<script>

    /* eslint-disable */

    import moment from 'moment';
    import axios from "axios";
    import Plotly from 'plotly.js-dist';

    export default {

        name: 'StackBarChart',

        props: {
            station: Object,
            sensor:String
        },

        data(){
            return {
                dateChoice:{
                    w:"Dernière semaine",
                    m:"Dernier mois",
                    y:"Dernière année"                
                },
                currentDate:"w",
                receivedData:{},
                layout : {
                    width: 320,
                    height: 320,
                    margin: {
                        l: 40,
                        r: 40,
                        b: 40,
                        t: 40
                    },
                    polar: {
                        radialaxis: {
                            visible: false,
                            range: [0,1]
                        },
                            angularaxis:{
                            direction: "clockwise"
                        }
                    },
                    showlegend: false                    
                },
                label:"Direction du vent"
            }
        },

        computed:{
            
            // Définition des paramètres GET de la requête pour les API selon le temps choisi par l'utilisateur
            // ex : /wind_head/187281082
            urlParameters(){
                let timeFrom;
                switch (this.currentDate) {
                    case "w":
                        timeFrom = moment().subtract(7,'days').valueOf();
                        break;
                    case "m":
                        timeFrom = moment().subtract(1,'months').valueOf();
                        break;
                    case "y":
                        timeFrom = moment().subtract(1,'years').valueOf();
                        break;
                }
                return "/"+this.sensor+"/"+timeFrom;
            },

            // Retourne les données extraites du retour de l'API
            computedData(){
                var dates=[];
                var values = [];

                const sensor = this.getSensor();

                sensor[0].mes.forEach(element => {
                    dates.push(element.date)
                    values.push(element.value)
                });

                const unit = this.receivedData.sensors[0].unit;

                dates = dates.map(x => moment(x).format("DD/MM/YY, h:mm"));
                values = values.map(x => Math.floor(x));

                return({data:{x:dates,y:values},unit:unit,label:this.label})
            }
        },

        methods:{

            // Récupère le capteur correspondant dans les données brutes de l'API
            getSensor() {
                const sensorType = this.sensor;
                const sensor = this.receivedData.sensors.filter(function(item){
                    return item.type == sensorType;
                })
                return sensor;
            },

            // Création et mise à jour du chart
            renderChart() {
                let data=[];
                for (let i = 0; i < this.computedData.data.x.length; i++) {
                    data.push({
                        type: "scatterpolar",
                        mode: "lines",
                        r: [0, 0.8,0.8,0],
                        theta: [0,this.computedData.data.y[i]-5,this.computedData.data.y[i]+5, 0],
                        fill: "toself",
                        text:this.computedData.data.x[i]+" : "+this.computedData.data.y[i]+this.computedData.unit,
                        name:""
                    })
                }

                Plotly.newPlot('polar-chart',data,this.layout,{displayModeBar: false})
            },

            // Au clic sur un des boutons du choix du temps => récupère les données correspondantes à la nouvelle requête
            onClickBtn(time){
                this.currentDate=time;
                this.fetchData();
            },

            // Récupération des données brutes de l'API
            fetchData(){
                if (this.station.url) {
                    axios
                    .get(this.station.url+this.urlParameters)
                    .then(response => {
                        this.receivedData=response.data;
                        this.renderChart();
                    })
                    .catch(error => {

                    });
                }   
            }

        },

        mounted(){
            // Recupère les données et remplie le chart
            this.fetchData();
        },

        watch:{
            // A chaque changement de valeur de station => on rècupére les nouvelles données puis remplie le chart
            station() {
                this.fetchData();
            }
        }
        
    }

</script>

<style scoped>

    .polarChart{
        text-align: center;
        margin-bottom: 30px;
    }

    .btn-group :disabled{
        background-color: aqua !important;
    }

    hr{
        display: inline-flex;
        width: 50vw;
    }

    #polar-chart{
        display: flex;
        justify-content: center;
    }

    @media screen and (max-width:600px) {
        .chart-container{
            width: 95vw;
        }
    }

</style>
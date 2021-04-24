<template>
    <div class="BarChart">

        <hr class="my-4">

        <h5 class="mb-4">{{label}}</h5>

        <!-- Boutons des choix de la date => 1 bouton pour chaque période (semaine,mois,année) -->
        <div class="mb-4 btn-group btnContainer">
            <button v-for="(value, name) in dateChoice" :key="name" type="button" class="btn btn-info btn-sm" @click="onClickBtn(name)" :disabled="currentDate==name">{{ value }}</button>
        </div>
        
        <!-- Chart : -->
        <div class="chart-container">
            <canvas ref="canvas"></canvas>
        </div>

    </div>
</template>

<script>

    /* eslint-disable */

    import moment from 'moment';
    import axios from "axios";
    import Chart from 'chart.js';

    export default {

        name: 'BarChart',

        props: {
            station: Object,
            sensor:  String
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
                chart:null
            }
        },

        computed:{

            // Définition du titre du graphique selon le capteur
            label(){
                var label;
                switch (this.sensor) {
                    case "temperature":
                        label="Température";
                        break;
                    case "humidity":
                        label="Humidité";
                        break;
                    case "pressure":
                        label="Pression";
                        break;
                    case "luminosity":
                        label="Luminosité";
                        break;
                    case "wind_speed_avg":
                        label="Force du vent moyenne";
                        break;
                    case "wind_speed_min":
                        label="Force du vent minimale";
                        break;
                    case "wind_speed_max":
                        label="Force du vent maximale";
                        break;
                    case "rain":
                        label="Pluviométrie";
                        break;
                }
                return label
            },

            // Définition des paramètres GET de la requête pour les API selon le temps choisi par l'utilisateur
            // ex : /temperature/187281082
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
                let unit = "";

                const sensor = this.getSensor();

                // Pour le capteur pluviométrique, toutes les valeurs sont à 1 => signifie juse qu'il a plu à la date
                if (this.sensor=="rain") {

                    sensor[0].mes.forEach(element => {
                        dates.push(element.date);
                        values.push(1);
                    });

                    dates = dates.map(x => moment(x).format("DD/MM/YY, h:mm"));

                    return({data:{x:dates,y:values},unit:unit,label:this.label})
                    
                }
                // Pour les autres capteurs, on renvoie les 2 données sous forme d'array
                else{
                    sensor[0].mes.forEach(element => {
                        dates.push(element.date)
                        values.push(element.value)
                    });

                    unit = sensor[0].unit;

                    dates = dates.map(x => moment(x).format("DD/MM/YY, h:mm"));

                    return({data:{x:dates,y:values},unit:unit,label:this.label})
                }
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

            // Met à jour le chart avec les nouvelles données => au début et aux changements de l'utilisateur
            updateChart(){

                let label;

                if (this.sensor=="rain") {
                    label = this.computedData.label;
                }
                else{
                    label = this.computedData.label+' (en '+this.computedData.unit+')';
                }

                this.chart.data = {
                        labels: this.computedData.data.x,
                        
                        datasets: [{
                            label: label,
                            data: this.computedData.data.y,
                            backgroundColor: this.getBackgroundColors(this.computedData.data.y.length,'rgba(115,150, 250, 0.5)'),
                            
                        }]
                    }

                this.chart.update();
            },

            // Création d'un array de col de longueur len 
            getBackgroundColors(len,col){
                let array = [];
                for (let i = 0; i < len; i++) {
                    array.push(col)
                }
                return array
            },

            // Au clic sur un des boutons du choix du temps => récupère les données correspondantes à la nouvelle requête
            onClickBtn(time){
                this.currentDate=time;
                this.fetchData();
            },

            // Récupération des données brutes de l'API
            fetchData(){
                if (this.station.url){
                    axios
                    .get(this.station.url+this.urlParameters)
                    .then(response => {
                        this.receivedData=response.data;
                        this.updateChart();
                        this.$emit('chartLoaded');
                    })
                }
            },

            // Initialisation du chart selon
            initChart(){

                let yAxes=[];

                // Si c'est le capteur plui => on cache l'axe des Y car la valeur est 1
                if (this.sensor=="rain") {
                    yAxes.push(
                        {
                            gridLines: {
                                display: false,
                                drawBorder: false,
                            },

                            ticks: {
                                callback: function(value, index, values) {
                                    return '';
                                }
                            }
                        }
                    )
                }
                // Pour tous les autres capteurs, l'axe des Y démarrent à 0
                else{
                    yAxes.push(
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    );
                }
                
                var ctx = this.$refs.canvas.getContext('2d');

                this.chart = new Chart(ctx, {
                    type: 'bar',
                    options: {
                        scales: {
                            yAxes: yAxes
                        }
                    }
                });
            }
        },

        mounted(){
            // Initialise le chart
            this.initChart();
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

    .BarChart{
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

    .chart-container{
        width: 70vw;
        margin: auto;
    }

    .btnContainer{
        z-index: 0;
    }

    @media screen and (max-width:600px) {
        .chart-container{
            width: 95vw;
        }
    }

</style>
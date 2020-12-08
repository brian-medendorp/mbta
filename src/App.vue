<template>
    <div id="app">

        <!-- Route -->
        <div class="select" v-show="routes.length">
            <label for="route">Route: </label>
            <select id="route" v-model="selected.route" @change="getStops">
                <option disabled value="">
                    Please select one
                </option>
                <option v-for="route in routes" v-bind:value="route" :key="route.id">
                    {{ route.attributes.long_name }}
                </option>
            </select>
        </div>

        <!-- Stop -->
        <div class="select" v-show="stops.length">
            <label for="stop">Stop: </label>
            <select id="stop" v-model="selected.stop" @change="selectStop">
                <option disabled value="">
                    Please select one
                </option>
                <option v-for="stop in stops" v-bind:value="stop" :key="stop.id">
                    {{ stop.attributes.name }}
                </option>
            </select>
        </div>

        <!-- Direction -->
        <div class="select" v-if="selected.route && selected.stop" @change="getPrediction">
            <label for="direction">Direction: </label>
            <select id="direction" v-model="selected.direction">
                <option disabled value="">
                    Please select one
                </option>
                <option v-for="(direction, index) in selected.route.attributes.direction_names" v-bind:value="index" :key="index">
                    {{ direction }}
                </option>
            </select>
        </div>

        <!-- Prediction -->
        <div class="prediction" v-if="prediction">
            Next predicted departure time: {{ moment(prediction.attributes.departure_time).format('MMMM Do YYYY, h:mm:ss a') }} ( {{ moment(prediction.attributes.departure_time).fromNow() }} )
        </div>

    </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'

export default {
    name: 'App',
    components: {
        //HelloWorld
    },
    data () {
		return {
            routes: [],
            stops: [],
            prediction: null,
            selected: {
                route: null,
                stop: null,
                direction: null
            }
		}
	},
    methods: {
        getRoutes: function () {
            // select only Light and Heavy Rail lines with ?filter[type]=0,1
            this.$http.get('https://api-v3.mbta.com/routes?filter%5Btype%5D=0%2C1').then((response) => {
                this.routes = response.data.data;
            })
        },
        getStops: function () {
            this.clearPrediction();
            this.selected.direction = null;
            this.selected.stop = null // reset the selected stop
            this.stops = []; // reset the stops
            if (!this.selected.route || !this.selected.route.id) {
                return; // no route selected, so don't do anything
            }
            var url = "https://api-v3.mbta.com/stops?filter%5Broute%5D=" + this.selected.route.id;
            this.$http.get(url).then((response) => {
                this.stops = response.data.data;
            })
        },
        getPrediction: function () {
            this.clearPrediction(); // reset the prediction
            if (!this.selected.route || !this.selected.stop || this.selected.direction === null ) {
                return; // not all selections made, so don't do anything
            }
            // get only the most immediate prediction with page[limit]=1 and sort=departure_time
            var url = "https://api-v3.mbta.com/predictions?page%5Blimit%5D=1&sort=departure_time";
            url += "&filter%5Broute%5D=" + this.selected.route.id; // filter by route
            url += "&filter%5Bstop%5D=" + this.selected.stop.id; // filter by stop
            url += "&filter%5Bdirection_id%5D=" + this.selected.direction; // filter by direction
            this.$http.get(url).then((response) => {
                this.prediction = response.data.data[0];
                // TODO: handle edge cases where there is no departure time for the selected direction
            })
        },
        selectStop: function () {
            this.selected.direction = null;
            this.clearPrediction();
        },
        clearPrediction: function() {
            this.prediction = null;
        }
    },
    created: function () {
        this.getRoutes();
    }
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>

<template>
    <div id="app">

        <header>
            <img id="mbta-logo" alt="mbta logo" src="./assets/mbta-logo-t.png" />
            <h2>MBTA Departure Predictor</h2>
            <p>
                Please select a route, stop, and direction to view the next estimated departure.
            </p>
        </header>

        <!-- Route -->
        <div class="select" v-show="routes.length">
            <label for="route">Route</label>
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
            <label for="stop">Stop</label>
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
            <label for="direction">Direction</label>
            <select id="direction" v-model="selected.direction">
                <option disabled value="">
                    Please select one
                </option>
                <option v-for="(direction, index) in selected.route.attributes.direction_names" v-bind:value="index" :key="index">
                    {{ direction }}
                </option>
            </select>
        </div>

        <!-- Loading indicator -->
		<img id="loading" alt="Loading" v-if="loading" src="./assets/loading.svg">

        <!-- Prediction -->
        <div class="prediction" v-if="predictions.length">
            <label>Next predicted departure times:</label>
            <div v-for="prediction in predictions" :key="prediction.id">
                <span v-if="prediction.attributes.departure_time">{{ moment(prediction.attributes.departure_time).format('MMMM Do YYYY, h:mm:ss a') }} ( {{ moment(prediction.attributes.departure_time).fromNow() }} )</span>
                <span v-if="!prediction.attributes.departure_time">Not applicable</span>
            </div>
        </div>

        <!-- Error -->
        <div class="prediction" v-if="error">
            <label>Something went wrong</label>
            <div>
                {{ error }}
            </div>
        </div>

    </div>
</template>

<script>

export default {
    name: 'App',
    components: {
    },
    data () {
		return {
            routes: [],
            stops: [],
            predictions: [],
            error: null,
            loading: false,
            selected: {
                route: null,
                stop: null,
                direction: null
            }
		}
	},
    methods: {
        getRoutes: function () {
            this.loading = true;
            // select only Light and Heavy Rail lines with ?filter[type]=0,1
            return this.$http.get('https://api-v3.mbta.com/routes?filter%5Btype%5D=0%2C1').then((response) => {
                this.loading = false;
                this.routes = response.data.data;
            }).catch((error) => {
                this.loading = false;
                this.error = "Unable to get route data. " + error;
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
            this.loading = true;
            var url = "https://api-v3.mbta.com/stops?filter%5Broute%5D=" + this.selected.route.id;
            return this.$http.get(url).then((response) => {
                this.loading = false;
                this.stops = response.data.data;
            }).catch((error) => {
                this.loading = false;
                this.error = "Unable to get stop data. " + error;
            })
        },
        getPrediction: function () {
            this.clearPrediction(); // reset the prediction
            if (!this.selected.route || !this.selected.stop || this.selected.direction === null ) {
                return; // not all selections made, so don't do anything
            }
            this.loading = true;
            // get only the most immediate predictions with page[limit]=1 and sort=departure_time
            var url = "https://api-v3.mbta.com/predictions?page%5Blimit%5D=3&sort=departure_time";
            url += "&filter%5Broute%5D=" + this.selected.route.id; // filter by route
            url += "&filter%5Bstop%5D=" + this.selected.stop.id; // filter by stop
            url += "&filter%5Bdirection_id%5D=" + this.selected.direction; // filter by direction
            return this.$http.get(url).then((response) => {
                this.loading = false;
                if (response.data.data.length) {
                    this.predictions = response.data.data;
                } else {
                    this.error = "No prediction data could be found for the supplied selections."
                }
            }).catch((error) => {
                this.loading = false;
                this.error = error;
                // NOTE: for some reason it looks like axios isn't processing the json data from the response to let us handle this better
            })
        },
        selectStop: function () {
            this.selected.direction = null;
            this.clearPrediction();
        },
        clearPrediction: function() {
            this.predictions = [];
            this.error = null;
        }
    },
    created: function () {
        this.getRoutes();
    }
}
</script>

<style>
body {
    display: flex;
    //justify-content: center;
    align-items: center;
    //min-height: 80vh;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    //text-align: center;
    color: #2c3e50;
    margin: 3em 1em 1em 1em;
}

#mbta-logo {
    width: 30px;
    float: left;
    margin-right: 0.5em;
}

label {
    font-weight: bold;
    display: block;

}

.select, #loading {
    margin-top: 0.5em;
}

.select label {
    font-size: 90%;
}

.prediction {
    margin-top: 2em;
}

#loading {
    width: 30px;
}
</style>

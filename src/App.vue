<template>
    <div id="app">

        <!-- Route -->
        <div class="select" v-show="routes.length">
            <label for="route">Route: </label>
            <select id="route" v-model="selected.route" @change="getStops">
                <option v-for="route in routes" v-bind:value="route" :key="route.id">
                    {{ route.attributes.long_name }}
                </option>
            </select>
        </div>

        <!-- Stop -->
        <div class="select" v-show="stops.length">
            <label for="stop">Stop: </label>
            <select id="stop" v-model="selected.stop">
                <option v-for="stop in stops" v-bind:value="stop" :key="stop.id">
                    {{ stop.attributes.name }}
                </option>
            </select>
        </div>

        <!-- Direction -->
        <div class="select" v-if="selected.route && selected.stop">
            <label for="direction">Direction: </label>
            <select id="direction" v-model="selected.direction">
                <option v-for="(direction, index) in selected.route.attributes.direction_names" v-bind:value="index" :key="index">
                    {{ direction }}
                </option>
            </select>
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
            this.stops = []; // reset the stops
            if (!this.selected.route || !this.selected.route.id) {
                return; // no route selected, so don't do anything
            }
            var url = "https://api-v3.mbta.com/stops?filter%5Broute%5D=" + this.selected.route.id;
            this.$http.get(url).then((response) => {
                this.stops = response.data.data;
            })
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

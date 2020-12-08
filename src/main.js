import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import moment from 'moment'

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.moment = moment

new Vue({
  render: h => h(App),
}).$mount('#app')

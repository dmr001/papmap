import Vue from 'vue'
import App from './App.vue'
// import './quasar'
import '@dagrejs/graphlib'
import vuetify from './plugins/vuetify';
Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')

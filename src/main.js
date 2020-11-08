import Vue from 'vue'
import App from './App.vue'
// import './quasar'
import '@dagrejs/graphlib'
import vuetify from './plugins/vuetify';
import VuetifyDialog from "vuetify-dialog";

Vue.use(vuetify);
Vue.config.productionTip = false
Vue.use(VuetifyDialog);

new Vue({
  vuetify,
  // VuetifyDialog,
  render: h => h(App)
}).$mount('#app')

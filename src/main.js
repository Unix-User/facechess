import Vue, { createApp } from 'vue';
import App from './App.vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { inject } from '@vercel/analytics';
 
inject();
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

const app = createApp(App);
app.mount('#app');
import { createApp } from 'vue';
import App from './App.vue';
import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

const app = createApp(App);
app.mount('#app');
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

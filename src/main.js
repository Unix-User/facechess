import { createApp } from 'vue';
import io from 'socket.io-client';
import VueSocketIO from 'vue-socket.io';
import App from './App.vue';

const app = createApp(App);

// Cria o aplicativo Vue.js
app.mount('#app');

// Adiciona o plugin Vue-Socket.io ao aplicativo
app.use(
  new VueSocketIO({
    debug: true,
    connection: io('http://localhost:8888'),
  }),
);

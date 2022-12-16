<template>
  <div id="app">
    <StatusBar :emitter="emitter"></StatusBar>
    <MyBoard :emitter="emitter"></MyBoard>
    <MainChat :emitter="emitter"></MainChat>
  </div>
</template>

<script>
import MainChat from './components/MainChat.vue';
import MyBoard from './components/MyBoard.vue';
import StatusBar from './components/StatusBar.vue';
import mitt from 'mitt';

export default {
  name: 'App',
  data() {
    return {
      emitter: mitt(),
      status: '',
      messages: []
    }
  },
  components: {
    MyBoard,
    MainChat,
    StatusBar
  },
  mounted() {
    this.emitter.on('received-message', message => {
      this.messages.push(message);
    });
    this.emitter.on('room', data => {
      this.status = data;
    });
  }
};
</script>


<style>
</style>
<template>

    <div id="app">
      <StatusBar :emitter="emitter"></StatusBar>
      <MyBoard :emitter="emitter"></MyBoard>
      <MainChat :emitter="emitter"></MainChat>

    </div>
</template>

<style>
#app {
  width: 100%;
  height: auto;
  max-width: 360px;
  min-width: 300px;
  max-height: 423px;
  min-height: 323px;
  left: -4px;
  top: -8px;
  background-color: rgb(0, 0, 0);
  position: fixed;
  position: relative;
  border-radius: 7.5px;
}

</style>




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
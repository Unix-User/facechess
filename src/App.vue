<template>
  <b-container class="bv-example-row">
    <b-row >
        <StatusBar :emitter="emitter"></StatusBar>
    </b-row>
    <b-row >
      <b-col >
        <MyBoard :emitter="emitter"></MyBoard>
      </b-col>
    </b-row>
    <b-row align-v="left">
      <b-col>
        <MainChat :emitter="emitter"></MainChat>
      </b-col>
    </b-row>

  </b-container>
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
      player: '',
      messages: []
    }
  },
  compatConfig: { MODE: 2 },
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
    this.emitter.on('player', data => {
      this.player = data;
    });
  }
};
</script>
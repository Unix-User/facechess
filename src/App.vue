<template>
  <div id="app" class="container">
    <div class="row">
      <div class="row-top">
        <StatusBar :emitter="emitter"></StatusBar>
      </div>
      <div class="row-middle">
        <MyBoard :emitter="emitter"></MyBoard>
      </div>
      <div class="row-botton">
        <MainChat :emitter="emitter"></MainChat>
      </div>
    </div>
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


<style>
.row-top {
  width: 100%;
  height: 50px;
  background-color: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}


.row-bottom {
  width: 100%;
  height: 50%;
  background-color: #fff;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}
</style>
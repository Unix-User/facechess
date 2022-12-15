<template>
  <div id="app">
    <StatusBar v-bind:status="currentStatus"></StatusBar>
    <MyBoard v-on:onRoomData="handleRoomData" v-on:onChatMsg="handleChatMsg"></MyBoard>
    <MainChat v-bind:messages="messages"></MainChat>
  </div>
</template>

<script>
import MainChat from './components/MainChat.vue';
import MyBoard from './components/MyBoard.vue';
import StatusBar from './components/StatusBar.vue';

export default {
  name: 'App',
  components: {
    MyBoard,
    MainChat,
    StatusBar
  },
  data() {
    return {
      currentStatus: '',
      messages: []
    };
  },
  methods: {
    handleRoomData(data) {
      this.currentStatus = data;
    },
    handleChatMsg(data) {
      this.messages.push(data);
    },
    handleSendMessage(data) {
      this.messages.push({ text: data });
    }
  }
};

</script>

<style>
#app {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  max-height: 100%;
  object-fit: scale-down;
  background-color: #0f110f;
}

button {
  position: relative;
  bottom: -20px;
  left: -210px;
  width: 50px;
  height: 30px;
  background-color: #0f110f;
  color: rgb(133, 86, 86);
  border: 1px solid rgb(104, 67, 67);
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

textarea {
  position: relative;
  bottom: 0px;
  left: 0px;
  width: 200px;
  height: 125px;
  background-color: #ffffff;
  color: rgb(133, 86, 86);
  border: 1px solid rgb(104, 67, 67);
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
</style>

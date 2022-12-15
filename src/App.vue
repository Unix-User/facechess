<template>
  <div id="app">
    <StatusBar v-bind:status="currentStatus"></StatusBar>
    <MyBoard v-on:onRoomData="handleRoomData" v-on:onChatMsg="handleChatMsg"></MyBoard>
    <MainChat v-bind:messages="messages"></MainChat>
    <ul id="messages"></ul>
    <form id="form" action="">
      <input id="input" autocomplete="off" /><button>Enviar</button>
    </form>
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
  width: 100%;
  height: auto;
  max-width: 323px;
  max-height: 200px;
  min-height: 100px;
  background-color: #ffffff;
  color: rgb(133, 86, 86);
  border: 1px solid rgb(104, 67, 67);
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
</style>
---chat front


<style>
#body {
  margin: 0;
  padding-bottom: 3rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#form {
  background: rgba(0, 0, 0, 0.15);
  padding: 0.25rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 3rem;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

#input {
  position: relative;
  width: 100%;
  height: auto;
  max-width: 290px;
  min-width: 300;
  max-height: 200px;
  min-height: 30px;
  left: -12px;
  bottom: 311px;
  padding: 0 1rem;
  flex-grow: 1;
  border-radius: 2rem;
  border-color: #000000;
  border: 8px solid #3f3b3b;
  margin: 0.40rem;
}

#input:focus {
  outline: none;

}

#form>button {
  width: 100%;
  height: auto;
  max-width: 60px;
  min-width: 60px;
  max-height: 50px;
  min-height: 45px;
  max-width: 30px;
  left: -83px;
  bottom: 308px;
  background: rgb(175, 21, 21);
  border: none;
  padding: 0 0.8rem;
  margin: 0.25rem;
  border-radius: 10px;
  outline: none;
  color: #fff;
  font-size: 0.9rem;
}

#messages {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

#messages>li {
  padding: 0.5rem 1rem;
}

#messages>li:nth-child(odd) {
  background: #000000;
}
</style>
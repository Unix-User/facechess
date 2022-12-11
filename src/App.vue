<template>
  <div id="app">
    <MyBoard></MyBoard>
    <!-- <Youtube></Youtube> -->
  </div>
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  max-height: 100%;
  object-fit: scale-down;
}

.video-container {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 200px;
  height: 200px;
}
</style>

<script>
import MyBoard from './components/MyBoard.vue';
// import Youtube from './components/Youtube.vue'; // Importa o componente Youtube

export default {
  name: 'App',
  components: {
    MyBoard,
    // Youtube // Adiciona o componente Youtube ao componente App
  }
};
</script>
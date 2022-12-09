<template>
  <div id="app">

    
    <MyBoard>

    </MyBoard> 

    <Youtube>
// posicionar youtube style = "position: absolute; top: 0; right: 0; width: 100px; height: 100px; border: 1px solid #000; z-index: 100;"
    </Youtube>
    
  </div>
</template>

<style>

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
 
  }

  /* Define o estilo do quadrado de vídeo flutuante */
  .video-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    border: 1px solid #000;
    z-index: 100;
        
  }

  #myBoard {
    width: 800px;

 
  }
  #video {
    width: 100%;
    height: 100%;

  }
</style>


<script>
import MyBoard from './components/MyBoard.vue';
 import Youtube from './components/Youtube.vue'; // Importa o componente Youtube

export default {
  name: 'App',
  components: {
    MyBoard, 
     Youtube
    
  }
};
</script>
<template>
  <div id="app">
    <MyBoard></MyBoard> 
    <VideoStream></VideoStream>

    <!-- Adiciona o elemento div com a classe video-container -->
    <div class="video-container">
      <!-- Adiciona o elemento video dentro do div -->
      <video :src="videoUrl"></video> <!-- Inclui a propriedade src no elemento video -->
    </div>
  </div>
</template>

<style>
  #app {
        /* Define o tamanho do elemento pai como o tamanho do viewport */
        width: 100vw;
        height: 100vh;

        /* Define o tamanho máximo do componente MyBoard como 100% do tamanho do elemento pai */
        max-width: 100%;
        max-height: 100%;

        /* Ajusta o conteúdo do componente MyBoard para se encaixar dentro do tamanho limitado */
        object-fit: scale-down;
  }

  /* Define o estilo do quadrado de vídeo flutuante */
  .video-container {
    /* Posiciona o quadrado de vídeo flutuante no canto inferior direito da tela */
    position: absolute;
    bottom: 0;
    right: 0;

    /* Define o tamanho do quadrado de vídeo flutuante */
    width: 200px;
    height: 200px;

    /* Define o estilo do elemento video */

  }
</style>

<script>
import MyBoard from './components/MyBoard.vue';
import VideoStream from './components/VideoStream.vue'; // Importa o componente VideoStream

export default {
  name: 'App',
  data() {
    return {
      videoUrl: 'https://www.example.com/video.mp4' // Define a URL do vídeo
    }
  },
  components: {
    MyBoard, 
    VideoStream // Inclui o componente VideoStream na seção components do seu componente principal
  }
};
</script>
<template>
  <div id="app">
    <MyBoard></MyBoard>
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
</style>

<script>
import MyBoard from './components/MyBoard.vue';

export default {
  name: 'App',
  components: {
    MyBoard
  }
};
</script>



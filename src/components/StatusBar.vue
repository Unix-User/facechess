<template>
  <div class="status-bar">
    <div class="alert alert-warning">
      Bem vindo a sala  {{ player.roomId }}, jogadores online: {{ status.players }} <br />
    </div>
  </div>
</template>
<style>
.status-bar {
  width: 100%;
  height: auto;
  max-width: 400px;
  min-width: 200px;
  max-height: 30px;
  min-height: 30px;
  left: 0x;
  top: 10px;
  background-color: rgb(0, 0, 0);
  position: fixed;
  position: relative;
  border-radius: 7.5px;
}
</style>

<script>
export default {
  name: 'StatusBar',
  props: {
    emitter: {
      type: Object,
      required: true,
    },
  },
  computed: {
    status() {
      console.log(this.$parent.status);
      return this.$parent.status;
    },
    player() {
      console.log(this.$parent.player);
      return this.$parent.player;
    }
  },
};
</script>

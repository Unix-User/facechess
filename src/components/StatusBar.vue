<template>
  <div class="status-bar">
    <div class="alert alert-warning">
      Bem vindo a sala  {{ player.roomId }}, jogadores online: {{ status.players }} <br />
    </div>
  </div>
</template>

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

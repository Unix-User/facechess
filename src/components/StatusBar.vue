<template>
  <!-- player.roomId  ||  status.players -->
  <b-alert :show="dismissCountDown" dismissible variant="warning" @dismissed="dismissCountDown = 0"
    @dismiss-count-down="countDownChanged">
    <p>This alert will dismiss after {{ dismissCountDown }} seconds...</p>
    <b-progress variant="warning" :max="dismissSecs" :value="dismissCountDown" height="4px"></b-progress>
  </b-alert>
</template>

<script>
import { BAlert, BProgress } from 'bootstrap-vue';

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
  data() {
    return {
      dismissSecs: 10,
      dismissCountDown: 0,
      showDismissibleAlert: false
    }
  },
  components: {
    BAlert,
    BProgress,
  },
  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs
    }
  }
};
</script>

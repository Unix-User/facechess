<template>
  <!-- player.roomId  ||  status.players -->
  <b-alert :show="dismissCountDown" v-bind:variant="status.variant" @dismissed="dismissCountDown = 0"
    @dismiss-count-down="countDownChanged">
    <p>{{ status.message }} {{ dismissCountDown }}</p>
    <b-progress v-bind:variant="status.variant" :max="dismissSecs" :value="dismissCountDown" height="4px"></b-progress>
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
      return this.$parent.status;
    },
    player() {
      return this.$parent.player;
    }
  },
  data() {
    return {
      dismissSecs: 4,
      dismissCountDown: 0,
      showDismissibleAlert: false
    }
  },
  components: {
    BAlert,
    BProgress,
  },
  watch: {
    status: {
      handler() {
        this.showAlert();
      }
    }
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

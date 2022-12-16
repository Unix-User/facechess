<template>
  <div class="status-bar">
    <p>Status: {{ status }}</p>
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
  data() {
    return {
      status: this.$parent.status,
    }
  }
};
</script>

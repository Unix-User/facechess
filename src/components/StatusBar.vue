<template>
  <div class="status-bar">
    <p style="color: red;">Status: {{ status }}</p>
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
            return this.$parent.status;
        }
    },
};
</script>

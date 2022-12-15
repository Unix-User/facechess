<template>
  <div class="status-bar">
    <p style="color: white;">Status: {{ status }}</p>
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  props: {
    status: {
      type: String,
      required: true
    }
  }
};
</script>

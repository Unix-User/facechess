<template>
  <div class="message-list" ref="messageList">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message"
      :class="{ 'message-right': isWhitePlayer(message) }"
    >
      <div class="message-bubble">
        <div class="icon-container">
          <img
            :src="getPlayerIcon(message)"
            :alt="`${message.name}'s icon`"
            class="message-icon"
          />
        </div>
        <div class="message-content">
          <div class="message-sender">{{ message.name }}</div>
          <div class="message-text">{{ message.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUpdated } from 'vue';

export default {
  name: 'MessageList',
  props: {
    messages: {
      type: Array,
      required: true
    }
  },
  setup() {
    const messageList = ref(null);

    const scrollToBottom = () => {
      if (!messageList.value) return;
      messageList.value.scrollTop = messageList.value.scrollHeight;
    };

    onMounted(scrollToBottom);
    onUpdated(scrollToBottom);

    const isWhitePlayer = (message) => message.color === 'w';
    const getPlayerIcon = (message) => `/wikipedia/${message.color}K.png`;

    return {
      messageList,
      isWhitePlayer,
      getPlayerIcon
    };
  }
}
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 100%;
  padding: 10px;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  margin-bottom: 10px;
}

.message-right {
  justify-content: flex-end;
}

.message-bubble {
  display: flex;
  max-width: 80%;
  background-color: #f1f0f0;
  border-radius: 18px;
  padding: 8px 12px;
}

.message-right .message-bubble {
  background-color: #dcf8c6;
}

.icon-container {
  width: 30px;
  height: 30px;
  margin-right: 8px;
  flex-shrink: 0;
}

.message-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-sender {
  font-weight: bold;
  margin-bottom: 2px;
}

.message-text {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}
</style>

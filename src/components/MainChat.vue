<template>
  <b-container class="accordion p-0 m-0" role="tablist">
    <b-card no-body class="d-flex flex-column h-100">
      <b-card-header header-tag="header" role="tab" class="flex-shrink-0">
        <b-input-group prepend="@">
          <b-form-input
            v-model="name"
            placeholder="Username"
            :state="nameValidationState"
            @input="resetNameValidationState"
          />
          <b-button
            @click="$emit('toggle-video-stream')"
            :variant="videoButtonVariant"
            :aria-label="videoButtonLabel"
          >
            <b-icon :icon="videoButtonIcon" />
          </b-button>
        </b-input-group>
        <template v-if="nameValidationState === 'invalid'">
          Digite um nome de usuário para enviar mensagens!
        </template>
      </b-card-header>
      <b-card-body class="messages-container flex-grow-1" ref="messagesContainer">
        <b-alert show variant="info" v-if="showVideoStream">
          Videochamada em andamento
        </b-alert>
        <MessageList :messages="localMessages" />
      </b-card-body>
      <template #footer>
        <b-row align-v="end" class="flex-shrink-0">
          <b-input-group>
            <b-form-input
              type="text"
              v-model="text"
              @keyup.enter="sendMessage"
              ref="input"
            />
            <b-input-group-append>
              <b-button variant="primary" @click="sendMessage">Enviar</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-row>
      </template>
    </b-card>
  </b-container>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import socketClient from "@/utils/socketClient";
import MessageList from '@/components/MessageList.vue';

export default {
  name: "MainChat",
  components: {
    MessageList
  },
  props: {
    player: {
      type: Object,
      required: true,
    },
    showVideoStream: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const name = ref("");
    const text = ref("");
    const localMessages = ref([]);
    const nameValidationState = ref(null);
    const messagesContainer = ref(null);

    const resetNameValidationState = () => {
      nameValidationState.value = null;
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (!messagesContainer.value) return;
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      });
    };

    const sendMessage = () => {
      if (!name.value) {
        nameValidationState.value = "invalid";
        return;
      }
      const message = createMessage();
      localMessages.value.push(message);
      socketClient.sendMessage(message);
      text.value = "";
      scrollToBottom();
    };

    const createMessage = () => ({
      id: Date.now(),
      message: text.value,
      color: props.player.color,
      name: name.value,
    });

    const addMessage = (message) => {
      localMessages.value.push(message);
      scrollToBottom();
    };

    const videoButtonVariant = computed(() => 
      props.showVideoStream ? 'primary' : 'outline-primary'
    );

    const videoButtonLabel = computed(() => 
      props.showVideoStream ? 'Stop video' : 'Start video'
    );

    const videoButtonIcon = computed(() => 
      props.showVideoStream ? 'camera-video-fill' : 'camera-video'
    );

    onMounted(() => {
      socketClient.onReceivedMessage(addMessage);
      scrollToBottom();
    });

    onUnmounted(() => {
      socketClient.offReceivedMessage();
    });

    watch(localMessages, scrollToBottom, { deep: true });

    return {
      name,
      text,
      localMessages,
      nameValidationState,
      resetNameValidationState,
      sendMessage,
      videoButtonVariant,
      videoButtonLabel,
      videoButtonIcon,
      messagesContainer,
    };
  },
};
</script>

<style scoped>
.accordion {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  height: calc(100% - 56px);
  scroll-behavior: smooth;
}
</style>
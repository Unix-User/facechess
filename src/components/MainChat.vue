<template>
  <b-container class="accordion p-0 m-0" role="tablist">
    <b-card no-body class="d-flex flex-column" style="height: 100%">
      <b-card-header header-tag="header" role="tab" class="flex-shrink-0">
        <b-input-group prepend="@">
          <b-form-input
            v-model="name"
            placeholder="Username"
            :state="nameValidationState"
            @input="resetNameValidationState"
          ></b-form-input>
          <b-button><b-icon icon="camera"></b-icon></b-button>
        </b-input-group>
        <template v-if="nameValidationState === 'invalid'">
          Digite um nome de usuario para enviar mensagens!
        </template>
      </b-card-header>
      <b-card-body class="messages-container flex-grow-1">
        <b-container
          v-for="message in localMessages"
          :key="message.id"
          class="message"
        >
          <b-card
            :img-src="
              message && message.color === 'w'
                ? '/wikipedia/wK.png'
                : '/wikipedia/bK.png'
            "
            img-alt="Card image"
            img-right
          >
            <b-card-text>{{ message.message }}</b-card-text>
          </b-card>
          <br />
        </b-container>
      </b-card-body>
      <template #footer>
        <b-row align-v="end" class="flex-shrink-0">
          <b-input-group>
            <b-form-input
              type="text"
              v-model="text"
              @keyup.enter="sendMessage"
              ref="input"
            ></b-form-input>
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
import socketClient from "@/utils/socketClient";

export default {
  name: "MainChat",
  props: {
    emitter: {
      type: Object,
      required: true,
    },
    messages: {
      type: Array,
      required: true,
    },
    boardSize: {
      type: Number,
      required: true,
    },
    isMobile: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      name: "",
      text: "",
      nameValidationState: null,
      localMessages: [...this.messages],
    };
  },
  watch: {
    messages: {
      handler(newMessages) {
        this.localMessages = [...newMessages];
      },
      deep: true,
    },
  },
  methods: {
    sendMessage() {
      if (!this.name) {
        this.nameValidationState = "invalid";
        return;
      }
      const message = `${this.name}: ${this.text}`;
      socketClient.sendMessage({ message, color: this.$root.player.color });
      this.addMessage(message, this.$root.player.color );
      this.text = "";
    },
    resetNameValidationState() {
      this.nameValidationState = null;
    },
    addMessage(message, color) {
      this.localMessages.push({ id: Date.now(), message, color });
      console.log(`jogador ${color} enviou uma mensagem`);
    },
  },
  mounted() {
    socketClient.onReceivedMessage((data) => {
      console.log(data);
      const { message, color } = data;
      this.addMessage(message, color);
    });
  }
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
  height: calc(
    100% - 56px
  ); /* Adjust height to account for header and footer */
}

.message {
  margin-bottom: 10px;
}

@media (min-width: 769px) {
  .messages-container {
    height: calc(
      100% - 56px
    ); /* Adjust height to account for header and footer */
  }
}

@media (max-width: 768px) {
  .messages-container {
    height: 80vh;
  }
}
</style>

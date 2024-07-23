<template>
  <NotificationBox
    :emitter="emitter"
    style="position: absolute; top: 0; right: 0; z-index: 1000"
  />
  <div>
    <b-navbar toggleable="lg" type="light" variant="light">
      <b-navbar-brand
        href="#"
        :class="{ 'mx-auto': isMobile, 'text-center': isMobile }"
      >
        <img src="/wikipedia/bK.svg" class="brand-logo" alt="King" /> FaceChess
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" />

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav :class="{ 'mx-auto': isMobile, 'text-center': isMobile }">
          <b-nav-item v-for="(item, index) in navItems" :key="index" href="#" disabled :class="{ 'text-center': isMobile }">
            {{ item.label }}: {{ item.value }}
          </b-nav-item>
          <b-nav-item-dropdown
            text="Desenvolvedores"
            right
            :class="{ 'text-center': isMobile }"
          >
            <b-dropdown-item v-for="dev in developers" :key="dev.name" :href="dev.github">{{ dev.name }}</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>

  <b-container fluid class="main-container">
    <b-container class="bv-example-row">
      <template v-if="!isMobile">
        <b-row no-gutters align-v="stretch">
          <b-col cols="12" md="6">
            <MyBoard
              v-if="shouldShowBoard"
              ref="myBoard"
              :emitter="emitter"
              class="my-board"
              :style="boardStyle"
              @initiate-call="initiateCall"
              :player="player"
              :opponent="opponent"
              :room="room"
            />
          </b-col>
          <b-col cols="12" md="6">
            <MainChat
              :emitter="emitter"
              :messages="messages"
              :showVideoStream="showVideoStream"
              @toggle-video-stream="toggleVideoStream"
              :player="player"
              :opponent="opponent"
              :boardSize="boardSize"
              :isMobile="isMobile"
              class="main-chat"
              :style="chatStyle"
            />
            <VideoStream
              v-if="showVideoStream"
              :streams="streams"
              :isMinimized="isVideoStreamMinimized"
              @minimize="toggleVideoStreamMinimized"
            />
          </b-col>
        </b-row>
      </template>
      <template v-if="isMobile">
        <MyBoard
          v-if="shouldShowBoard"
          ref="myBoard"
          :emitter="emitter"
          class="my-board"
          :style="mobileBoardStyle"
          @initiate-call="initiateCall"
          :player="player"
          :opponent="opponent"
          :room="room"
        />
        <b-button @click="toggleChatModal">
          {{ showChatModal ? "Fechar Chat" : "Abrir Chat" }}
        </b-button>
        <b-modal
          v-model="showChatModal"
          title="Chat"
          body-class="p-0 m-0"
        >
          <MainChat
            :emitter="emitter"
            :messages="messages"
            :showVideoStream="showVideoStream"
            @toggle-video-stream="toggleVideoStream"
            :player="player"
            :opponent="opponent"
            :boardSize="boardSize"
            :isMobile="isMobile"
            class="main-chat"
            :style="chatStyle"
          />
          <VideoStream
            v-if="showVideoStream"
            :streams="streams"
            :isMinimized="isVideoStreamMinimized"
            @minimize="toggleVideoStreamMinimized"
          />
        </b-modal>
      </template>
    </b-container>
  </b-container>
</template>

<script>
import mitt from "mitt";
import { BContainer, BCollapse, BRow, BCol, BNavbar, BNavbarBrand, BNavbarNav, BNavItem, BNavbarToggle, BNavItemDropdown, BDropdownItem, BButton, BModal } from "bootstrap-vue";
import MyBoard from "@/components/MyBoard.vue";
import MainChat from "@/components/MainChat.vue";
import NotificationBox from "@/components/NotificationBox.vue";
import VideoStream from "@/components/VideoStream.vue";
import peerService from "@/services/peerService";
import socketClient from "@/utils/socketClient";

export default {
  name: "App",
  data() {
    return {
      emitter: mitt(),
      peer: "",
      room: null,
      status: "",
      player: {
        color: "w",
        roomId: "",
      },
      opponent: "",
      messages: [],
      page: "chess",
      isMobile: false,
      showChatModal: false,
      boardSize: 0,
      showVideoStream: JSON.parse(localStorage.getItem("showVideoStream") || "false"),
      isVideoStreamMinimized: JSON.parse(localStorage.getItem("isVideoStreamMinimized") || "false"),
      streams: [],
    };
  },
  compatConfig: { MODE: 2 },
  components: {
    BContainer, BCollapse, BRow, BCol, BNavbar, BNavbarBrand, BNavbarNav, BNavItem,
    BNavbarToggle, BNavItemDropdown, BDropdownItem, BButton, BModal,
    MyBoard, MainChat, NotificationBox, VideoStream,
  },
  computed: {
    isVideoCallActive() {
      return this.showVideoStream && this.streams.length > 0;
    },
    shouldShowBoard() {
      return this.page === 'chess' && this.boardSize > 0;
    },
    boardStyle() {
      return { width: `${this.boardSize}px`, height: `${this.boardSize}px` };
    },
    mobileBoardStyle() {
      return { width: '100%', height: `${this.boardSize}px` };
    },
    chatStyle() {
      return { height: `${this.boardSize}px` };
    },
    navItems() {
      return [
        { label: 'Sala', value: this.player?.roomId },
        { label: 'Online', value: this.room?.players },
        { label: 'Cor', value: this.player?.color === "w" ? "branco" : "preto" },
      ];
    },
    developers() {
      return [
        { name: 'Weverton', github: 'https://github.com/Unix-User' },
        { name: 'Will', github: 'https://github.com/MestreWilll' },
      ];
    },
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    toggleChatModal() {
      this.showChatModal = !this.showChatModal;
    },
    resizeBoard() {
      const containerWidth = document.querySelector(".bv-example-row").clientWidth;
      const containerHeight = window.innerHeight;
      this.boardSize = Math.min(containerWidth / 2, containerHeight);
    },
    toggleVideoStream() {
      this.showVideoStream = !this.showVideoStream;
      this.showVideoStream ? this.initializeVideoCall() : this.endVideoCall();
    },
    initializeVideoCall() {
      socketClient.emitEvent("initiate-call", {
        roomId: this.player.roomId,
        playerId: this.player.playerId,
      });
    },
    endVideoCall() {
      socketClient.emitEvent("end-call", {
        roomId: this.player.roomId,
        playerId: this.player.playerId,
      });
    },
    handleConnectionError(error) {
      console.error("Connection error:", error);
      this.emitter.emit("status", {
        variant: "danger",
        message: `Connection error: ${error}`,
      });
    },
    updateStream(stream) {
      const index = this.streams.findIndex((s) => s.id === stream.id);
      index !== -1 ? this.$set(this.streams, index, stream) : this.streams.push(stream);
    },
    closeStream(streamId) {
      const index = this.streams.findIndex((s) => s.id === streamId);
      index !== -1 && this.streams.splice(index, 1);
    },
    addStream(stream) {
      this.streams.push(stream);
    },
    handleIncomingCall(callerId) {
      confirm(`Recebendo chamada de ${callerId}. Deseja atender?`) && this.startCall(callerId);
    },
    startCall(callerId) {
      peerService.startCall(this.room, callerId).then(({ peer, localStream }) => {
        this.peer = peer;
        this.addStream(localStream);
      });
    },
    updateBoardOrientation() {
      this.$refs.myBoard?.updateBoardOrientation();
    },
    toggleVideoStreamMinimized() {
      this.isVideoStreamMinimized = !this.isVideoStreamMinimized;
    },
  },
  mounted() {
    window.addEventListener("resize", this.checkMobile);
    window.addEventListener("resize", this.resizeBoard);
    this.checkMobile();
    this.resizeBoard();

    this.emitter.on("room", (data) => this.room = data);
    this.emitter.on("status", (data) => this.status = data);
    this.emitter.on("player", (data) => {
      this.player = data;
      this.updateBoardOrientation();
    });
    this.emitter.on("opponent", (data) => this.opponent = data);
    this.emitter.on("peer", (peer) => this.peer = peer);

    this.room = "sala-exemplo";
    this.player.roomId = this.room;

    this.emitter.emit("room", this.room);
    this.emitter.emit("player", this.player);

    socketClient.onIncomingCall(({ callerId }) => this.handleIncomingCall(callerId));

    socketClient.connect();
    socketClient.emitEvent("join-room", { roomId: this.room, player: this.player });

    socketClient.onEvent("room-data", (data) => {
      this.room = data;
      this.emitter.emit("room", data);
    });

    socketClient.onEvent("player-data", (data) => {
      this.player = data;
      this.emitter.emit("player", data);
      this.updateBoardOrientation();
    });

    socketClient.onEvent("opponent-data", (data) => {
      this.opponent = data;
      this.emitter.emit("opponent", data);
    });

    socketClient.onEvent("status", (data) => {
      this.status = data;
      this.emitter.emit("status", data);
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
    window.removeEventListener("resize", this.resizeBoard);
  },
};
</script>

<style>
.brand-logo {
  display: inline-block;
  vertical-align: top;
}

.main-container {
  padding: 4px;
  margin: 0;
  background-size: cover;
  background-position: center;
}

.my-board {
  width: 100%;
  height: auto;
}

.main-chat {
  width: 100%;
  height: 100%;
}
</style>
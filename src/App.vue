<template>
  <NotificationBox
    :emitter="emitter"
    style="position: absolute; top: 0; right: 0; z-index: 1000"
  ></NotificationBox>
  <div>
    <b-navbar toggleable="lg" type="light" variant="light">
      <b-navbar-brand
        href="#"
        :class="{ 'mx-auto': isMobile, 'text-center': isMobile }"
      >
        <img src="/wikipedia/bK.svg" class="brand-logo" alt="King" /> FaceChess
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav :class="{ 'mx-auto': isMobile, 'text-center': isMobile }">
          <b-nav-item href="#" disabled :class="{ 'text-center': isMobile }"
            >Sala: {{ player.roomId }}</b-nav-item
          >
          <b-nav-item href="#" disabled :class="{ 'text-center': isMobile }"
            >Online: {{ room.players }}</b-nav-item
          >
          <b-nav-item href="#" disabled :class="{ 'text-center': isMobile }"
            >Cor: {{ player.color === "w" ? "branco" : "preto" }}</b-nav-item
          >
          <b-nav-item-dropdown
            text="Desenvolvedores"
            right
            :class="{ 'text-center': isMobile }"
          >
            <b-dropdown-item href="https://github.com/Unix-User"
              >Weverton</b-dropdown-item
            >
            <b-dropdown-item href="https://github.com/MestreWilll"
              >Will</b-dropdown-item
            >
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>

  <b-container fluid class="main-container">
    <b-container class="bv-example-row">
      <b-row no-gutters align-v="stretch" v-if="!isMobile">
        <b-col cols="12" md="6">
          <div v-if="page === 'chess' && boardSize > 0">
            <MyBoard
              ref="myBoard"
              :emitter="emitter"
              class="my-board"
              :style="{ width: boardSize + 'px', height: boardSize + 'px' }"
            ></MyBoard>
          </div>
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
            :style="{ height: boardSize + 'px' }"
          ></MainChat>
        </b-col>
      </b-row>
      <div v-if="isMobile">
        <div v-if="page === 'chess' && boardSize > 0">
          <MyBoard
            ref="myBoard"
            :emitter="emitter"
            class="my-board"
            :style="{ width: '100%', height: boardSize + 'px' }"
          ></MyBoard>
        </div>
        <b-button @click="toggleChatModal">{{
          showChatModal ? "Fechar Chat" : "Abrir Chat"
        }}</b-button>
        <b-modal
          v-model="showChatModal"
          title="Chat"
          body-class="p-0 m-0"
          hide-footer
          size="lg"
          centered
        >
          <div style="height: 50vh">
            <MainChat
              :emitter="emitter"
              :messages="messages"
              :player="player"
              :opponent="opponent"
              :boardSize="boardSize"
              :isMobile="isMobile"
              class="flex-grow-1 main-chat"
            ></MainChat>
          </div>
        </b-modal>
      </div>
      <VideoStream
        v-if="showVideoStream"
        :streams="streams"
        @update-stream="updateStream"
        @close-stream="closeStream"
      ></VideoStream>
    </b-container>
  </b-container>
</template>

<script>
import { Analytics } from "@vercel/analytics/react"
import {
  BNavbar,
  BNavbarBrand,
  BNavbarNav,
  BNavItem,
  BNavbarToggle,
  BNavItemDropdown,
  BDropdownItem,
  BContainer,
  BCollapse,
  BRow,
  BCol,
  BButton,
  BModal,
} from "bootstrap-vue";
import MainChat from "./components/MainChat.vue";
import MyBoard from "./components/MyBoard.vue";
import NotificationBox from "./components/NotificationBox.vue";
import VideoStream from "./components/VideoStream.vue";
import mitt from "mitt";

export default {
  name: "App",
  data() {
    return {
      emitter: mitt(),
      peer: "",
      room: "",
      status: "",
      player: "",
      opponent: "",
      messages: [],
      page: "chess", // default page
      isMobile: false,
      showChatModal: false,
      boardSize: 0, // Add this line
      showVideoStream: JSON.parse(
        localStorage.getItem("showVideoStream") || "false"
      ),
      isVideoStreamMinimized: JSON.parse(
        localStorage.getItem("isVideoStreamMinimized") || "false"
      ),
      streams: [], // Initialize streams as an empty array
    };
  },
  compatConfig: { MODE: 2 },
  components: {
    BContainer,
    BCollapse,
    BRow,
    BCol,
    BNavbar,
    BNavbarBrand,
    BNavbarNav,
    BNavItem,
    BNavbarToggle,
    BNavItemDropdown,
    BDropdownItem,
    BButton,
    BModal,
    MyBoard,
    MainChat,
    NotificationBox,
    VideoStream,
  },
  methods: {
    setPage(newPage) {
      this.page = newPage;
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    toggleChatModal() {
      this.showChatModal = !this.showChatModal;
    },
    resizeBoard() {
      const containerWidth =
        document.querySelector(".bv-example-row").clientWidth;
      const containerHeight = window.innerHeight;
      this.boardSize = Math.min(containerWidth / 2, containerHeight);
    },
    toggleVideoStream() {
      this.showVideoStream = !this.showVideoStream;
      if (this.showVideoStream) {
        this.initializeVideoStream();
      } else {
        this.stopVideoStream();
      }
    },
    initializeVideoStream() {
      if (!this.streams.length) {
        this.streams.push({
          id: Date.now(),
          mediaStream: null,
          posX: 0,
          posY: 0,
          size: 100,
          isMinimized: false,
          isDragging: false,
          isMuted: false,
        });
      }
    },
    stopVideoStream() {
      this.streams.forEach((stream) => {
        if (stream.mediaStream) {
          stream.mediaStream.getTracks().forEach((track) => track.stop());
        }
      });
      this.streams = [];
    },
    toggleMinimizeVideoStream() {
      this.isVideoStreamMinimized = !this.isVideoStreamMinimized;
      localStorage.setItem(
        "isVideoStreamMinimized",
        JSON.stringify(this.isVideoStreamMinimized)
      );
    },
    updateStream({ index, key, value }) {
      this.streams[index][key] = value;
    },
    closeStream(index) {
      if (this.streams[index].mediaStream) {
        this.streams[index].mediaStream
          .getTracks()
          .forEach((track) => track.stop());
      }
      this.streams.splice(index, 1);
      if (this.streams.length === 0) {
        this.showVideoStream = false;
      }
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
    this.resizeBoard();
    window.addEventListener("resize", this.resizeBoard);
    this.emitter.on("show-message", (data) => {
      this.messages.push(data);
    });
    this.emitter.on("room", (data) => {
      this.room = data;
    });
    this.emitter.on("status", (data) => {
      this.status = data;
    });
    this.emitter.on("player", (data) => {
      this.player = data;
    });
    this.emitter.on("opponent", (data) => {
      this.opponent = data;
    });
    this.emitter.on("peer", (peer) => {
      this.peer = peer;
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
}

.my-board {
  width: 100%;
  height: auto;
}

.main-chat {
  width: 100%;
  height: 100%;
}
.video-stream-active {
  padding-right: 320px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

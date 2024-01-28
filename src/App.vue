<template>
  <StatusBar
    :emitter="emitter"
    style="position: absolute; top: 0; right: 0; z-index: 1000"
  ></StatusBar>
  <div>
    <b-navbar toggleable="lg" type="light" variant="light">
      <b-navbar-brand href="#">
        <img
          src="/wikipedia/bK.svg"
          class="d-inline-block align-top"
          alt="King"
        />
        FaceChess
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item @click="setPage('chess')">chess</b-nav-item>
          <b-nav-item @click="setPage('pong')">pong</b-nav-item>

          <b-nav-item href="#" disabled>Sala: {{ player.roomId }}</b-nav-item>
          <b-nav-item href="#" disabled>Online: {{ room.players }}</b-nav-item>
          <b-nav-item-dropdown text="Desenvolvedores" right>
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

  <b-container fluid class="p-0 m-0">
    <b-container class="bv-example-row">
      <b-row no-gutters align-v="stretch">
        <b-col>
          <div v-if="page === 'chess'">
            <MyBoard :emitter="emitter"></MyBoard>
          </div>
          <div v-else-if="page === 'pong'"><PongWars /></div>
        </b-col>
        <b-col>
          <MainChat :emitter="emitter"></MainChat>
        </b-col>
      </b-row>
    </b-container>
  </b-container>
</template>

<script>
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
} from "bootstrap-vue";
import MainChat from "./components/MainChat.vue";
import MyBoard from "./components/MyBoard.vue";
import StatusBar from "./components/StatusBar.vue";
import PongWars from "./components/PongWars.vue";
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
    MyBoard,
    MainChat,
    StatusBar,
    PongWars,
  },
  methods: {
    setPage(newPage) {
      this.page = newPage;
    },
  },
  mounted() {
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
};
</script>

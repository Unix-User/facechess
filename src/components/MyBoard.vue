<template>
  <div id="myBoard"></div>
</template>

<style>
#myBoard {
  position: relative;
  width: 100%;
  height: auto;
  max-width: 433px;
  min-height: 190px;
  background-color: #ffffff;
  color: rgb(133, 86, 86);
  border: 1px solid rgb(104, 67, 67);
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
</style>

<script>
import { Chess } from 'chess.js'
import Chessboard from "chessboardjs-vue3"
import io from 'socket.io-client'
const url = process.env.VUE_APP_SERVER_URL + ':' + process.env.VUE_APP_SERVER_PORT
const socket = io(url);

export default {
  name: 'MyBoard',
  props: {
    emitter: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      board: null,
      game: new Chess(),
      config: {
        draggable: true,
        position: "start",
        onDragStart: this.onDragStart,
        onDrop: this.onDrop,
      }
    };
  },
  methods: {
    // eslint-disable-next-line
    onDragStart(source, piece, position, orientation) {
      if (this.game.isGameOver())
        return false;
      if ((this.game.turn() === "w" && piece.charAt(0) === "b") ||
        (this.game.turn() === "b" && piece.charAt(0) === "w")) {
        return false;
      }
    },
    onDrop(source, target) {
      var piece = this.game.get(source);
      if (piece && piece.type === "p" && (target[1] === "8" || target[1] === "1")) {
        var move = this.game.move({
          from: source,
          to: target,
          promotion: "q"
        });
      }
      else {
        move = this.game.move({
          from: source,
          to: target
        });
      }
      if (move) {
        socket.emit("move", move);
        this.onSnapEnd();
      }
      else {
        return "snapback";
      }
    },
    onReceivedMove(source, target) {
      var piece = this.game.get(source);
      if (piece && piece.type === "p" && (target[1] === "8" || target[1] === "1")) {
        var move = this.game.move({
          from: source,
          to: target,
          promotion: "q"
        });
      }
      else {
        move = this.game.move({
          from: source,
          to: target
        });
      }
      if (move) {
        this.onSnapEnd();
      }
      else {
        return "snapback";
      }
    },
    onSnapEnd() {
      this.board.position(this.game.fen());
    },
    sendMessage(message) {
      console.log(message)
      this.socket.emit('send-message', message);
    }
  },
  mounted() {
    this.board = Chessboard("myBoard", this.config);
    socket.emit("joined", this.room);
    socket.on("room", (data) => {
      this.$emit("onRoomData", data);
    });
    socket.on("player", (data) => {
      console.log("Dados do jogador:", data);
    });
    socket.on("move-received", (data) => {
      console.log(data);
      this.onReceivedMove(data.from, data.to);
      this.onSnapEnd();
    });
    socket.on('chat-message', message => {
      console.log(message)
      this.emitter.emit('received-message', message);
    });
    this.emitter.on('send-message', message => {
      console.log(message)
      socket.emit('send-message', message);
    });
  },

}
</script>

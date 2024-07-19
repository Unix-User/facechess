<template>
  <div id="myBoard"></div>
</template>

<script>
import { Chess } from "chess.js";
import Chessboard from "chessboardjs-vue3";
import socketClient from "@/utils/socketClient";
import peerService from "@/utils/peerService";

export default {
  name: "myBoard",
  props: {
    emitter: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      player: null,
      opponent: null,
      board: null,
      game: new Chess(),
      whiteSquareGrey: "#a9a9a9",
      blackSquareGrey: "#696969",
      config: null,
      room: null,
    };
  },
  computed: {
    boardOrientation() {
      return this.player?.color === "w" ? "white" : "black";
    },
  },
  methods: {
    updateBoardOrientation() {
      this.board?.orientation(this.boardOrientation);
    },
    onDragStart(source, piece) {
      if (this.game.isGameOver()) {
        this.emitter.emit("status", { variant: "Alert", message: "Esse jogo acabou" });
        return false;
      }
      if ((this.game.turn() === "w" && piece.startsWith("b")) || (this.game.turn() === "b" && piece.startsWith("w"))) {
        this.emitter.emit("status", {
          variant: "warning",
          message: this.game.turn() === "w" ? "Agora é o turno das brancas" : "Agora é o turno das pretas",
        });
        return false;
      }
    },
    onDrop(source, target) {
      if (source === target || this.game.turn() !== this.player.color) {
        this.emitter.emit("status", {
          variant: "warning",
          message: this.game.turn() === "w" ? "Aguarde o turno das brancas terminar" : "Aguarde o turno das pretas terminar",
        });
        return "snapback";
      }
      const piece = this.game.get(source);
      const move = this.game.move({
        from: source,
        to: target,
        promotion: piece?.type === "p" && (target[1] === "8" || target[1] === "1") ? "q" : undefined,
      });
      if (move) {
        console.log(`Move sent: ${JSON.stringify(move)}`);
        socketClient.sendMove(move);
        this.onSnapEnd();
      } else {
        return "snapback";
      }
    },
    onReceivedMove(source, target) {
      if (source === target) return "snapback";
      const piece = this.game.get(source);
      const move = this.game.move({
        from: source,
        to: target,
        promotion: piece?.type === "p" && (target[1] === "8" || target[1] === "1") ? "q" : undefined,
      });
      if (move) this.onSnapEnd();
      else return "snapback";
    },
    removeGreySquares() {
      document.querySelectorAll(".square-55d63").forEach(square => (square.style.background = ""));
    },
    greySquare(square) {
      const $square = document.querySelector(".square-" + square);
      $square.style.background = $square.classList.contains("black-3c85d") ? this.blackSquareGrey : this.whiteSquareGrey;
    },
    onMouseoverSquare(square) {
      const moves = this.game.moves({ square, verbose: true });
      if (moves.length === 0) return;
      this.greySquare(square);
      moves.forEach(move => this.greySquare(move.to));
    },
    onMouseoutSquare() {
      this.removeGreySquares();
    },
    updateStatus() {
      if (this.game.isCheckmate()) {
        this.emitter.emit("status", { variant: "danger", message: "Game over, checkmate." });
      } else if (this.game.isDraw()) {
        this.emitter.emit("status", { variant: "danger", message: "Game over, drawn position." });
      } else if (this.game.inCheck()) {
        this.emitter.emit("status", { variant: "warning", message: "Check." });
      }
    },
    onSnapEnd() {
      this.board.position(this.game.fen());
    },
    clearBoard() {
      this.board.start();
      this.game.clear();
      this.game.reset();
    },
  },
  mounted() {
    this.config = {
      draggable: true,
      position: "start",
      orientation: this.boardOrientation,
      onDragStart: this.onDragStart,
      onDrop: this.onDrop,
      onMouseoutSquare: this.onMouseoutSquare,
      onMouseoverSquare: this.onMouseoverSquare,
      onSnapEnd: this.onSnapEnd,
    };
    console.log("Initializing board with config:", this.config);
    this.board = Chessboard("myBoard", this.config);

    this.room = this.$parent.room;
    console.log("Joining room:", this.room);
    if (this.room) socketClient.joinRoom(this.room);

    socketClient.onRoom(data => {
      console.log("Room data received:", data);
      this.emitter.emit("room", data);
    });
    socketClient.onPlayer(data => {
      console.log("Player data received:", data);
      this.emitter.emit("player", data);
      this.emitter.emit("status", {
        variant: "info",
        message: data.color === "w" ? "Voce entrou na sala com a cor Branca " : "Voce entrou na sala com a cor Preta",
      });
      this.player = this.$parent.player;
      this.updateBoardOrientation();
      if (this.player?.id) peerService.initialize(this.room, this.player.id);
    });
    socketClient.onOpponent(data => {
      console.log("Opponent data received:", data);
      if (!this.opponent) {
        this.emitter.emit("opponent", data);
        this.emitter.emit("status", {
          variant: "info",
          message: data.color === "w" ? "Oponente entrou na sala com a cor Branca " : "Oponente entrou na sala com a cor Preta",
        });
        this.opponent = this.$parent.opponent;
        socketClient.sendMove("joined", this.player);
      }
    });
    socketClient.onMoveReceived(data => {
      console.log(`Move received: ${JSON.stringify(data)}`);
      this.onReceivedMove(data.from, data.to);
      this.onSnapEnd();
      this.updateStatus();
    });
    socketClient.onDisconnected(() => {
      console.log("Opponent disconnected");
      this.emitter.emit("status", { variant: "danger", message: "Oponente saiu da sala!" });
      this.emitter.emit("opponent", "");
      this.opponent = null;
      this.clearBoard();
    });
    this.emitter.on("send-message", socketClient.sendMessage);
    this.emitter.on("peer", data => socketClient.sendMove("peer", data));

    socketClient.on('user-connected', userId => {
      console.log("User connected:", userId);
      peerService.callPeer(userId);
    });

    socketClient.on('signal', ({ signal }) => {
      console.log("Signal received:", signal);
      peerService.peer.signal(signal);
    });
  },
};
</script>
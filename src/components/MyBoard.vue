<template>
  <div id="myBoard"></div>
</template>

<script>
import { Chess } from "chess.js";
import Chessboard from "chessboardjs-vue3";
import boardService from "@/services/boardService";
import peerService from "@/services/peerService";

export default {
  name: "MyBoard",
  props: {
    emitter: { type: Object, required: true },
    player: { type: Object, required: true },
    opponent: { type: Object, required: true },
    room: { type: String, required: true },
  },
  data() {
    return {
      board: null,
      game: new Chess(),
      whiteSquareGrey: "#a9a9a9",
      blackSquareGrey: "#696969",
      config: null,
    };
  },
  computed: {
    boardOrientation() {
      return this.player?.color === "w" ? "white" : "black";
    },
  },
  methods: {
    updateBoardOrientation() {
      if (!this.board || !this.player) return;
      this.board.orientation(this.boardOrientation);
    },
    onDragStart(source, piece) {
      if (this.game.isGameOver()) {
        this.emitStatus("Alert", "Esse jogo acabou");
        return false;
      }
      if (this.isWrongTurn(piece)) {
        this.emitTurnWarning();
        return false;
      }
    },
    isWrongTurn(piece) {
      return (
        (this.game.turn() === "w" && piece.startsWith("b")) ||
        (this.game.turn() === "b" && piece.startsWith("w"))
      );
    },
    emitTurnWarning() {
      const message = this.game.turn() === "w"
        ? "Agora é o turno das brancas"
        : "Agora é o turno das pretas";
      this.emitStatus("warning", message);
    },
    onDrop(source, target) {
      if (this.isInvalidMove(source, target)) return "snapback";

      const piece = this.game.get(source);
      const move = this.makeMove(source, target, piece);

      if (!move) {
        this.handleInvalidMove(source, target);
        return "snapback";
      }

      this.handleSuccessfulMove(move);
    },
    isInvalidMove(source, target) {
      return source === target || this.game.turn() !== this.player.color;
    },
    makeMove(source, target, piece) {
      return this.game.move({
        from: source,
        to: target,
        promotion: this.getPromotion(piece, target),
      });
    },
    getPromotion(piece, target) {
      if (piece?.type !== "p") return undefined;
      if (target[1] !== "8" && target[1] !== "1") return undefined;
      return "q";
    },
    handleSuccessfulMove(move) {
      console.log(`Move sent: ${JSON.stringify(move)}`);
      this.$emit("move-sent", move);
      boardService.move.emit(move);
      console.log("Move emitted via boardService");
      this.onSnapEnd();
      this.updateStatus();
    },
    handleInvalidMove(source, target) {
      const errorMessage = `Movimento inválido: ${source} para ${target}. Verifique as regras do xadrez.`;
      this.emitStatus("danger", errorMessage);
    },
    onReceivedMove(data) {
      console.log("Move received on client:", data);
      if (this.isInvalidReceivedMove(data)) return;

      const move = this.makeMove(data.from, data.to, { type: data.piece });
      if (!move) {
        console.error("Invalid move received:", data);
        return;
      }
      this.updateBoardAfterMove();
    },
    isInvalidReceivedMove(data) {
      if (this.game.turn() !== data.color) {
        console.error("Received move for wrong color:", data);
        return true;
      }
      return false;
    },
    updateBoardAfterMove() {
      this.board.position(this.game.fen());
      this.updateStatus();
      this.updateBoardOrientation();
    },
    onSnapEnd() {
      this.board.position(this.game.fen());
    },
    clearBoard() {
      this.board.start();
      this.game.clear();
      this.game.reset();
    },
    updateStatus() {
      const status = this.getGameStatus();
      this.emitStatus("info", status);
    },
    getGameStatus() {
      if (this.game.isCheckmate()) return "Xeque-mate!";
      if (this.game.isDraw()) return "Empate!";
      if (this.game.isCheck()) return "Xeque!";
      return "Jogo em andamento";
    },
    initializeBoard() {
      this.config = {
        draggable: true,
        position: "start",
        orientation: this.boardOrientation,
        onDragStart: this.onDragStart,
        onDrop: this.onDrop,
        onSnapEnd: this.onSnapEnd,
      };
      this.board = Chessboard("myBoard", this.config);
    },
    setupEventListeners() {
      boardService.onRoom((data) => this.emitter.emit("room", data));
      boardService.onPlayer(this.handlePlayerJoin);
      boardService.onOpponent(this.handleOpponentJoin);
      boardService.onMoveReceived(this.onReceivedMove);
      boardService.onDisconnected(this.handleDisconnect);
    },
    handlePlayerJoin(data) {
      this.emitter.emit("player", data);
      const colorMessage = data.color === "w" ? "Branca" : "Preta";
      this.emitStatus("info", `Voce entrou na sala com a cor ${colorMessage}`);
      this.updateBoardOrientation();
      if (this.player.id) peerService.initialize(this.room, this.player.id);
    },
    handleOpponentJoin(data) {
      if (this.opponent) return;
      this.emitter.emit("opponent", data);
      const colorMessage = data.color === "w" ? "Branca" : "Preta";
      this.emitStatus("info", `Oponente entrou na sala com a cor ${colorMessage}`);
      boardService.move.emit({ type: "joined", player: this.player });
    },
    handleDisconnect() {
      this.emitStatus("danger", "Oponente saiu da sala!");
      this.emitter.emit("opponent", "");
      this.clearBoard();
    },
    emitStatus(variant, message) {
      this.emitter.emit("status", { variant, message });
    },
  },
  mounted() {
    this.initializeBoard();
    if (this.room) boardService.joinRoom(this.room);
    this.setupEventListeners();
    this.updateBoardOrientation();
  },
  watch: {
    player: {
      handler() {
        this.updateBoardOrientation();
      },
      deep: true,
    },
  },
};
</script>

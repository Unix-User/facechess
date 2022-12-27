<template>
  <div id="myBoard"></div>
</template>

<script>
import { Chess } from 'chess.js'
import Chessboard from "chessboardjs-vue3"
import io from 'socket.io-client'

const url = process.env.VUE_APP_SERVER_URL + ':' + process.env.VUE_APP_SERVER_PORT
const socket = io(url);

export default {
  name: 'myBoard',
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
      whiteSquareGrey: '#a9a9a9',
      blackSquareGrey: '#696969',
      config: {
        draggable: true,
        position: "start",
        onDragStart: (source, piece, position, orientation) => this.onDragStart(source, piece, position, orientation),
        onDrop: (source, target, piece, newPos, oldPos, orientation) => this.onDrop(source, target, piece, newPos, oldPos, orientation),
        onMouseoutSquare: (square, piece) => this.onMouseoutSquare(square, piece),
        onMouseoverSquare: (square, piece) => this.onMouseoverSquare(square, piece),
        onSnapEnd: () => this.onSnapEnd()
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
      if (this.game.turn() !== this.player.color) {
        console.log('invalid move:', 'player color:' + this.player.color, 'turn color:' + this.game.turn())
        return "snapback";
      }
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
    sendMessage(message) {
      console.log(message)
      this.socket.emit('send-message', message);
    },
    removeGreySquares() {
      const squares = document.querySelectorAll('.square-55d63');
      squares.forEach(square => square.style.background = '');
    },
    greySquare(square) {
      const $square = document.querySelector('.square-' + square);
      let background = this.whiteSquareGrey;
      if ($square.classList.contains('black-3c85d')) {
        background = this.blackSquareGrey;
      }
      $square.style.background = background;
    },
    // eslint-disable-next-line
    onMouseoverSquare(square, piece) {
      var moves = this.game.moves({
        square: square,
        verbose: true
      })
      if (moves.length === 0) return
      this.greySquare(square)
      for (var i = 0; i < moves.length; i++) {
        this.greySquare(moves[i].to)
      }
    },
    // eslint-disable-next-line
    onMouseoutSquare(square, piece) {
      this.removeGreySquares()
    },
    onSnapEnd() {
      this.board.position(this.game.fen());
    },
    clearBoard() {
      this.board.start();
    }
  },
  mounted() {
    this.board = Chessboard("myBoard", this.config);
    socket.emit("join", this.room);
    socket.on("room", (data) => {
      this.emitter.emit('room', data);
    });
    socket.on("player", (data) => {
      this.emitter.emit('player', data);
      this.emitter.emit('show-message', { 'message': 'Voce entrou na sala, sua cor é:', 'player': data });
      this.player = this.$parent.player
    });
    socket.on("opponent", (data) => {
      if (this.opponent === null) {
        this.emitter.emit('opponent', data);
        this.emitter.emit('show-message', { 'message': 'Oponente entrou na sala, a cor dele é:', 'player': data });
        this.opponent = this.$parent.opponent
        socket.emit('joined', this.player);
      }
    });
    socket.on('disconnected', () => {
      this.emitter.emit('show-message', { 'message': 'Oponente saiu da sala', 'player': this.opponent });
      this.emitter.emit('opponent', '');
      this.opponent = null;
      this.clearBoard();
      alert('Oponente saiu da sala')
    });
    socket.on("move-received", (data) => {
      console.log(data);
      this.onReceivedMove(data.from, data.to);
      this.onSnapEnd();
    });
    socket.on('received-message', message => {
      this.emitter.emit('show-message', { 'message': message, 'player': this.opponent });
    });
    socket.on('message-sent', message => {
      this.emitter.emit('show-message', { 'message': message, 'player': this.player });
    });
    this.emitter.on('send-message', message => {
      socket.emit('send-message', message);
    });
  },
}
</script>
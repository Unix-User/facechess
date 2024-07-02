<template>
  <div id="myBoard"></div>
</template>

<script>
import { Chess } from 'chess.js'
import Chessboard from "chessboardjs-vue3"
import socketClient from '@/utils/socketClient';

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
    onDragStart(piece) {
      if (this.game.isGameOver()) {
        this.emitter.emit('status', { 'variant': 'Alert', 'message': 'Esse jogo acabou' });
        return false;
      }
      if ((this.game.turn() === "w" && piece.charAt(0) === "b") ||
        (this.game.turn() === "b" && piece.charAt(0) === "w")) {
        this.emitter.emit('status', { 'variant': 'warning', 'message': (this.game.turn() === "w") ? 'Agora é o turno das brancas' : 'Agora é o turno das pretas' });
        return false;
      }
    },
    onDrop(source, target) {
      if (this.game.turn() !== this.player.color) {
        this.emitter.emit('status', { 'variant': 'warning', 'message': (this.game.turn() === "w") ? 'Aguarde o turno das brancas terminar' : 'Aguarde o turno das pretas terminar' });
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
        console.log(`Move sent: ${JSON.stringify(move)}`);
        socketClient.sendMove(move);
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
    onMouseoverSquare(square) {
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
    onMouseoutSquare() {
      this.removeGreySquares()
    },
    updateStatus() {
      if (this.game.isCheckmate()) {
        this.emitter.emit('status', { 'variant': 'danger', 'message': 'Game over, checkmate.' });
      }
      else if (this.game.isDraw()) {
        this.emitter.emit('status', { 'variant': 'danger', 'message': 'Game over, drawn position.' });
      }
      else {
        if (this.game.inCheck()) {
          this.emitter.emit('status', { 'variant': 'warning', 'message': 'Check.' });
        }
      }
    },
    onSnapEnd() {
      this.board.position(this.game.fen());
    },
    clearBoard() {
      this.board.start();
      this.game.clear()
      this.game.reset()
    }
  },
  mounted() {
    this.board = Chessboard("myBoard", this.config);
    socketClient.joinRoom(this.room);
    socketClient.onRoom((data) => {
      this.emitter.emit('room', data);
    });
    socketClient.onPlayer((data) => {
      this.emitter.emit('player', data);
      this.emitter.emit('status', { 'variant': 'info', 'message': (data.color === 'w') ? 'Voce entrou na sala com a cor Branca ' : 'Voce entrou na sala com a cor Preta' });
      this.player = this.$parent.player;
    });
    socketClient.onOpponent((data) => {
      if (this.opponent === null) {
        this.emitter.emit('opponent', data);
        this.emitter.emit('status', { 'variant': 'info', 'message': (data.color === 'w') ? 'Oponente entrou na sala com a cor Branca ' : 'Voce entrou na sala com a cor Preta' });
        this.opponent = this.$parent.opponent;
        socketClient.sendMove('joined', this.player);
      }
    });
    socketClient.onMoveReceived((data) => {
      console.log(`Move received: ${JSON.stringify(data)}`);
      this.onReceivedMove(data.from, data.to);
      this.onSnapEnd();
      this.updateStatus();
    });
    socketClient.onDisconnected(() => {
      this.emitter.emit('status', { 'variant': 'danger', 'message': 'Oponente saiu da sala!' });
      this.emitter.emit('opponent', '');
      this.opponent = null;
      this.clearBoard();
    });
    this.emitter.on('send-message', (message) => {
      socketClient.sendMessage(message);
    });
    this.emitter.on('peer', (data) => {
      socketClient.sendMove('peer', data);
    });
  },
}
</script>
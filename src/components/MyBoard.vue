<template>
  <div id="myBoard" style="width: 400px"></div>
</template>

<script>
import { Chess } from 'chess.js'
import Chessboard from "chessboardjs-vue3"
import io from 'socket.io-client'
const socket = io('http://localhost:8888');

export default {
  data() {
    return {
      board: null,
      game: new Chess(),
      config: {
        draggable: true,
        position: 'start',
        onDragStart: this.onDragStart,
        onDrop: this.onDrop,
      }
    }
  },
  methods: {
    // eslint-disable-next-line
    onDragStart(source, piece, position, orientation) {
      if (this.game.isGameOver()) return false
      if ((this.game.turn() === 'w' && piece.charAt(0) === 'b') ||
        (this.game.turn() === 'b' && piece.charAt(0) === 'w')) {
        return false
      }
    },
    onDrop(source, target) {
      var piece = this.game.get(source);
      if (piece && piece.type === 'p' && (target[1] === '8' || target[1] === '1')) {
        var move = this.game.move({
          from: source,
          to: target,
          promotion: 'q'
        });
      } else {
        move = this.game.move({
          from: source,
          to: target
        });
      }
      if (move) {
        socket.emit('move', move);
        this.board.position(this.game.fen())
      } else {
        return 'snapback'
      }
    },
    onSnapEnd() {
      this.board.position(this.game.fen())
    }
  },
  mounted() {
    console.log(this.game.fen())
    socket.emit('joined', 'room_name');
    this.board = Chessboard('myBoard', this.config)
  }
}
</script>

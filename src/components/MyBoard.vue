<template>
  <div id="myBoard" style="width: 400px"></div>
</template>

<script>
import { Chess } from 'chess.js'
import Chessboard from "chessboardjs-vue3";
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
      if (source[1] === '1' || source[1] === '8' || target[1] === '1' || target[1] === '8') {
        var move = this.game.move({
          from: source,
          to: target,
          promotion: 'q' // Try to promote the pawn to a queen
        });
      } else {
        move = this.game.move({
          from: source,
          to: target
        });
      }
      console.log(move)
      if (move) {
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
    this.board = Chessboard('myBoard', this.config)
  }
}
</script>

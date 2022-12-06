<template>
  <main>
    <section role="region" aria-label="Board Controls">
      <button type="button" @click="boardAPI?.board.toggleOrientation()">
        Toggle orientation
      </button>
      <button type="button" @click="boardAPI?.resetBoard()">Reset</button>
      <button type="button" @click="boardAPI?.undoLastMove()">Undo</button>
      <button type="button" @click="boardAPI?.toggleThreats()">Threats</button>
    </section>
    <TheChessboard :board-config="boardConfig" @board-created="(api) => (boardAPI = api)"
      @checkmate="handleCheckmate" />
  </main>
</template>

<script>
import { ref } from 'vue';
import { TheChessboard } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

export default {
  components: {
    TheChessboard
  },
  setup() {
    return { boardAPI, boardConfig, handleCheckmate, toggleOrientation, resetBoard };
  }
};
const boardAPI = ref();
const boardConfig = {
  coordinates: false,
  autoCastle: false,
};

function handleCheckmate(isMated) {
  if (isMated === 'w') {
    alert('Black wins!');
  } else {
    alert('White wins!');
  }
}

function toggleOrientation() {
  boardAPI.value?.board.toggleOrientation();
}

function resetBoard() {
  boardAPI.value?.resetBoard();
}

</script>

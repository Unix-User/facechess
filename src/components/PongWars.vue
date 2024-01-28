<template>
  <div id="app">
    <div id="game-container">
      <div id="pong-container">
        <canvas ref="pongCanvas" width="800" height="600"></canvas>
        <div id="score" ref="score"></div>
      </div>
      <div id="chat-container">
        <!-- Chat component goes here -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PongWars',
  data() {
    return {
      colorPalette: {
        ArcticPowder: "#F1F6F4",
        MysticMint: "#D9E8E3",
        Forsythia: "#FFC801",
        DeepSaffron: "#FF9932",
        NocturnalExpedition: "#114C5A",
        OceanicNoir: "#172B36",
      },
      DAY_COLOR: null,
      DAY_BALL_COLOR: null,
      NIGHT_COLOR: null,
      NIGHT_BALL_COLOR: null,
      SQUARE_SIZE: 25,
      numSquaresX: null,
      numSquaresY: null,
      squares: [],
      x1: null,
      y1: null,
      dx1: 12.5,
      dy1: -12.5,
      x2: null,
      y2: null,
      dx2: -12.5,
      dy2: 12.5,
      iteration: 0,
      canvas: null,
      ctx: null,
      scoreElement: null
    };
  },
  mounted() {
    this.initGame();
    requestAnimationFrame(this.draw);
  },
  methods: {
    initGame() {
      this.canvas = this.$refs.pongCanvas;
      this.ctx = this.canvas.getContext("2d");
      this.scoreElement = this.$refs.score;

      this.DAY_COLOR = this.colorPalette.MysticMint;
      this.DAY_BALL_COLOR = this.colorPalette.NocturnalExpedition;
      this.NIGHT_COLOR = this.colorPalette.NocturnalExpedition;
      this.NIGHT_BALL_COLOR = this.colorPalette.MysticMint;

      this.numSquaresX = this.canvas.width / this.SQUARE_SIZE;
      this.numSquaresY = this.canvas.height / this.SQUARE_SIZE;

      for (let i = 0; i < this.numSquaresX; i++) {
        this.squares[i] = [];
        for (let j = 0; j < this.numSquaresY; j++) {
          this.squares[i][j] = i < this.numSquaresX / 2 ? this.DAY_COLOR : this.NIGHT_COLOR;
        }
      }

      this.x1 = this.canvas.width / 4;
      this.y1 = this.canvas.height / 2;

      this.x2 = (this.canvas.width / 4) * 3;
      this.y2 = this.canvas.height / 2;
    },
    drawBall(x, y, color) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.SQUARE_SIZE / 2, 0, Math.PI * 2, false);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.closePath();
    },
    drawSquares() {
      for (let i = 0; i < this.numSquaresX; i++) {
        for (let j = 0; j < this.numSquaresY; j++) {
          this.ctx.fillStyle = this.squares[i][j];
          this.ctx.fillRect(
            i * this.SQUARE_SIZE,
            j * this.SQUARE_SIZE,
            this.SQUARE_SIZE,
            this.SQUARE_SIZE
          );
        }
      }
    },
    randomNum(min, max) {
      return Math.random() * (max - min) + min;
    },
    updateSquareAndBounce(x, y, dx, dy, color) {
      let updatedDx = dx;
      let updatedDy = dy;

      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        let checkX = x + Math.cos(angle) * (this.SQUARE_SIZE / 2);
        let checkY = y + Math.sin(angle) * (this.SQUARE_SIZE / 2);

        let i = Math.floor(checkX / this.SQUARE_SIZE);
        let j = Math.floor(checkY / this.SQUARE_SIZE);

        if (i >= 0 && i < this.numSquaresX && j >= 0 && j < this.numSquaresY) {
          if (this.squares[i][j] !== color) {
            this.squares[i][j] = color;

            if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
              updatedDx = -updatedDx;
            } else {
              updatedDy = -updatedDy;
            }

            updatedDx += this.randomNum(-0.01, 0.01);
            updatedDy += this.randomNum(-0.01, 0.01);
          }
        }
      }

      return { dx: updatedDx, dy: updatedDy };
    },
    updateScoreElement() {
      let dayScore = 0;
      let nightScore = 0;
      for (let i = 0; i < this.numSquaresX; i++) {
        for (let j = 0; j < this.numSquaresY; j++) {
          if (this.squares[i][j] === this.DAY_COLOR) {
            dayScore++;
          } else if (this.squares[i][j] === this.NIGHT_COLOR) {
            nightScore++;
          }
        }
      }

      if (this.scoreElement) {
        this.scoreElement.textContent = `day ${dayScore} | night ${nightScore}`;
      }
    },
    checkBoundaryCollision(x, y, dx, dy) {
      if (x + dx > this.canvas.width - this.SQUARE_SIZE / 2 || x + dx < this.SQUARE_SIZE / 2) {
        dx = -dx;
      }
      if (y + dy > this.canvas.height - this.SQUARE_SIZE / 2 || y + dy < this.SQUARE_SIZE / 2) {
        dy = -dy;
      }

      return { dx: dx, dy: dy };
    },
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawSquares();

      this.drawBall(this.x1, this.y1, this.DAY_BALL_COLOR);
      let bounce1 = this.updateSquareAndBounce(this.x1, this.y1, this.dx1, this.dy1, this.DAY_COLOR);
      this.dx1 = bounce1.dx;
      this.dy1 = bounce1.dy;

      this.drawBall(this.x2, this.y2, this.NIGHT_BALL_COLOR);
      let bounce2 = this.updateSquareAndBounce(this.x2, this.y2, this.dx2, this.dy2, this.NIGHT_COLOR);
      this.dx2 = bounce2.dx;
      this.dy2 = bounce2.dy;

      let boundary1 = this.checkBoundaryCollision(this.x1, this.y1, this.dx1, this.dy1);
      this.dx1 = boundary1.dx;
      this.dy1 = boundary1.dy;

      let boundary2 = this.checkBoundaryCollision(this.x2, this.y2, this.dx2, this.dy2);
      this.dx2 = boundary2.dx;
      this.dy2 = boundary2.dy;

      this.x1 += this.dx1;
      this.y1 += this.dy1;
      this.x2 += this.dx2;
      this.y2 += this.dy2;

      this.iteration++;
      if (this.iteration % 1_000 === 0) console.log("iteration", this.iteration);

      this.updateScoreElement();

      requestAnimationFrame(this.draw);
    }
  }
};
</script>

<style scoped>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

#game-container {
  display: flex;
  width: 100%;
  max-width: 1200px; /* Adjusted for combined chat and game view */
}

#pong-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px; /* Adjusted for combined chat and game view */
}

#pongCanvas {
  display: block;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

#score {
  font-family: monospace;
  margin-top: 30px;
  font-size: 20px;
  padding-left: 20px;
  color: #172b36;
}

#chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  max-width: 400px; /* Adjusted for combined chat and game view */
  border-left: 1px solid #d9e8e3;
}

/* Additional styles for chat component can be added here */
</style>


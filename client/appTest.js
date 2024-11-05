document.addEventListener("DOMContentLoaded", function () {
  const usernameForm = document.getElementById("usernameForm");
  const usernameInput = document.getElementById("usernameInput");
  const chatForm = document.getElementById("chatForm");
  const displayUsername = document.getElementById("displayUsername");

  let bombsBlownUp = 0;
  // Function to start Bomberman game
  function startBomberman(username) {
    // Hide username form and show game interface
    usernameForm.style.display = "none";
    chatForm.style.display = "block";

    // Display welcome message
    displayUsername.textContent = username;

    // Show play button
    playButton.style.display = "inline-block";
  }

  // Event listener for form submission
  usernameForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
      startBomberman(username);
    }
  });

  // Create play button
  const playButton = document.createElement("button");
  playButton.textContent = "Play Bomberman";
  playButton.style.display = "none"; // Initially hide play button

  // Append play button to app div
  const appDiv = document.getElementById("app");
  appDiv.appendChild(playButton);

  // Event listener for play button click
  playButton.addEventListener("click", function () {
    startBombermanGame();
    // Hide play button
    playButton.style.display = "none";
  });

  // Function to start Bomberman game
  function startBombermanGame() {
    const gameBoard = document.createElement("div");
    gameBoard.classList.add("game-board");

    // Create the game board grid (20x20)
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 20; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        gameBoard.appendChild(cell);
      }
    }

    // Append game board to app div
    const appDiv = document.getElementById("app");
    appDiv.appendChild(gameBoard);

    // Add player to initial position (e.g., first cell)
    const initialCell = document.querySelector(".game-board .cell");
    initialCell.classList.add("player");

    // Event listener for keyboard input
    document.addEventListener("keydown", function (event) {
      // Prevent arrow keys and spacebar from scrolling the screen
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === " "
      ) {
        event.preventDefault();
      }

      // Handle keyboard input for player movement and bomb placement
      const playerCell = document.querySelector(".game-board .player");
      let playerIndex = Array.from(playerCell.parentNode.children).indexOf(
        playerCell,
      );
      let nextCellIndex = null;

      switch (event.key) {
        case "ArrowUp":
          if (playerIndex >= 20) {
            nextCellIndex = playerIndex - 20;
          }
          break;
        case "ArrowDown":
          if (playerIndex < 380) {
            nextCellIndex = playerIndex + 20;
          }
          break;
        case "ArrowLeft":
          if (playerIndex % 20 !== 0) {
            nextCellIndex = playerIndex - 1;
          }
          break;
        case "ArrowRight":
          if ((playerIndex + 1) % 20 !== 0) {
            nextCellIndex = playerIndex + 1;
          }
          break;
        case " ": // Spacebar
          placeBomb(playerIndex);
          break;
        default:
          return;
      }

      // Check if nextCellIndex is not null and the next cell is not an obstacle
      if (nextCellIndex !== null) {
        const nextCellElement = document.querySelector(
          `.game-board .cell:nth-child(${nextCellIndex + 1})`,
        );
        if (
          nextCellElement &&
          !nextCellElement.classList.contains("obstacle") &&
          !nextCellElement.classList.contains("barrier")
        ) {
          playerCell.classList.remove("player");
          nextCellElement.classList.add("player");
        }
      }
    });

    // Place obstacles on the game board
    placeObstacles();
  }

  // Function to place obstacles
  function placeObstacles() {
    const cells = document.querySelectorAll(".game-board .cell");
    const obstacleIndices = [
      215, 102, 57, 341, 189, 88, 327, 156, 293, 374, 18, 399, 47, 276, 134, 72,
      198, 311, 30, 231,
    ]; // Example obstacle positions
    const barrierIndices = [
      94, 303, 218, 128, 274, 156, 367, 384, 47, 15, 276, 142, 194, 312, 55,
      193, 281, 79, 326, 150,
    ]; // Example barrier positions
    obstacleIndices.forEach((index) => {
      cells[index].classList.add("obstacle");
    });
    barrierIndices.forEach((index) => {
      cells[index].classList.add("barrier");
    });
  }

  // Function to place bomb
  function placeBomb(playerIndex) {
    const bombCell = document.querySelector(
      `.game-board .cell:nth-child(${playerIndex + 1})`,
    );
    bombCell.classList.add("bomb");

    // Start timer for bomb explosion (1 second)
    setTimeout(() => {
      explodeBomb(bombCell);
    }, 1000);
  }

  // Function to handle bomb explosion
  function explodeBomb(bombCell) {
    bombsBlownUp++;
    console.log("Bomb exploded at:", bombCell);

    // Remove bomb
    bombCell.classList.remove("bomb");

    // Get index of bomb cell
    const bombIndex = Array.from(bombCell.parentNode.children).indexOf(
      bombCell,
    );
    const bombRow = Math.floor(bombIndex / 20); // Assuming each row has 20 cells
    const bombCol = bombIndex % 20;

    // Define adjacent cells
    const adjacentCells = [
      { row: bombRow, col: bombCol - 1 }, // Left
      { row: bombRow, col: bombCol + 1 }, // Right
      { row: bombRow - 1, col: bombCol }, // Up
      { row: bombRow + 1, col: bombCol }, // Down
      { row: bombRow, col: bombCol }, //bomb
    ];

    // Add fire effect to adjacent cells and remove obstacles
    adjacentCells.forEach((cell) => {
      const rowIndex = cell.row;
      const colIndex = cell.col;
      if (rowIndex >= 0 && rowIndex < 20 && colIndex >= 0 && colIndex < 20) {
        const adjacentCellIndex = rowIndex * 20 + colIndex;
        const adjacentCell = bombCell.parentNode.children[adjacentCellIndex];
        console.log("Adjacent cell:", adjacentCell);
        if (adjacentCell && !adjacentCell.classList.contains("barrier")) {
          // Check if the cell is not a barrier
          adjacentCell.classList.add("fire");
          if (adjacentCell.classList.contains("obstacle")) {
            adjacentCell.classList.remove("obstacle");
          }
          if (adjacentCell.classList.contains("player")) {
            endGame();
          }
        }
      }
    });

    // Remove fire effect after a short delay
    setTimeout(() => {
      adjacentCells.forEach((cell) => {
        const rowIndex = cell.row;
        const colIndex = cell.col;
        if (rowIndex >= 0 && rowIndex < 20 && colIndex >= 0 && colIndex < 20) {
          const adjacentCellIndex = rowIndex * 20 + colIndex;
          const adjacentCell = bombCell.parentNode.children[adjacentCellIndex];
          if (adjacentCell) {
            adjacentCell.classList.remove("fire");
          }
        }
      });
    }, 500); // Adjust the duration of the fire effect as needed
  }
  // Function to end the game
  function endGame() {
    // Display score screen with the number of bombs blown up
    const scoreScreen = document.createElement("div");
    scoreScreen.classList.add("score-screen");
    scoreScreen.innerHTML = `
    <h2>Game Over!</h2>
    <p>You blew up ${bombsBlownUp} bombs!</p>
    <button id="restartButton">Restart</button>
  `;
    appDiv.appendChild(scoreScreen);

    // Event listener for restart button
    const restartButton = document.getElementById("restartButton");
    restartButton.addEventListener("click", function () {
      window.location.reload();
    });
  }
});

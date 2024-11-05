import { Gameboard } from "./gameboard.js";
import {} from "./button.js";

export function StartBombermanGame() {
  // const gameBoard = new Gameboard(10, 20);
  //
  // const playButton = new Button("Play game", "button", () =>
  //   console.log("clicked"),
  // );
  // playButton.Mount("#gameArea");
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

// export { StartBombermanGame };

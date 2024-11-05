import { DOMElement } from "../../framework/src/DOM.js";

export class Player extends DOMElement {
  constructor(playerName, playerData) {
    super("div", {
      class: "player",
      id: playerName,
    });

    this.element.classList.add(`player${playerData.playerIndex + 1}`);
  }
}

// setUpPlayer(height, width, username, playerList) {
//   // const cells = this.createPlayarea(this.height, this.width);
//   // this.appendChildren(cells);
//
//   // TODO: set player position with createPlayerData()
//   const player = this.playerData[username];
//   const playerNumber = player.playerIndex + 1;
//
//   // // sets starting cell based on the number of players
//   // const initialCell = document.getElementById(
//   //   this.startCells[playerNumber - 1],
//   // );
//   // // to make sure, that initalCell is set properly
//   // setTimeout(() => {
//   //   initialCell.classList.add(`player${playerNumber}`, "player");
//   // }, 50);
//
//   // const initialCell = document.querySelector(".game-area .cell");
//   // initialCell.classList.add("player");
//
//   const sendGamestate = (data) => {
//     this.sendGamestateFunc(data, true);
//   };
//
//   document.addEventListener("keydown", (event) => {
//     // Prevent arrow keys and spacebar from scrolling the screen
//     if (
//       event.key === "ArrowUp" ||
//       event.key === "ArrowDown" ||
//       event.key === "ArrowLeft" ||
//       event.key === "ArrowRight" ||
//       event.key === " "
//     ) {
//       event.preventDefault();
//     }
//
//     // Handle keyboard input for player movement and bomb placement
//     const playerCell = document.querySelector(`.player${playerNumber}`);
//     let playerIndex = player.position;
//     let nextCellIndex = null;
//
//     // TODO: when player moves, sends an update to the server, type "gamestate", data as a json string
//     switch (event.key) {
//       case "ArrowUp":
//         if (playerIndex >= width) {
//           nextCellIndex = playerIndex - width;
//         }
//         break;
//       case "ArrowDown":
//         if (playerIndex < height * width - width) {
//           nextCellIndex = playerIndex + width;
//         }
//         break;
//       case "ArrowLeft":
//         if (playerIndex % width !== 0) {
//           nextCellIndex = playerIndex - 1;
//         }
//         break;
//       case "ArrowRight":
//         if ((playerIndex + 1) % width !== 0) {
//           nextCellIndex = playerIndex + 1;
//         }
//         break;
//       case " ": // Spacebar
//         if (this.playerData[username].bombAmount < 1) {
//           console.log("no more bombs");
//         }
//         this.placeBomb(playerIndex, this.playerData[username].bombStrength);
//         break;
//       default:
//         return;
//     }
//
//     // Check if nextCellIndex is not null and the next cell is not an obstacle
//     if (nextCellIndex !== null) {
//       const nextCellElement = document.querySelector(
//         `.game-area .cell:nth-child(${nextCellIndex + 1})`,
//       );
//       if (
//         nextCellElement &&
//         !nextCellElement.classList.contains("obstacle") &&
//         !nextCellElement.classList.contains("barrier") &&
//         !nextCellElement.classList.contains("bomb")
//       ) {
//         // playerCell.classList.remove(`player${playerNumber}`);
//         // nextCellElement.classList.add(`player${playerNumber}`);
//         this.playerData[username].position = Number(nextCellElement.id);
//         sendGamestate(this.playerData[username]);
//       }
//     }
//   });
// }

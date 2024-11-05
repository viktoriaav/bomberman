// TODO: take info from server and build map accoring to the gamestate
import { DOMElement } from "../../framework/src/DOM.js";
import { Button } from "./button.js";
import { Player } from "./player.js";

export class Gameboard extends DOMElement {
  constructor(height, width, sendGamestateFunc) {
    super("div", {
      class: "game-area",
      id: "gameArea",
      style: "display: none;",
    });

    // game area size
    this.height = height;
    this.width = width;

    this.players = [];

    this.isEnded = true;

    this.sendGamestateFunc = sendGamestateFunc;
    this.mount("#app");

    // object to hold the data of players
    this.playerData = new Object();

    this.playButton = new Button("Play game", "button", () => {
      const username = sessionStorage.getItem("username");
      this.sendGamestateFunc(username, "ready");
    });

    this.playButton.mount(".input-container");
  }

  createPlayerData(data) {
    const state = new Object();
    state.position = data.position;
    state.playerIndex = data.playerIndex;
    state.health = data.health;
    state.buffs = data.buffs;
    state.bombAmount = data.bombAmount;
    state.bombStrength = data.bombStrength;
    state.speed = data.speed;

    this.playerData[sessionStorage.getItem("username")] = state;
  }

  createPlayarea(data) {
    const h = this.height;
    const w = this.width;
    const cells = [];

    // checks if the data is ok to be processed
    if (
      !(data && Array.isArray(data.playArea) && data.playArea.length === h * w)
    ) {
      console.log("something is wrong with the data");
      return;
    }

    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const cell = new DOMElement("div", {
          // generate index for the cells
          id: `${row * h + col}`,
          class: "cell",
        });

        const i = row * w + col;
        switch (data.playArea[i]) {
          case 1:
            cell.element.classList.add("obstacle");
            break;

          case 2:
            cell.element.classList.add("barrier");
            break;
          default:
            break;
        }

        cells.push(cell);
      }
    }
    this.appendChildren(cells);
    // return cells;
  }

  // Function to place bomb
  setBomb(playerIndex, bombstrength) {
    this.sendGamestateFunc([playerIndex, bombstrength], "bomb");
  }

  damage(username) {
    this.playerData[username].health--;
    if (username != sessionStorage.getItem("username")) return;
    this.sendGamestateFunc(this.playerData[username], "gamestate");
    if (this.playerData[username].health < 1) {
      this.sendGamestateFunc(username, "death");
      this.removeControls();
      return;
    }
  }

  removeControls() {
    return;
  }

  bombArea(bombStrength, bombRow, bombCol) {
    const adjacentCells = [{ row: bombRow, col: bombCol }];
    for (let index = 1; index <= bombStrength; index++) {
      adjacentCells.push(
        { row: bombRow, col: bombCol - index },
        { row: bombRow, col: bombCol + index },
        { row: bombRow - index, col: bombCol },
        { row: bombRow + index, col: bombCol },
      );
    }
    return adjacentCells;
  }
  // Function to handle bomb explosion
  explodeBomb(bombCell, strength) {
    // Remove bomb
    bombCell.classList.remove("bomb");

    // Get index of bomb cell
    const bombIndex = Array.from(bombCell.parentNode.children).indexOf(
      bombCell,
    );
    const bombRow = Math.floor(bombIndex / this.width); // Assuming each row has 20 cells
    const bombCol = bombIndex % this.width;

    // Define adjacent cells
    const adjacentCells = this.bombArea(strength, bombRow, bombCol);
    this.sendGamestateFunc(adjacentCells, "explosion");
    // Add fire effect to adjacent cells and remove obstacles
    adjacentCells.forEach((cell) => {
      const rowIndex = cell.row;
      const colIndex = cell.col;
      if (
        rowIndex >= 0 &&
        rowIndex < this.height &&
        colIndex >= 0 &&
        colIndex < this.width
      ) {
        const adjacentCellIndex = rowIndex * this.width + colIndex;
        const adjacentCell = bombCell.parentNode.children[adjacentCellIndex];
        console.log("Adjacent cell:", adjacentCell);
        if (adjacentCell && !adjacentCell.classList.contains("barrier")) {
          // Check if the cell is not a barrier
          adjacentCell.classList.add("fire");
          if (adjacentCell.classList.contains("obstacle")) {
            adjacentCell.classList.remove("obstacle");
          }
          if (adjacentCell.children.length > 0) {
            const hitPlayer = adjacentCell.children[0].id;
            this.damage(hitPlayer);
          }
        }
      }
    });

    // Remove fire effect after a short delay
    setTimeout(() => {
      adjacentCells.forEach((cell) => {
        const rowIndex = cell.row;
        const colIndex = cell.col;
        if (
          rowIndex >= 0 &&
          rowIndex < this.height &&
          colIndex >= 0 &&
          colIndex < this.width
        ) {
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
  endGame(player, winner) {
    const endScreen = new DOMElement("div", { id: "endscreen" });
    var message;
    if (player == winner) {
      message = "Gratz, you won *dab*";
    } else {
      message = "haha, u dumb, u died";
    }

    endScreen.element.textContent = message;
    endScreen.mount("#app");
  }

  setUpPlayer(height, width, username) {
    for (let [name, value] of Object.entries(this.playerData)) {
      const player = new Player(name, value);
      this.players.push(player);
    }

    const sendGamestate = (data) => {
      this.sendGamestateFunc(data, "gamestate");
    };

    // Define a cooldown time (in milliseconds)
    const COOLDOWN_TIME = 200;
    const BOMBDOWN_TIME = 2000;

    // Object to store cooldown times for each key
    const cooldown = {};

    document.addEventListener("keydown", (event) => {
      // Check if there's an ongoing cooldown for this key
      if (cooldown[event.key] && cooldown[event.key] > Date.now()) {
        // If there's a cooldown, return early to ignore the key press
        return;
      }

      // Set a cooldown for the pressed key
      if (event.key !== " ") {
        cooldown[event.key] =
          Date.now() + (COOLDOWN_TIME - this.playerData[username].Speed * 20);
      }

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
      let playerIndex = this.playerData[username].position;
      let nextCellIndex = null;

      switch (event.key) {
        case "ArrowUp":
          if (playerIndex >= width) {
            nextCellIndex = playerIndex - width;
          }
          break;
        case "ArrowDown":
          if (playerIndex < height * width - width) {
            nextCellIndex = playerIndex + width;
          }
          break;
        case "ArrowLeft":
          if (playerIndex % width !== 0) {
            nextCellIndex = playerIndex - 1;
          }
          break;
        case "ArrowRight":
          if ((playerIndex + 1) % width !== 0) {
            nextCellIndex = playerIndex + 1;
          }
          break;
        case " ": // Spacebar
          console.log(cooldown[event.key]);
          console.log(this.playerData[username].bombAmount);
          console.log(Date.now());
          if (cooldown[event.key] && cooldown[event.key] > Date.now()) {
            // If there's a cooldown, return early to ignore the key press
            return;
          }
          cooldown[event.key] =
            Date.now() +
            (BOMBDOWN_TIME - this.playerData[username].bombAmount * 200);
          this.sendGamestateFunc(this.playerData[username], "gamestate");

          this.setBomb(playerIndex, this.playerData[username].bombStrength);
          break;
        default:
          return;
      }

      // Check if nextCellIndex is not null and the next cell is not an obstacle
      if (nextCellIndex !== null) {
        const nextCellElement = document.querySelector(
          `.game-area .cell:nth-child(${nextCellIndex + 1})`,
        );
        if (nextCellElement.classList.contains("powerup-fire")) {
          this.playerData[username].bombStrength++;
        } else if (nextCellElement.classList.contains("powerup-bomb")) {
          this.playerData[username].bombAmount++;
        } else if (nextCellElement.classList.contains("powerup-speed")) {
          this.playerData[username].Speed++;
          console.log("Updated Speed:", this.playerData[username].Speed);
        }
        if (
          nextCellElement &&
          !nextCellElement.classList.contains("obstacle") &&
          !nextCellElement.classList.contains("barrier") &&
          !nextCellElement.classList.contains("bomb")
        ) {
          this.playerData[username].position = Number(nextCellElement.id);
          sendGamestate(this.playerData[username]);
        }
      }
    });
  }

  renderPlayers() {
    // remove previous positions
    this.players.forEach((playerElement) => {
      playerElement.unmount();
    });

    // add new positions
    for (const username in this.playerData) {
      const player = this.playerData[username];
      const playerObj = this.players.find((obj) => obj.element.id === username);
      const nextCellElement = document.getElementById(player.position);
      // Perform your function for this player``
      nextCellElement.appendChild(playerObj.element);
      // Select the powerup and player elements
      const powerupFireElement = document
        .getElementById(player.position)
        .classList.contains("powerup-fire");
      const powerupSpeedElement = document
        .getElementById(player.position)
        .classList.contains("powerup-speed");
      const powerupBombElement = document
        .getElementById(player.position)
        .classList.contains("powerup-bomb");
      const playerElement1 = nextCellElement.querySelector(".player1");
      const playerElement2 = nextCellElement.querySelector(".player2");
      const playerElement3 = nextCellElement.querySelector(".player3");
      const playerElement4 = nextCellElement.querySelector(".player4");

      // Check if both powerup and player elements exist
      if (
        (powerupFireElement || powerupSpeedElement || powerupBombElement) &&
        (playerElement1 || playerElement2 || playerElement3 || playerElement4)
      ) {
        nextCellElement.classList.remove("powerup-bomb");
        nextCellElement.classList.remove("powerup-speed");
        nextCellElement.classList.remove("powerup-fire");
      }
    }
  }

  renderBombs(bombArr) {
    if (!bombArr || bombArr.length == 0) return;
    bombArr.forEach((bomb) => {
      const [position, strength] = bomb;
      const bombCell = document.getElementById(position.toString());

      if (bombCell) {
        // Add bomb class to the cell
        bombCell.classList.add("bomb");

        // Start timer for bomb explosion after 1 second
        setTimeout(() => {
          this.explodeBomb(bombCell, strength);
        }, 2000);
      } else {
        console.error(`Cell with id ${position} not found.`);
      }
    });
  }
  addPowerup(powerup) {
    // Add a class to the cell representing the powerup
    const cell = document.getElementById(powerup.Position.toString());
    if (cell) {
      cell.classList.add(`powerup-${powerup.Name}`);
    }
  }
}

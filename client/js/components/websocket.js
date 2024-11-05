// WebSocket setup
const SetUpSocket = () => {
  const socket = new WebSocket("ws://localhost:1111/ws");

  socket.onopen = () => {
    console.log("Websocket connection established");
  };
  // Error handling for WebSocket
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  // Close handling for WebSocket
  socket.onclose = function () {
    console.log("WebSocket connection closed");
  };
  return socket;
};
let usernameSubmitted = false; // Flag to track if username has been submitted
// WebSocket message handling
const OnMessageHandler = (socket, gameboard, chatWindow) => {
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    // console.log(message);

    const userList = chatWindow.userList;

    // console.log(userList, userList.element);

    let existingCountdownElement = document.getElementById("countdown");
    const username = usernameInput.value.trim();
    // const chatWindow = document.getElementById("chatForm");

    switch (message.type) {
      case "userlist":
        if (usernameSubmitted) {
          usernameInput.value = "";
          usernameForm.style.display = "none";
          gameArea.style.display = "grid";
          chatForm.style.display = "block";
        }
        userList.element.innerHTML = "";
        message.data.forEach(function (username) {
          const listItem = document.createElement("li");
          listItem.textContent = username;
          listItem.id = `${username}`; // Set unique ID for each <li>
          console.log(username + " joined");
          userList.element.append(listItem);
        });
        break;

      case "chatMessage":
        chatWindow.messageHandler.trigger("recieved", message.data);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll down the chat container
        break;

      case "error":
        // Display error message
        errorMessage.textContent = message.data;
        break;

      case "gamestate":
        // console.log("Recieved gamestate");
        // console.log(message.data);
        gameboard.playerData = message.data["players"];
        gameboard.renderBombs(message.data["bombs"]);
        gameboard.renderPlayers();
        // Extract health information for each player
        const healthInfo = {};
        for (const username in gameboard.playerData) {
          healthInfo[username] = gameboard.playerData[username].health;
        }

        // Update the user interface to display the health information
        for (const username in healthInfo) {
          const health = healthInfo[username];
          const listItem = document.getElementById(`${username}`);
          if (listItem) {
            // Clear previous content
            listItem.innerHTML = username;

            // Append hearts to represent health
            for (let i = 0; i < health; i++) {
              const heartImg = document.createElement("img");
              heartImg.src = "../../static/images/heart.png";
              heartImg.alt = "heart";
              listItem.appendChild(heartImg);
            }
          } else {
            // Create new <li> element for new users
            const newUserItem = document.createElement("li");
            newUserItem.textContent = username;
            newUserItem.id = `user-${username}`;

            // Append hearts to represent health
            for (let i = 0; i < health; i++) {
              const heartImg = document.createElement("img");
              heartImg.src = "../../static/images/heart.png";
              heartImg.alt = "heart";
              newUserItem.appendChild(heartImg);
            }

            userList.element.appendChild(newUserItem);
          }
        }
        break;

      case "readystate":
        console.log("player ready");
        gameboard.createPlayarea(message.data);
        gameboard.createPlayerData(
          message.data.players[sessionStorage.getItem("username")],
        );
        gameboard.playButton.element.style.display = "none";
        break;

      case "start":
        console.log("starting");
        if (existingCountdownElement) {
          // Remove existing countdown element
          existingCountdownElement.remove();
        }
        (gameboard.playerData = message.data),
          gameboard.setUpPlayer(
            gameboard.height,
            gameboard.width,
            sessionStorage.getItem("username"),
          );
        gameboard.isEnded = false;
        break;

      case "gameend":
        console.log(message.data);
        if (!gameboard.isEnded) {
          gameboard.isEnded = true;
          gameboard.endGame(sessionStorage.getItem("username"), message.data);
        }
        break;
      case "countdown":
        // Check if countdown element already exists
        if (existingCountdownElement) {
          // Remove existing countdown element
          existingCountdownElement.remove();
        }

        // Create new countdown element
        const countdownElement = document.createElement("div");
        countdownElement.id = "countdown";
        document.getElementById("gameArea").appendChild(countdownElement);
        countdownElement.innerText = message.data; // Update countdown text
        break;
      case "powerup":
        // Handle powerup message
        const powerup = message.data;
        // Add the powerup to the game board
        gameboard.addPowerup(powerup);
        break;

      default:
        // Handle unknown message type
        console.log("unknown message");
        break;
    }
  };
};

// Function to send username to WebSocket server
const SendUsername = (socket, username) => {
  const data = {
    type: "username",
    data: username,
  };
  usernameSubmitted = true; // Set flag to true when username is submitteds
  console.log(data);
  socket.send(JSON.stringify(data));
};

// Function to send username to WebSocket server
const SendMessage = (socket, message) => {
  const data = {
    type: "message",
    data: message,
  };
  socket.send(JSON.stringify(data));
};

const SendGamestate = (socket, type, payload) => {
  const data = {
    type: type,
    data: payload,
  };
  socket.send(JSON.stringify(data));
};

export {
  SetUpSocket,
  SendUsername,
  SendMessage,
  SendGamestate,
  OnMessageHandler,
};

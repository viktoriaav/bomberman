import { Input } from "./js/components/registration.js";
import { ChatWindow } from "./js/components/chatwindow.js";
import { Gameboard } from "./js/components/gameboard.js";
import {
  SetUpSocket,
  SendUsername,
  SendMessage,
  SendGamestate,
  OnMessageHandler,
} from "./js/components/websocket.js";

document.addEventListener("DOMContentLoaded", function () {
  const socket = SetUpSocket();
  const chatWindow = new ChatWindow((message) => SendMessage(socket, message));
  const registrationForm = new Input((username) =>
    SendUsername(socket, username),
  );
  const gameboard = new Gameboard(20, 20, (data, flag) => {
    SendGamestate(socket, flag, data);
  });

  OnMessageHandler(socket, gameboard, chatWindow);
});

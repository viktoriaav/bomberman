import { DOMElement } from "../../framework/src/DOM.js";
import { EventHandler } from "../../framework/src/EventHandler.js";
import { Button } from "./button.js";
import { SendMessage } from "./websocket.js";
import { StartBombermanGame } from "./bomberman.js";

/**
 * Chat window
 */
export class ChatWindow extends DOMElement {
  constructor(sendMessageFunc) {
    super("div", {
      class: "online-users",
      style: "display: none;",
      id: "chatForm",
    });

    this.sendMessageFunc = sendMessageFunc;

    this.initialPlaceholder = "Type your message...";

    // Create chat window components
    this.messageList = new DOMElement("div", {
      class: "chat",
      id: "chatContainer",
    });
    const chat = new DOMElement("h2", {}, ["Chat"]);
    this.inputField = new DOMElement("input", {
      type: "text",
      placeholder: this.initialPlaceholder,
    });

    // window buttons
    this.sendButton = new Button("send", "button", this.sendMessage.bind(this));

    const online = new DOMElement("h2", {}, ["Online users:"]);
    this.userList = new DOMElement("ul", { id: "userlist" });

    // Append input field and send button to a div
    const inputContainer = new DOMElement("div", { class: "input-container" }, [
      this.inputField,
      this.sendButton,
    ]);

    // this.inputField.onkeydown = function (event) {
    //   console.log(this);
    //   if (event.key == "Enter" && this.inputField == document.activeElement) {
    //     this.messageHandler.trigger("send");
    //   }
    // };
    // Append components to the chat container
    this.appendChildren([
      online,
      this.userList,
      chat,
      this.messageList,
      inputContainer,
    ]);

    // Mount the chat window to the DOM
    this.mount("#app");

    this.messageHandler = new EventHandler();

    this.messageHandler.on("recieved", this.addMessage.bind(this));
  }

  // attaches a referece to the websocket on the window
  addSocket(ws) {
    this.websocket = ws;
  }

  // Function to add a message to the chat window
  addMessage(message) {
    const messageItem = new DOMElement("div", { class: "chat-message" }, [
      message,
    ]);
    this.messageList.appendChildren([messageItem]);
  }

  sendMessage() {
    const message = this.inputField.element.value;

    if (!message) {
      return;
    }

    // reset the text window
    this.inputField.element.value = "";
    this.inputField.element.placeholder = this.initialPlaceholder;

    this.sendMessageFunc(message);
  }
}

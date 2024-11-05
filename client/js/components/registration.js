/* 
    <form id="usernameForm">
        <input type="text" id="usernameInput" placeholder="Enter your username" required>
        <button type="submit">Submit</button>
        <p id="errorMessage"></p>
    </form>
*/
import { DOMElement } from "../../framework/src/index.js";
import { Button } from "./button.js";

export class Input extends DOMElement {
  constructor(sendUsernameFunc) {
    super("form", { id: "usernameForm", class: "username-form" });

    this.sendUsernameFunc = sendUsernameFunc;

    // input fields
    this.input = new DOMElement("input", {
      type: "text",
      id: "usernameInput",
      placeholder: "Enter your username",
      required: "",
    });

    this.input.element.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        this.submitUsername.bind(this);
      }
    });

    this.submitButton = new Button(
      "Submit",
      "submit",
      this.submitUsername.bind(this),
    );
    const error = new DOMElement("p", { id: "errorMessage" });

    // this.loginHandler.on("login", loginUser.bind(this));
    // add elements to the app
    this.appendChildren([this.input, this.submitButton, error]);
    this.mount("#app");
  }

  // attaches a referece to the websocket on the window
  addSocket(ws) {
    this.websocket = ws;
  }

  submitUsername() {
    event.preventDefault();
    const username = this.input.element.value.trim();
    if (!username) {
      return;
    }

    sessionStorage.setItem("username", username);
    this.sendUsernameFunc(username);
  }

  /*
    // Event listener for form submission
    usernameForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const username = usernameInput.value.trim();
      if (username) {
        sendUsername(username);
      }
    });

    // Event listener for Enter key press in username input field
    usernameInput.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        const username = usernameInput.value.trim();
        if (username) {
          sendUsername(username);
        }
      }
    });
  */
}

export default { Input };

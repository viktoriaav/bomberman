// DOM abstraction
import { EventHandler } from "./EventHandler.js";

export class DOMElement extends EventHandler {
  constructor(tagName, attributes = {}, children = []) {
    super(); // Call the constructor of the parent class (EventHandler)
    this.element = document.createElement(tagName);
    this.setAttributes(attributes);
    this.appendChildren(children);
  }

  setAttributes(attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      this.element.setAttribute(key, value);
    }
  }

  appendChildren(children) {
    children.forEach((child) => {
      if (child instanceof DOMElement) {
        this.element.appendChild(child.element);
      } else if (typeof child === "string") {
        this.element.appendChild(document.createTextNode(child));
      }
    });
  }

  mount(selector, top = false) {
    const parentElement = document.querySelector(selector);
    if (parentElement) {
      if (top) {
        parentElement.prepend(this.element);
      } else {
        parentElement.appendChild(this.element);
      }
    } else {
      console.error(
        `Failed to mount element: Selector "${selector}" not found.`
      );
    }
  }

  unmount() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default { DOMElement };

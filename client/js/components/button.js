import { DOMElement } from "../../framework/src/DOM.js";

export class Button extends DOMElement {
  /**
   * Creates a new Button instance.
   * @param {string} label - The label/text displayed on the button.
   * @param {string} [type='button'] - The type of button (e.g., 'button', 'submit').
   * @param {function} [onClick=null] - The click event handler function.
   */
  constructor(label, type = "button", onClick = null, style = "inline") {
    super("button", { type: type }, [label]);
    if (onClick) {
      this.element.addEventListener("click", onClick);
    }

    this.style = style;
  }

  setLabel(label) {
    this.element.innerText = label;
  }

  toggleHide() {
    if (this.element.style.display == "none") {
      this.element.style.display = this.style;
    } else {
      this.element.style.display == "none";
    }
  }
}

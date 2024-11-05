
export class EventHandler {
  constructor() {
    this.eventListeners = {};
  }

  /**
   * Attaches an event listener to a specified event type
   * @param {string} eventType - The type of event to handle
   * @param {function} callback - The event handler function
   */
  on(eventType, callback) {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(callback);
  }

  /**
   * Triggers all event listeners attached to a specified event type
   * @param {string} eventType - The type of event to trigger
   * @param {any} eventData - Data to pass to the event handlers
   */
  trigger(eventType, eventData = null) {
    const listeners = this.eventListeners[eventType];
    if (listeners) {
      listeners.forEach((callback) => {
        callback(eventData);
      });
    }
  }

  /**
   * Removes an event listener from a specified event type
   * @param {string} eventType - The type of event to remove the listener from
   * @param {function} callback - The event handler function to remove
   */
  off(eventType, callback) {
    const listeners = this.eventListeners[eventType];
    if (listeners) {
      this.eventListeners[eventType] = listeners.filter(
        (cb) => cb !== callback
      );
    }
  }
}
export default {EventHandler};
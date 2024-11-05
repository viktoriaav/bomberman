// State Manager
/**
 * Custom state manager for managing application state.
 *
 * @param {any} initialState - The initial state value for the state manager.
 * @returns {object} An object with methods for managing state.
 */
export function StateManager(initialState) {
  let state = initialState;
  let listeners = [];

  /**
   * Get the current state.
   * @returns {any} The current state.
   */
  function getState() {
    return state;
  }

  /**
   * Set the state to a new value and notify subscribers.
   * @param {any} newState - The new state value.
   */
  function setState(newState) {
    state = newState;
    notifyListeners();
  }

  /**
   * Subscribe to state changes.
   * @param {function} listener - A callback function to be called when the state changes.
   * @returns {function} An unsubscribe function to stop listening to state changes.
   */
  function subscribe(listener) {
    listeners.push(listener);
    // Return unsubscribe function
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all subscribed listeners of state changes.
   */
  function notifyListeners() {
    listeners.forEach((listener) => listener(state));
  }

  // Return public methods
  return {
    getState,
    setState,
    subscribe,
  };
}

export default { StateManager };

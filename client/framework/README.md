## DOM

### Constructor

new DOMElement(tagName, attributes = {}, children = [])

Creates a new DOM element with the given tagName, attributes, and children.

tagName (string):

> The name of the HTML element to create.
> attributes (object):
> An optional object containing attribute-value pairs to set on the created element.
> children (array):
> An optional array of elements or strings to append as children of the created element.

### Methods

setAttributes
setAttributes(attributes)

Sets the attributes of the element using the provided object with key-value pairs.

attributes (object):

> An object containing attribute-value pairs to set on the element.
> appendChildren
> appendChildren(children)

### Appends the given children to the element.

children (array):

> An array of elements or strings to append as children of the element.
> mount
> mount(selector)

### Mounts the element to the specified parent element using the provided selector.

selector (string):

> A CSS selector identifying the parent element to which the current element should be appended.
> unmount
> unmount()

### Unmounts the element by removing it from its parent node.

Usage
Import the DOMElement class and use it to create and manage HTML elements with ease.

```
import { DOMElement } from "./DOMElement.js";

const parent = new DOMElement(
  "div",
  {
    class: "parent",
  },
  [
    new DOMElement(
      "div",
      {
        class: "child",
      },
      ["Hello, world!"]
    ),
  ]
);

parent.mount("#app");

// Later, you can unmount the element using the unmount() method
parent.unmount();
```

## EventHandler Class

The EventHandler class is responsible for handling and managing event listeners in a application. It provides a simple way to attach, trigger, and remove event listeners.

### Features

Attach multiple event listeners to a specified event type
Trigger all event listeners for a specified event type
Remove an event listener from a specified event type

```
const eventHandler = new EventHandler();

// Attach an event listener
eventHandler.on('eventType', callback);

// Trigger all event listeners
eventHandler.trigger('eventType', eventData);

// Remove an event listener
eventHandler.off('eventType', callback);
```

Methods

on(eventType, callback)
Attaches an event listener to a specified event type.

eventType (string):

> The type of event to handle.
> callback (function):
> The event handler function.
> trigger(eventType, eventData)
> Triggers all event listeners attached to a specified event type.

eventType (string):

> The type of event to trigger.
> eventData (any):
> Data to pass to the event handlers.
> off(eventType, callback)
> Removes an event listener from a specified event type.

eventType (string):

> The type of event to remove the listener from.
> callback (function):
> The event handler function to remove.
> Example

Here is an example of using the EventHandler class to attach, trigger, and remove event listeners:

```
const eventHandler = new EventHandler();

// Attach an event listener
eventHandler.on('eventType', (data) => {
  console.log(`Event triggered with data: ${data}`);
});

// Trigger the event listener
eventHandler.trigger('eventType', 'Hello World');

// Remove the event listener
eventHandler.off('eventType', (data) => {
  console.log(`Event triggered with data: ${data}`);
});

// Trigger the event listener (should not log anything)
eventHandler.trigger('eventType', 'Hello World');
```

## Router Class

This class is responsible for managing the browser's route and navigation within a web application. It provides methods to add routes, navigate to specific routes, and handle page changes.

### Initialization

Upon instantiation, the router initializes by adding an event listener to the `popstate` event on the window object. This event is triggered when a user navigates to a different page on the same website using the browser's forward or back button. The router handles this by calling the `navigateTo` function with the current URL's hash.

### Properties

- **routes**: An object that stores all the application routes as key-value pairs. The keys are the path strings (e.g., "/", "/added", "/complited"), and the values are handler functions that are executed when the user navigates to the corresponding path.

- **currentRoute**: Represents the current route path the user is on. It initially is set to `null` and is updated to the respective path string once the user navigates to a specific route.

- **defaultRoute**: The default route that the user will be redirected to if the requested path is not found. It is set to "/" in this example.

### Methods

- **addRoute(path, handler)**: This method adds a route to the router's internal routes object. It maps a path string to a handler function.

- **navigateTo(path)**: This method navigates the user to a specific route by modifying the `window.location.hash` property. It then checks if the requested path exists in the routes object, and if so, it sets the `currentRoute` and executes the corresponding handler function. If the route does not exist, it logs an error message and navigates to the default route.

- **initialize()**: Initializes the router by attaching a `popstate` event listener to the window object.

### Usage

To use the router, you can create a new instance of it, add routes with `addRoute`, and navigate to specific routes with `navigateTo`. The router will handle any changes to the browser's URL and navigate accordingly.

## Public instance methods:

addRoute(path, handler) - Adds a new route to the router, mapping the path to the handler function. When a user navigates to this route, the handler function is executed.

navigateTo(path) - Navigates the user to the specified route identified by path. If the route does not exist, the router logs an error message and navigates to the default route.

initialize() - Initializes the router by attaching an event listener to the window object for the popstate event, which is triggered when the user navigates the web page using the browser's back and forward buttons.

### Usage Example:

```
import Router from './Router.js';

const router = new Router();

router.addRoute('/', () => {
  console.log('Home');
});

router.addRoute('/about', () => {
  console.log('About');
});

router.navigateTo('/about');
// Output: "About"
```

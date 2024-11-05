export class Router {
  constructor() {
    this.routes = {
      "/": () => {}, // if no matching route is found, the router should navigate to the root path. solving problem with navigateTo, which is infinite loop bc it's calling itself inside
      "/added": () => console.log("Added"),
      "/complited": () => console.log("Complited"),
    };
    this.currentRoute = null;
    this.defaultRoute = "/"; // Default route if no match found
    this.initialize();
  }

  // Add a route to the router
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  // Navigate to a specific route
  navigateTo(path) {
    path = path.replace("#", "");
    if (path === "") {
      path = "/";
    }
    const handler = this.routes[path];
    if (handler) {
      this.currentRoute = path;
      handler();
    } else {
      console.error(`Route not found: ${path}`);
      this.navigateTo(this.defaultRoute); // Navigate to default route
    }
  }

  // Initialize router
  initialize() {
    window.addEventListener("popstate", () => {
      this.navigateTo(window.location.hash);
    });
  }
}

export default Router;

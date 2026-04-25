// ===== Simple Hash Router =====
import eventBus from './eventBus.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  register(name, renderFn) {
    this.routes[name] = renderFn;
  }

  navigate(page) {
    window.location.hash = `#${page}`;
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (this.routes[hash]) {
      this.currentPage = hash;
      this.routes[hash]();
      eventBus.emit('route:changed', hash);
    }
  }

  getCurrentPage() {
    return this.currentPage || 'home';
  }

  init() {
    this.handleRoute();
  }
}

export const router = new Router();
export default router;

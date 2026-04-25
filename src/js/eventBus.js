// ===== Event Bus =====
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }

  once(event, callback) {
    const wrapped = (data) => {
      callback(data);
      this.off(event, wrapped);
    };
    this.on(event, wrapped);
  }
}

export const eventBus = new EventBus();
export default eventBus;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
class EventEmitter {
    constructor() {
        this.eventListeners = {};
    }
    on(event, listener) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(listener);
    }
    removeListener(event, listener) {
        const listeners = this.eventListeners[event];
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    emit(event, ...args) {
        const listeners = this.eventListeners[event];
        if (listeners) {
            listeners.forEach(listener => listener(...args));
        }
    }
}
exports.EventEmitter = EventEmitter;

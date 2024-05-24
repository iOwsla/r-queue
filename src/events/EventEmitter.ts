import { REventType } from "../types/REventType";

class EventEmitter {
    private eventListeners: { [event in REventType]?: Function[] } = {};

    on(event: REventType, listener: Function): void {
        
        if (!this.eventListeners[event]) {

            this.eventListeners[event] = [];

        }

        this.eventListeners[event]!.push(listener);
    }

    removeListener(event: REventType, listener: Function): void {
        const listeners = this.eventListeners[event];

        if (listeners) {

            const index = listeners.indexOf(listener);

            if (index !== -1) {

                listeners.splice(index, 1);

            }
        }
    }

    emit(event: REventType, ...args: any[]): void {
        const listeners = this.eventListeners[event];

        if (listeners) {

            listeners.forEach(listener => listener(...args));

        }
    }
}

export { EventEmitter };

import { REventType } from "../types/REventType";
declare class EventEmitter {
    private eventListeners;
    on(event: REventType, listener: Function): void;
    removeListener(event: REventType, listener: Function): void;
    emit(event: REventType, ...args: any[]): void;
}
export { EventEmitter };

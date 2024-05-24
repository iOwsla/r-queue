"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueue = void 0;
class TaskQueue {
    constructor() {
        this.queue = [];
    }
    enqueue(task) {
        this.queue.push(task);
        this.queue.sort((a, b) => b.priority - a.priority);
    }
    dequeue() {
        return this.queue.shift();
    }
    clear() {
        this.queue = [];
    }
    get length() {
        return this.queue.length;
    }
}
exports.TaskQueue = TaskQueue;

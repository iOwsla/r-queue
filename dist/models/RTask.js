"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
class Task {
    constructor(transaction, priority = 0, group) {
        this.transaction = transaction;
        this.priority = priority;
        this.group = group;
    }
}
exports.Task = Task;

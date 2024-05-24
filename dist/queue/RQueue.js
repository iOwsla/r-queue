"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RQueue = void 0;
const EventEmitter_1 = require("../events/EventEmitter");
const TaskQueue_1 = require("./TaskQueue");
const RateLimiter_1 = require("../rateLimiter/RateLimiter");
const Timeout_1 = require("../utils/Timeout");
const Logger_1 = require("../utils/Logger");
class RQueue extends EventEmitter_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.taskQueue = new TaskQueue_1.TaskQueue();
        this.isProcessing = false;
        this.isPaused = false;
        this.activeTasks = 0;
        this.delayMs = options.delayMs || 0;
        if (options.rateLimit) {
            this.rateLimiter = new RateLimiter_1.RateLimiter(options.rateLimit.count, options.rateLimit.duration);
        }
        this.timeoutMs = options.timeoutMs;
        this.logger = new Logger_1.Logger();
        if (options.autoStart !== false) {
            this.processQueue();
        }
    }
    enqueue(transaction_1) {
        return __awaiter(this, arguments, void 0, function* (transaction, priority = 0, group) {
            return new Promise((resolve, reject) => {
                const task = { transaction, resolve, reject, priority, group };
                this.taskQueue.enqueue(task);
                this.logger.log(`Task enqueued with priority ${priority} and group ${group}`);
                if (!this.isProcessing && !this.isPaused) {
                    this.processQueue();
                }
            });
        });
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isProcessing || this.isPaused)
                return;
            this.isProcessing = true;
            this.emit('start');
            while (this.taskQueue.length > 0 && !this.isPaused) {
                if (this.rateLimiter) {
                    yield this.rateLimiter.check();
                }
                const concurrentTransactions = [];
                while (this.taskQueue.length > 0 && concurrentTransactions.length < (this.options.concurrency || 1)) {
                    const task = this.taskQueue.dequeue();
                    if (task) {
                        concurrentTransactions.push(this.executeTask(task));
                    }
                }
                try {
                    const results = yield Promise.all(concurrentTransactions);
                    this.emit('success', results);
                }
                catch (error) {
                    this.emit('error', error);
                }
                if (this.delayMs > 0) {
                    yield new Promise(resolve => setTimeout(resolve, this.delayMs));
                }
                this.emit('progress', { remaining: this.taskQueue.length, active: this.activeTasks });
            }
            this.isProcessing = false;
            this.emit('end');
            if (this.taskQueue.length === 0)
                this.emit('drain');
        });
    }
    executeTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeTasks++;
            this.logger.log(`Executing task with priority ${task.priority} and group ${task.group}`);
            try {
                const result = yield (0, Timeout_1.withTimeout)(task.transaction, this.timeoutMs);
                task.resolve(result);
            }
            catch (error) {
                if (error instanceof Error) {
                    task.reject(error);
                    this.logger.error(`Task failed with error: ${error.message}`);
                }
                else {
                    task.reject(new Error('Unknown error'));
                    this.logger.error('Task failed with unknown error');
                }
            }
            finally {
                this.activeTasks--;
            }
        });
    }
    pause() {
        this.isPaused = true;
        this.emit('pause');
        this.logger.log("Queue paused");
    }
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.emit('resume');
            this.logger.log("Queue resumed");
            this.processQueue();
        }
    }
    clear() {
        this.taskQueue.clear();
        this.logger.log("Queue cleared");
    }
    start() {
        this.processQueue();
        this.logger.log("Queue started");
    }
    get length() {
        return this.taskQueue.length;
    }
    get processing() {
        return this.isProcessing;
    }
    get paused() {
        return this.isPaused;
    }
}
exports.RQueue = RQueue;

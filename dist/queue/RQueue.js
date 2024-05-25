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
            this.rateLimiter.on('limitReached', (waitTime) => this.emit('rateLimitReached', waitTime));
            this.rateLimiter.on('reset', () => this.emit('rateLimitReset'));
            this.rateLimiter.on('check', (processedCount) => this.emit('rateLimitCheck', processedCount));
        }
        this.timeoutMs = options.timeoutMs;
        this.autoStart = options.autoStart || false;
        if (this.autoStart)
            this.processQueue();
    }
    enqueue(transaction, priority = 0, group) {
        const task = { transaction, resolve: () => { }, reject: () => { }, priority, group };
        this.taskQueue.enqueue(task);
    }
    start() {
        if (!this.isProcessing && !this.isPaused) {
            this.processQueue();
        }
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isProcessing)
                return;
            this.isProcessing = true;
            this.emit('start');
            while (this.taskQueue.length > 0) {
                if (this.isPaused) {
                    this.isProcessing = false;
                    return;
                }
                const concurrentTransactions = [];
                while (this.taskQueue.length > 0 && concurrentTransactions.length < (this.options.concurrency || 1)) {
                    if (this.rateLimiter)
                        yield this.rateLimiter.check();
                    const task = this.taskQueue.dequeue();
                    if (task)
                        concurrentTransactions.push(this.executeTask(task));
                }
                yield Promise.all(concurrentTransactions);
                if (this.delayMs > 0) {
                    yield new Promise(resolve => setTimeout(resolve, this.delayMs));
                }
                this.emit('progress', { remaining: this.taskQueue.length, active: this.activeTasks });
            }
            this.isProcessing = false;
            if (this.taskQueue.length === 0) {
                this.emit('end');
                this.emit('drain');
            }
        });
    }
    executeTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeTasks++;
            try {
                const result = yield (0, Timeout_1.withTimeout)(task.transaction, this.timeoutMs);
                this.emit('success', result);
            }
            catch (error) {
                this.emit('error', error);
            }
            finally {
                this.activeTasks--;
            }
        });
    }
    pause() {
        if (!this.isPaused && this.isProcessing) {
            this.isPaused = true;
            this.emit('pause');
        }
    }
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.emit('resume');
            this.processQueue();
        }
    }
    clear() {
        this.taskQueue.clear();
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

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
const RQueue_1 = require("../queue/RQueue");
const queue = new RQueue_1.RQueue({
    concurrency: 2,
    delayMs: 1000,
    rateLimit: {
        count: 5,
        duration: 10000,
    },
    autoStart: false,
});
queue.on('start', () => console.log(`[${new Date().toISOString()}] Queue started`));
queue.on('end', () => console.log(`[${new Date().toISOString()}] Queue completed`));
queue.on('pause', () => console.log(`[${new Date().toISOString()}] Queue paused`));
queue.on('resume', () => console.log(`[${new Date().toISOString()}] Queue resumed`));
queue.on('drain', () => console.log(`[${new Date().toISOString()}] Queue drained`));
queue.on('success', (result) => {
    console.log(`[${new Date().toISOString()}] Task successful: ${result}`);
});
queue.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
});
queue.on('progress', (progress) => console.log(`[${new Date().toISOString()}] Progress:`, progress));
queue.on('rateLimitReached', (waitTime) => console.log(`[${new Date().toISOString()}] Rate limit reached. Waiting time: ${waitTime}ms`));
queue.on('rateLimitReset', () => console.log(`[${new Date().toISOString()}] Rate limit reset`));
queue.on('rateLimitCheck', (processedCount) => console.log(`[${new Date().toISOString()}] Number of processed tasks: ${processedCount}`));
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
function successTask(id, group) {
    return __awaiter(this, void 0, void 0, function* () {
        yield delay(2000);
        return `Task ${id} (${group}) completed`;
    });
}
function failureTask(group) {
    return __awaiter(this, void 0, void 0, function* () {
        yield delay(2000);
        throw new Error(`Task (${group}) failed`);
    });
}
// Enqueue tasks
queue.enqueue(() => successTask(1, 'JOHN GROUP'), 1, 'JOHN GROUP');
queue.enqueue(() => successTask(2, 'JOHN GROUP'), 2, 'JOHN GROUP');
queue.enqueue(() => successTask(3, 'DOE GROUP'), 3, 'DOE GROUP');
queue.enqueue(() => successTask(4, 'DOE GROUP'), 4, 'DOE GROUP');
queue.enqueue(() => failureTask('MICHEAL GROUP'), 5, 'MICHEAL GROUP');
queue.enqueue(() => successTask(5, 'MICHEAL GROUP'), 6, 'MICHEAL GROUP');
console.log(`[${new Date().toISOString()}] Queue starting`);
queue.start();
setTimeout(() => {
    console.log(`[${new Date().toISOString()}] Pausing queue`);
    queue.pause();
    console.log(`[${new Date().toISOString()}] Queue paused for 5 seconds`);
    setTimeout(() => {
        console.log(`[${new Date().toISOString()}] Resuming queue`);
        queue.resume();
    }, 5000);
}, 3000);

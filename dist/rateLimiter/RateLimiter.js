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
exports.RateLimiter = void 0;
const events_1 = require("events");
class RateLimiter extends events_1.EventEmitter {
    constructor(count, duration) {
        super();
        this.count = count;
        this.duration = duration;
        this.processedCount = 0;
        this.startTime = Date.now();
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTime = Date.now();
            const elapsedTime = currentTime - this.startTime;
            if (elapsedTime > this.duration) {
                this.processedCount = 0;
                this.startTime = currentTime;
                this.emit('reset');
            }
            if (this.processedCount >= this.count) {
                const waitTime = this.duration - elapsedTime;
                this.emit('limitReached', waitTime);
                yield new Promise(resolve => setTimeout(resolve, waitTime));
                this.processedCount = 0;
                this.startTime = Date.now();
                this.emit('reset');
            }
            this.processedCount++;
            this.emit('check', this.processedCount);
        });
    }
}
exports.RateLimiter = RateLimiter;

/// <reference types="node" />
import { EventEmitter } from 'events';
interface RateLimiterEvents {
    limitReached: (waitTime: number) => void;
    reset: () => void;
    check: (processedCount: number) => void;
}
declare class RateLimiter extends EventEmitter {
    private count;
    private duration;
    private processedCount;
    private startTime;
    constructor(count: number, duration: number);
    check(): Promise<void>;
}
export { RateLimiter, RateLimiterEvents };

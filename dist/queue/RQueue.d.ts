import { EventEmitter } from "../events/EventEmitter";
import { RQueueOptions } from "../types/RQueueOptions";
import { RCallback } from "../types/RCallback";
declare class RQueue extends EventEmitter {
    private options;
    private taskQueue;
    private isProcessing;
    private isPaused;
    private activeTasks;
    private rateLimiter?;
    private delayMs;
    private timeoutMs?;
    private autoStart;
    constructor(options?: RQueueOptions);
    enqueue<T>(transaction: RCallback<T>, priority?: number, group?: string): void;
    start(): void;
    private processQueue;
    private executeTask;
    pause(): void;
    resume(): void;
    clear(): void;
    get length(): number;
    get processing(): boolean;
    get paused(): boolean;
}
export { RQueue };

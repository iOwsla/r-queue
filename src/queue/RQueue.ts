import { EventEmitter } from "../events/EventEmitter";
import { TaskQueue } from "./TaskQueue";
import { RTask } from "../models/RTask";
import { RateLimiter } from "../rateLimiter/RateLimiter";
import { RQueueOptions } from "../types/RQueueOptions";
import { withTimeout } from "../utils/Timeout";
import { RCallback } from "../types/RCallback";

class RQueue extends EventEmitter {
    private taskQueue = new TaskQueue();
    private isProcessing = false;
    private isPaused = false;
    private activeTasks = 0;
    private rateLimiter?: RateLimiter;
    private delayMs: number;
    private timeoutMs?: number;
    private autoStart: boolean;

    constructor(private options: RQueueOptions = {}) {
        super();

        this.delayMs = options.delayMs || 0;

        if (options.rateLimit) {
            this.rateLimiter = new RateLimiter(options.rateLimit.count, options.rateLimit.duration);
            this.rateLimiter.on('limitReached', (waitTime: number) => this.emit('rateLimitReached', waitTime));
            this.rateLimiter.on('reset', () => this.emit('rateLimitReset'));
            this.rateLimiter.on('check', (processedCount: number) => this.emit('rateLimitCheck', processedCount));
        }

        this.timeoutMs = options.timeoutMs;
        this.autoStart = options.autoStart || false;

        if (this.autoStart) this.processQueue();
    }

    public enqueue<T>(transaction: RCallback<T>, priority: number = 0, group?: string): void {
        const task: RTask<T> = { transaction, resolve: () => { }, reject: () => { }, priority, group };
        this.taskQueue.enqueue(task);
    }

    public start(): void {
        if (!this.isProcessing && !this.isPaused) {
            this.processQueue();
        }
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.emit('start');

        while (this.taskQueue.length > 0) {
            if (this.isPaused) {
                this.isProcessing = false;
                return;
            }

            const concurrentTransactions: Promise<void>[] = [];

            while (this.taskQueue.length > 0 && concurrentTransactions.length < (this.options.concurrency || 1)) {
                if (this.rateLimiter) await this.rateLimiter.check();

                const task = this.taskQueue.dequeue();

                if (task) concurrentTransactions.push(this.executeTask(task));
            }

            await Promise.all(concurrentTransactions);

            if (this.delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, this.delayMs));
            }

            this.emit('progress', { remaining: this.taskQueue.length, active: this.activeTasks });
        }

        this.isProcessing = false;
        if (this.taskQueue.length === 0) {
            this.emit('end');
            this.emit('drain');
        }
    }

    private async executeTask<T>(task: RTask<T>): Promise<void> {
        this.activeTasks++;

        try {
            const result = await withTimeout(task.transaction, this.timeoutMs);
            this.emit('success', result);
        } catch (error) {
            this.emit('error', error);
        } finally {
            this.activeTasks--;
        }
    }

    public pause(): void {
        if (!this.isPaused && this.isProcessing) {
            this.isPaused = true;
            this.emit('pause');
        }
    }

    public resume(): void {
        if (this.isPaused) {
            this.isPaused = false;
            this.emit('resume');
            this.processQueue();
        }
    }

    public clear(): void {
        this.taskQueue.clear();
    }

    public get length(): number {
        return this.taskQueue.length;
    }

    public get processing(): boolean {
        return this.isProcessing;
    }

    public get paused(): boolean {
        return this.isPaused;
    }
}

export { RQueue };

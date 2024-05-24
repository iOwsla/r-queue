import { EventEmitter } from "../events/EventEmitter";
import { TaskQueue } from "./TaskQueue";
import { RTask } from "../models/RTask";
import { RateLimiter } from "../rateLimiter/RateLimiter";
import { RQueueOptions } from "../types/RQueueOptions";
import { withTimeout } from "../utils/Timeout";
import { Logger } from "../utils/Logger";
import { RCallback } from "../types/RCallback";

class RQueue extends EventEmitter {
    private taskQueue = new TaskQueue();
    private isProcessing = false;
    private isPaused = false;
    private activeTasks = 0;
    private rateLimiter?: RateLimiter;
    private delayMs: number;
    private timeoutMs?: number;
    private logger: Logger;

    constructor(private options: RQueueOptions = {}) {

        super();

        this.delayMs = options.delayMs || 0;

        if (options.rateLimit) {

            this.rateLimiter = new RateLimiter(options.rateLimit.count, options.rateLimit.duration);
        }

        this.timeoutMs = options.timeoutMs;

        this.logger = options.logger || new Logger();

        if (options.autoStart !== false) {

            this.processQueue();

        }

    }

    public async enqueue<T>(transaction: RCallback<T>, priority: number = 0, group?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            const task: RTask<T> = { transaction, resolve, reject, priority, group };

            this.taskQueue.enqueue(task);

            this.logger.log(`Task enqueued with priority ${priority} and group ${group}`);

            if (!this.isProcessing && !this.isPaused) {

                this.processQueue();
            }

        });
    }

    private async processQueue(): Promise<void> {

        if (this.isProcessing || this.isPaused) return;

        this.isProcessing = true;

        this.emit('start');

        while (this.taskQueue.length > 0 && !this.isPaused) {

            if (this.rateLimiter) {

                await this.rateLimiter.check();

            }

            const concurrentTransactions: Promise<any>[] = [];

            while (this.taskQueue.length > 0 && concurrentTransactions.length < (this.options.concurrency || 1)) {

                const task = this.taskQueue.dequeue();

                if (task) {

                    concurrentTransactions.push(this.executeTask(task));

                }
            }

            try {

                const results = await Promise.all(concurrentTransactions);

                this.emit('success', results);

            } catch (error) {

                this.emit('error', error);

            }

            if (this.delayMs > 0) {

                await new Promise(resolve => setTimeout(resolve, this.delayMs));

            }

            this.emit('progress', { remaining: this.taskQueue.length, active: this.activeTasks });
        }

        this.isProcessing = false;

        this.emit('end');

        if (this.taskQueue.length === 0) this.emit('drain');

    }

    private async executeTask<T>(task: RTask<T>): Promise<void> {
        this.activeTasks++;

        this.logger.log(`Executing task with priority ${task.priority} and group ${task.group}`);

        try {
            const result = await withTimeout(task.transaction, this.timeoutMs);

            task.resolve(result);
        } catch (error) {

            if (error instanceof Error) {

                task.reject(error);

                this.logger.error(`Task failed with error: ${error.message}`);

            } else {

                task.reject(new Error('Unknown error'));

                this.logger.error('Task failed with unknown error');

            }
        } finally {

            this.activeTasks--;

        }
    }

    public pause(): void {
        this.isPaused = true;

        this.emit('pause');

        this.logger.log("Queue paused");

    }

    public resume(): void {

        if (this.isPaused) {

            this.isPaused = false;

            this.emit('resume');

            this.logger.log("Queue resumed");

            this.processQueue();

        }

    }

    public clear(): void {

        this.taskQueue.clear();

        this.logger.log("Queue cleared");

    }

    public start(): void {

        this.processQueue();

        this.logger.log("Queue started");

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
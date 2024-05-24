export type REventType = "start" | "success" | "error" | "end" | "drain" | "pause" | "resume" | "progress";
export type RCallback<T> = () => Promise<T>;
export interface RQueueOptions {
    concurrency?: number;
    autoStart?: boolean;
    delayMs?: number;
    rateLimit?: {
        count: number;
        duration: number;
    };
    timeoutMs?: number;
}

export interface RTask<T> {
    transaction: RCallback<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
    priority: number;
    group?: string;
}
export class RQueue {
    constructor(options?: RQueueOptions);

    enqueue<T>(transaction: RCallback<T>, priority?: number, group?: string): Promise<T>;

    pause(): void;

    resume(): void;

    clear(): void;

    start(): void;

    readonly length: number;

    readonly processing: boolean;

    readonly paused: boolean;

    on(event: REventType, listener: Function): void;

    removeListener(event: REventType, listener: Function): void;
}
export function withTimeout<T>(transaction: RCallback<T>, timeoutMs?: number): Promise<T>;
export class Logger {
    log(message: string): void;

    error(message: string): void;
}
export class RateLimiter {
    constructor(count: number, duration: number);

    check(): Promise<void>;
}
export class EventEmitter {
    on(event: REventType, listener: Function): void;

    removeListener(event: REventType, listener: Function): void;

    emit(event: REventType, ...args: any[]): void;
}
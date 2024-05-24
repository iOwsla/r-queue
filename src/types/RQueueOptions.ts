interface RQueueOptions {
    concurrency?: number;
    autoStart?: boolean;
    delayMs?: number;
    rateLimit?: { count: number, duration: number };
    timeoutMs?: number;
}

export { RQueueOptions };

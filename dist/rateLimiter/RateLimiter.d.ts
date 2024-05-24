declare class RateLimiter {
    private count;
    private duration;
    private processedCount;
    private startTime;
    constructor(count: number, duration: number);
    check(): Promise<void>;
}
export { RateLimiter };

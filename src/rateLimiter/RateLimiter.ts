class RateLimiter {
    private processedCount = 0;
    private startTime = Date.now();

    constructor(private count: number, private duration: number) {}

    async check(): Promise<void> {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;

        if (elapsedTime > this.duration) {
            this.processedCount = 0;
            this.startTime = currentTime;
        }

        if (this.processedCount >= this.count) {
            const waitTime = this.duration - elapsedTime;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.processedCount = 0;
            this.startTime = Date.now();
        }

        this.processedCount++;
    }
}

export { RateLimiter };

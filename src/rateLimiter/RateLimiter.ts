import { EventEmitter } from 'events';

interface RateLimiterEvents {
    limitReached: (waitTime: number) => void;
    reset: () => void;
    check: (processedCount: number) => void;
}

class RateLimiter extends EventEmitter {
    private processedCount = 0;
    private startTime = Date.now();

    constructor(private count: number, private duration: number) {
        super();
    }

    async check(): Promise<void> {
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
            await new Promise(resolve => setTimeout(resolve, waitTime));

            this.processedCount = 0;
            this.startTime = Date.now();
            this.emit('reset');
        }

        this.processedCount++;
        this.emit('check', this.processedCount);
    }
}

export { RateLimiter, RateLimiterEvents };

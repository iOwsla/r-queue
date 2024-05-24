import { Logger } from "../utils/Logger";
interface RQueueOptions {
    concurrency?: number;
    autoStart?: boolean;
    delayMs?: number;
    rateLimit?: {
        count: number;
        duration: number;
    };
    timeoutMs?: number;
    logger?: Logger;
    isLogger?: boolean;
}
export { RQueueOptions };

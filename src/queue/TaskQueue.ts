import { RTask } from "../models/RTask";

class TaskQueue {
    private queue: RTask<any>[] = [];

    enqueue(task: RTask<any>): void {
        this.queue.push(task);
        this.queue.sort((a, b) => b.priority - a.priority);
    }

    dequeue(): RTask<any> | undefined {
        return this.queue.shift();
    }

    clear(): void {
        this.queue = [];
    }

    get length(): number {
        return this.queue.length;
    }
}

export { TaskQueue };

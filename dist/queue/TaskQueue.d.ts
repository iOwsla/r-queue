import { RTask } from "../models/RTask";
declare class TaskQueue {
    private queue;
    enqueue(task: RTask<any>): void;
    dequeue(): RTask<any> | undefined;
    clear(): void;
    get length(): number;
}
export { TaskQueue };

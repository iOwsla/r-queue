type RCallback<T> = () => Promise<T>;
interface RTask<T> {
    transaction: RCallback<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
    priority: number;
    group?: string;
}
declare class Task<T> {
    transaction: RCallback<T>;
    priority: number;
    group?: string | undefined;
    constructor(transaction: RCallback<T>, priority?: number, group?: string | undefined);
}
export { RTask, Task };

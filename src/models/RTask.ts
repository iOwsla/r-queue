type RCallback<T> = () => Promise<T>;

interface RTask<T> {
    transaction: RCallback<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
    priority: number;
    group?: string;
}

class Task<T> {
    constructor(
        public transaction: RCallback<T>,
        public priority: number = 0,
        public group?: string
    ) {}
}

export { RTask, Task };
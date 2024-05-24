# RQueue

RQueue is a powerful and flexible task queue library for Node.js and TypeScript. It supports features like task prioritization, task grouping, pausing and resuming, rate limiting, timeout management, error handling, logging, and progress tracking. Designed with Clean Code and SOLID principles in mind, RQueue helps you manage task execution efficiently and effectively.

## Features

- **Task Prioritization**: Assign priorities to tasks to control execution order.
- **Task Grouping**: Group similar tasks for better management.
- **Pause and Resume**: Pause and resume task processing as needed.
- **Rate Limiting**: Control the rate of task execution to avoid overloading resources.
- **Timeout Management**: Set timeouts for tasks to ensure timely completion.
- **Error Handling**: Comprehensive error management and retry mechanisms.
- **Logging**: Detailed logging for monitoring queue activities and task execution.
- **Progress Tracking**: Track the progress of task execution.
- **Extensible**: Easily extendable with additional features and integrations.

## Installation

```sh
npm install @owsla/r-queue
```

## Usage

### Basic Usage

First, create an instance of `RQueue` with the desired options. You can specify options like `concurrency`, `autoStart`, `delayMs`, `rateLimit`, and `timeoutMs`.

```typescript
import { RQueue } from '@owsla/r-queue';

// Create a queue with a concurrency of 2
const queue = new RQueue({ concurrency: 2 });

queue.on('success', (results) => {
  console.log('Tasks completed successfully:', results);
});

queue.on('error', (error) => {
  console.error('Error processing tasks:', error);
});

async function task1() {
  // Your async task logic
  return 'Task 1 completed';
}

async function task2() {
  // Your async task logic
  return 'Task 2 completed';
}

// Enqueue tasks
queue.enqueue(task1);
queue.enqueue(task2);
```

### Task Prioritization

You can assign priorities to tasks to control their execution order. Higher priority tasks will be executed first.

```typescript
queue.enqueue(() => {
  // High priority task
  return 'High priority task completed';
}, 10); // Priority 10

queue.enqueue(() => {
  // Normal priority task
  return 'Normal priority task completed';
}, 1); // Priority 1
```

### Task Grouping

Grouping similar tasks helps in managing them together. You can process or cancel tasks based on their group.

```typescript
queue.enqueue(() => {
  // Group A task
  return 'Group A task completed';
}, 1, 'groupA');

queue.enqueue(() => {
  // Group B task
  return 'Group B task completed';
}, 1, 'groupB');
```

### Pause and Resume

You can pause the queue processing and resume it later.

```typescript
queue.pause();

setTimeout(() => {
  queue.resume();
}, 5000); // Resume after 5 seconds
```

### Rate Limiting

Control the rate of task execution to avoid overloading resources. This is useful when interacting with rate-limited APIs.

```typescript
const rateLimitedQueue = new RQueue({
  concurrency: 2,
  rateLimit: { count: 5, duration: 1000 } // Max 5 tasks per second
});

rateLimitedQueue.enqueue(async () => {
  // Your async task logic
  return 'Rate limited task completed';
});
```

### Timeout Management

Set timeouts for tasks to ensure they complete within a specified duration. If a task exceeds the timeout, it will be rejected.

```typescript
const timeoutQueue = new RQueue({
  concurrency: 2,
  timeoutMs: 3000 // 3 seconds timeout for each task
});

timeoutQueue.enqueue(async () => {
  // Your async task logic
  await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulating long task
  return 'This will timeout';
});
```

### Error Handling

Comprehensive error management allows you to handle and retry tasks when errors occur.

```typescript
queue.on('error', (error) => {
  console.error('Error occurred:', error.message);
});

queue.enqueue(async () => {
  throw new Error('Simulated task error');
});
```

### Logging

RQueue includes a basic logger. You can extend or replace it as needed. Here's how you can use a custom logger:

```typescript
import { Logger } from '@owsla/r-queue';

class CustomLogger extends Logger {
  log(message: string): void {
    // Custom log logic
    console.log(`[CUSTOM LOG] ${message}`);
  }

  error(message: string): void {
    // Custom error log logic
    console.error(`[CUSTOM ERROR] ${message}`);
  }
}

const customLogger = new CustomLogger();
const queueWithCustomLogger = new RQueue({ logger: customLogger });

queueWithCustomLogger.enqueue(async () => {
  return 'Task with custom logging';
});
```

### Progress Tracking

Track the progress of tasks in the queue, including the number of remaining and active tasks.

```typescript
queue.on('progress', (progress) => {
  console.log(`Tasks remaining: ${progress.remaining}, Active tasks: ${progress.active}`);
});
```

## API

### RQueue

#### Constructor

```typescript
new RQueue(options?: RQueueOptions)
```

- `options`: `RQueueOptions` (optional)
  - `concurrency`: Number of tasks to run concurrently (default: 1)
  - `autoStart`: Automatically start processing the queue (default: true)
  - `delayMs`: Delay between task executions (default: 0)
  - `rateLimit`: Rate limit configuration `{ count: number, duration: number }`
  - `timeoutMs`: Timeout for each task in milliseconds

#### Methods

- `enqueue<T>(transaction: RCallback<T>, priority?: number, group?: string): Promise<T>`: Add a task to the queue.
- `pause(): void`: Pause the queue processing.
- `resume(): void`: Resume the queue processing.
- `clear(): void`: Clear all tasks in the queue.
- `start(): void`: Start processing the queue.

#### Properties

- `length: number`: Get the number of tasks in the queue.
- `processing: boolean`: Check if the queue is currently processing tasks.
- `paused: boolean`: Check if the queue is paused.

#### Events

- `'start'`: Emitted when processing starts.
- `'success'`: Emitted when tasks complete successfully.
- `'error'`: Emitted when an error occurs.
- `'end'`: Emitted when processing ends.
- `'drain'`: Emitted when the queue is empty.
- `'pause'`: Emitted when the queue is paused.
- `'resume'`: Emitted when the queue is resumed.
- `'progress'`: Emitted to track progress.

## License

MIT

## Contributing

Feel free to open issues or submit pull requests for new features, bug fixes, or improvements.

## Acknowledgements

Thanks to all the contributors who helped make RQueue a great project!
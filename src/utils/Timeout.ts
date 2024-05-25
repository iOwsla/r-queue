import { RCallback } from "../types/RCallback";

async function withTimeout<T>(transaction: RCallback<T>, timeoutMs?: number): Promise<T> {
    if (!timeoutMs) return transaction();

    return Promise.race([
        transaction(),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Task timed out')), timeoutMs)
        )
    ]);
}

export { withTimeout };
import { RCallback } from "../types/RCallback";
declare function withTimeout<T>(transaction: RCallback<T>, timeoutMs?: number): Promise<T>;
export { withTimeout };

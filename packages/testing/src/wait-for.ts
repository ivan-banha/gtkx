import type { WaitForOptions } from "./types.js";

const DEFAULT_TIMEOUT = 1000;
const DEFAULT_INTERVAL = 50;

export const waitFor = async <T>(callback: () => T, options?: WaitForOptions): Promise<T> => {
    const { timeout = DEFAULT_TIMEOUT, interval = DEFAULT_INTERVAL } = options ?? {};
    const startTime = Date.now();
    let lastError: Error | null = null;

    while (Date.now() - startTime < timeout) {
        try {
            return callback();
        } catch (error) {
            lastError = error as Error;
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
    }

    throw new Error(`Timed out after ${timeout}ms. Last error: ${lastError?.message}`);
};

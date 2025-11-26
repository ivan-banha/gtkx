import { start as nativeStart, stop as nativeStop } from "@gtkx/native";
import type { ApplicationFlags } from "./generated/gio/enums.js";

let keepAliveTimeout: NodeJS.Timeout | null = null;

const keepAlive = (): void => {
    keepAliveTimeout = setTimeout(() => keepAlive(), 2147483647);
};

/**
 * Starts the GTK application with the given application ID.
 * Sets up a keep-alive timer to prevent Node.js from exiting.
 * @param appId - The application ID (e.g., "com.example.myapp")
 * @param flags - Optional GIO application flags
 * @returns The GTK Application instance pointer
 */
export const start = (appId: string, flags?: ApplicationFlags): unknown => {
    const app = nativeStart(appId, flags);
    keepAlive();
    return app;
};

/**
 * Stops the GTK application and cleans up the keep-alive timer.
 */
export const stop = (): void => {
    if (keepAliveTimeout) {
        clearTimeout(keepAliveTimeout);
        keepAliveTimeout = null;
    }

    nativeStop();
};

import { EventEmitter } from "node:events";
import { start as nativeStart, stop as nativeStop } from "@gtkx/native";
import type { ApplicationFlags } from "./generated/gio/enums.js";

let keepAliveTimeout: NodeJS.Timeout | null = null;

const keepAlive = (): void => {
    keepAliveTimeout = setTimeout(() => keepAlive(), 2147483647);
};

const events = new EventEmitter();
let isReady = false;

type ReadyCallback = () => void;

/**
 * Register a callback to be called when GTK is initialized.
 * If GTK is already ready, the callback is called immediately.
 */
export const onReady = (callback: ReadyCallback): void => {
    if (isReady) {
        callback();
    } else {
        events.once("ready", callback);
    }
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
    isReady = true;
    events.emit("ready");
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

import { EventEmitter } from "node:events";
import { getObjectAddr, start as nativeStart, stop as nativeStop } from "@gtkx/native";
import type { ApplicationFlags } from "./generated/gio/enums.js";
import { typeFromName, typeName, typeNameFromInstance, typeParent } from "./generated/gobject/functions.js";
import type { Application } from "./generated/gtk/application.js";
import { getClassByTypeName, type NativeObject } from "./registry.js";

type NativeEventMap = {
    start: [];
    stop: [];
};

let currentApp: Application | null = null;
let keepAliveTimeout: NodeJS.Timeout | null = null;

/**
 * Event emitter for GTK lifecycle events.
 * Emits "start" when GTK is initialized and "stop" before shutdown.
 */
export const events = new EventEmitter<NativeEventMap>();

/**
 * Finds the nearest registered class by walking up the type hierarchy.
 * @param glibTypeName - The GLib type name to start from
 * @returns The registered class, or undefined if none found
 */
const findRegisteredClass = (glibTypeName: string) => {
    let currentTypeName: string | null = glibTypeName;

    while (currentTypeName) {
        const cls = getClassByTypeName(currentTypeName);
        if (cls) return cls;

        const gtype = typeFromName(currentTypeName);
        if (gtype === 0) break;

        const parentGtype = typeParent(gtype);
        if (parentGtype === 0) break;

        currentTypeName = typeName(parentGtype);
    }

    return undefined;
};

/**
 * Wraps a native pointer in a class instance without calling the constructor.
 * Uses GLib's type system to determine the actual runtime type and wraps
 * with the correct class prototype. If the exact type is not registered,
 * walks up the type hierarchy to find the nearest registered parent class.
 * @param id - The native pointer to wrap
 * @returns A new instance with the pointer attached
 * @throws Error if no registered class is found in the type hierarchy
 */
export function getObject<T extends NativeObject = NativeObject>(id: unknown): T {
    const runtimeTypeName = typeNameFromInstance(getObjectAddr(id));
    const cls = findRegisteredClass(runtimeTypeName);
    if (!cls) {
        throw new Error(`Unknown GLib type: ${runtimeTypeName}. Make sure the class is registered.`);
    }
    const instance = Object.create(cls.prototype) as T;
    instance.id = id;
    return instance;
}

/**
 * Casts a native object to a different type without runtime validation.
 * Use this when you know the object implements an interface (like Editable or Accessible)
 * but TypeScript doesn't have that information statically.
 * @param obj - The object to cast
 * @returns The same object typed as T
 */
export const cast = <T extends NativeObject>(obj: NativeObject): T => obj as T;

const keepAlive = (): void => {
    keepAliveTimeout = setTimeout(() => keepAlive(), 2147483647);
};

/**
 * Starts the GTK application with the given application ID.
 * Sets up a keep-alive timer to prevent Node.js from exiting.
 * This function is idempotent - calling it multiple times returns the existing app.
 * @param appId - The application ID (e.g., "com.example.myapp")
 * @param flags - Optional GIO application flags
 * @returns The GTK Application instance
 */
export const start = (appId: string, flags?: ApplicationFlags): Application => {
    if (currentApp) {
        return currentApp;
    }

    const app = nativeStart(appId, flags);
    currentApp = getObject<Application>(app);
    events.emit("start");

    keepAlive();

    return currentApp;
};

/**
 * Gets the current GTK application instance.
 * @returns The GTK Application instance
 * @throws Error if GTK has not been started yet
 */
export const getCurrentApp = (): Application => {
    if (!currentApp) {
        throw new Error("GTK application not initialized. Call start() first.");
    }
    return currentApp;
};

/**
 * Stops the GTK application and cleans up the keep-alive timer.
 * Emits the "stop" event before shutting down to allow cleanup.
 * This function is idempotent - calling it when not started does nothing.
 */
export const stop = (): void => {
    if (!currentApp) {
        return;
    }

    if (keepAliveTimeout) {
        clearTimeout(keepAliveTimeout);
        keepAliveTimeout = null;
    }

    events.emit("stop");
    nativeStop();
    currentApp = null;
};

export { createRef, getObjectAddr } from "@gtkx/native";
export { type NativeObject, registerClass } from "./registry.js";

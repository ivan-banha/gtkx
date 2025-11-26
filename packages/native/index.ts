import { createRequire } from "node:module";
import { Arg, Ref, Type } from "./types.js";

const require = createRequire(import.meta.url);
const native = require("./index.node");

/**
 * Creates a reference wrapper for out/inout parameters in FFI calls.
 * @param value - The initial value to wrap
 * @returns A reference object whose value property can be mutated by native calls
 */
export const createRef = <T>(value: T): Ref<T> => {
    return { value };
};

/**
 * Calls a native GTK function via FFI.
 * @param library - The shared library name (e.g., "libgtk-4.so.1")
 * @param symbol - The C function symbol name to call
 * @param args - Array of argument descriptors with types and values
 * @param returnType - Type descriptor for the return value
 * @returns The return value from the native function
 */
export const call = native.call as (library: string, symbol: string, args: Arg[], returnType: Type) => unknown;

/**
 * Starts the GTK application main loop.
 * @param appId - The application ID (e.g., "com.example.myapp")
 * @param flags - Optional GIO application flags
 * @returns The GTK Application instance pointer
 */
export const start = native.start as (appId: string, flags?: number) => unknown;

/**
 * Stops the GTK application and exits the main loop.
 */
export const stop = native.stop as () => void;

export { Ref, Arg, Type };

import { read } from "@gtkx/native";

/**
 * Error class that wraps a GLib GError.
 * Extends the native JavaScript Error with GError-specific properties.
 */
export class NativeError extends Error {
    /** The raw GError pointer */
    readonly ptr: unknown;

    /** The GLib error domain (GQuark) */
    readonly domain: number;

    /** The error code within the domain */
    readonly code: number;

    /**
     * Creates a NativeError from a GError pointer.
     * @param ptr - The GError pointer from a failed FFI call
     */
    constructor(ptr: unknown) {
        const message = read(ptr, { type: "string" }, 8) as string;
        super(message ?? "Unknown error");

        this.ptr = ptr;
        this.domain = read(ptr, { type: "int", size: 32, unsigned: true }, 0) as number;
        this.code = read(ptr, { type: "int", size: 32, unsigned: false }, 4) as number;

        this.name = "NativeError";

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NativeError);
        }
    }
}

/**
 * Cairo drawing bindings for use with GtkDrawingArea.
 *
 * Example usage:
 * ```typescript
 * import * as cairo from "@gtkx/ffi/cairo";
 *
 * // In a draw callback:
 * cairo.setSourceRgba(cr, 0.2, 0.4, 0.8, 1.0);
 * cairo.arc(cr, width / 2, height / 2, 50, 0, 2 * Math.PI);
 * cairo.fill(cr);
 * ```
 */

export * from "../generated/cairo/index.js";
export * from "./cairo.js";

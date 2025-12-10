/**
 * Base interface for all native GLib/GTK objects.
 * All generated classes implement this interface.
 */
export interface NativeObject {
    /** The native pointer/handle to the underlying GLib object */
    id: unknown;
}

type GObjectClass = { glibTypeName: string; prototype: NativeObject };

const classRegistry = new Map<string, GObjectClass>();

/**
 * Registers a class in the global GObject type registry.
 * Called by generated code at module load time.
 * @param cls - The class to register
 */
export function registerType(cls: GObjectClass): void {
    classRegistry.set(cls.glibTypeName, cls);
}

/**
 * Looks up a class by its GLib type name.
 * @param glibTypeName - The GLib type name (e.g., "GtkButton")
 * @returns The class constructor, or undefined if not found
 */
export function getClassByTypeName(glibTypeName: string): GObjectClass | undefined {
    return classRegistry.get(glibTypeName);
}

import type * as gtk from "@gtkx/ffi/gtk";
import type { Props } from "../factory.js";
import type { Node } from "../node.js";

const DIALOG_TYPES = ["FileDialog", "ColorDialog", "FontDialog", "AlertDialog"];

/**
 * Node implementation for GTK dialog widgets.
 * Handles non-widget dialogs like FileDialog, ColorDialog, etc.
 */
export class DialogNode implements Node {
    /** Whether this node class requires a GTK widget to be created. */
    static needsWidget = true;

    /**
     * Checks if this node class handles the given element type.
     * @param type - The element type to check
     * @returns True if this is a dialog type
     */
    static matches(type: string): boolean {
        return DIALOG_TYPES.includes(type);
    }

    private dialogType: string;
    private dialog: gtk.Widget;
    private initialProps: Props;

    /**
     * Creates a new dialog node.
     * @param dialogType - The dialog type (e.g., "FileDialog")
     * @param dialog - The GTK dialog instance
     * @param initialProps - Initial props including dialog mode
     */
    constructor(dialogType: string, dialog: gtk.Widget, initialProps: Props) {
        this.dialogType = dialogType;
        this.dialog = dialog;
        this.initialProps = initialProps;
    }

    appendChild(_child: Node): void {}

    removeChild(_child: Node): void {}

    insertBefore(_child: Node, _before: Node): void {}

    updateProps(oldProps: Props, newProps: Props): void {
        const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

        for (const key of allKeys) {
            if (key === "children" || key === "mode" || key === "parent") continue;

            const oldValue = oldProps[key];
            const newValue = newProps[key];

            if (oldValue === newValue) continue;
            if (key.startsWith("on") && typeof newValue === "function") continue;

            const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            if (typeof this.dialog[setterName as keyof gtk.Widget] === "function") {
                (this.dialog[setterName as keyof gtk.Widget] as (value: unknown) => void)(newValue);
            }
        }
    }

    mount(): void {
        const mode = this.initialProps.mode as string | undefined;
        const parentWindow = undefined;

        if (this.dialogType !== "FileDialog") return;

        const methodName =
            mode === "save"
                ? "save"
                : mode === "selectFolder"
                  ? "selectFolder"
                  : mode === "openMultiple"
                    ? "openMultiple"
                    : "open";

        if (methodName in this.dialog && typeof this.dialog[methodName as keyof gtk.Widget] === "function") {
            (this.dialog[methodName as keyof gtk.Widget] as (p: unknown, n1: null, n2: null, n3: null) => void)(
                parentWindow,
                null,
                null,
                null,
            );
        }
    }

    attachToParent(_parent: Node): void {}

    detachFromParent(_parent: Node): void {}
}

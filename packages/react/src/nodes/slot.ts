import type * as Gtk from "@gtkx/ffi/gtk";
import { Node } from "../node.js";

export class SlotNode extends Node<never> {
    static matches(type: string): boolean {
        if (!type.includes(".")) return false;
        const parts = type.split(".");
        if (parts.length !== 2) return false;
        const suffix = parts[1];
        return suffix !== "Root";
    }

    protected override isVirtual(): boolean {
        return true;
    }

    private child: Node | null = null;
    private slotName: string;

    constructor(type: string) {
        super(type);

        const dotIndex = type.indexOf(".");

        if (dotIndex === -1) {
            throw new Error(`Invalid slot type: ${type}`);
        }

        this.slotName = type.substring(dotIndex + 1);
    }

    private updateParentSlot(): void {
        if (!this.parent) return;

        const parentWidget = this.parent.getWidget();
        const childWidget = this.child?.getWidget();

        if (!parentWidget) return;

        const setterName = `set${this.slotName}`;
        const setter = parentWidget[setterName as keyof Gtk.Widget];

        if (typeof setter === "function") {
            (setter as (id: unknown) => void).call(parentWidget, childWidget?.id ?? null);
        }
    }

    override appendChild(child: Node): void {
        child.parent = this;
        if (child.getWidget()) {
            this.child = child;
            this.updateParentSlot();
        }
    }

    override removeChild(child: Node): void {
        child.unmount();
        this.child = null;
        this.updateParentSlot();
        child.parent = null;
    }

    override mount(): void {
        this.updateParentSlot();
    }

    override unmount(): void {
        if (this.parent) {
            const parentWidget = this.parent.getWidget();

            if (parentWidget) {
                const setterName = `set${this.slotName}`;
                const setter = parentWidget[setterName as keyof Gtk.Widget];

                if (typeof setter === "function") {
                    (setter as (ptr: null) => void).call(parentWidget, null);
                }
            }
        }

        super.unmount();
    }
}

import type * as Gtk from "@gtkx/ffi/gtk";
import type { PackContainer } from "../container-interfaces.js";
import { Node } from "../node.js";

export class ActionBarNode extends Node<Gtk.ActionBar> implements PackContainer {
    static matches(type: string): boolean {
        return type === "ActionBar" || type === "ActionBar.Root";
    }

    packStart(child: Gtk.Widget): void {
        this.widget.packStart(child);
    }

    packEnd(child: Gtk.Widget): void {
        this.widget.packEnd(child);
    }

    removeFromPack(child: Gtk.Widget): void {
        this.widget.remove(child);
    }

    appendChild(child: Node): void {
        const childWidget = child.getWidget();

        if (!childWidget) {
            child.attachToParent(this);
            return;
        }

        this.packStart(childWidget);
    }

    removeChild(child: Node): void {
        const childWidget = child.getWidget();

        if (childWidget) {
            this.removeFromPack(childWidget);
        }
    }
}

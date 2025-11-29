import type * as Gtk from "@gtkx/ffi/gtk";
import { Node } from "../node.js";

export class OverlayNode extends Node<Gtk.Overlay> {
    static matches(type: string): boolean {
        return type === "Overlay" || type === "Overlay.Root";
    }

    private mainChild: Gtk.Widget | null = null;
    private overlayChildren: Gtk.Widget[] = [];

    attachChild(childWidget: Gtk.Widget): void {
        if (this.mainChild === null) {
            this.mainChild = childWidget;
            this.widget.setChild(childWidget);
        } else {
            this.overlayChildren.push(childWidget);
            this.widget.addOverlay(childWidget);
        }
    }

    detachChild(childWidget: Gtk.Widget): void {
        if (this.mainChild === childWidget) {
            this.widget.setChild(null);
            this.mainChild = null;
        } else {
            const index = this.overlayChildren.indexOf(childWidget);

            if (index !== -1) {
                this.overlayChildren.splice(index, 1);
                this.widget.removeOverlay(childWidget);
            }
        }
    }
}

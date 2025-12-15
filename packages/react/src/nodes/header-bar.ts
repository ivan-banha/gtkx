import type * as Adw from "@gtkx/ffi/adw";
import type * as Gtk from "@gtkx/ffi/gtk";
import { isPackContainer, type PackContainer } from "../container-interfaces.js";
import { Node } from "../node.js";

/**
 * Node for AdwHeaderBar that uses packStart for non-slot children.
 */
export class AdwHeaderBarNode extends Node<Adw.HeaderBar> implements PackContainer {
    static matches(type: string): boolean {
        return type === "AdwHeaderBar" || type === "AdwHeaderBar.Root";
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

/**
 * Node for Gtk.HeaderBar that uses packStart for children.
 */
export class HeaderBarNode extends Node<Gtk.HeaderBar> implements PackContainer {
    static matches(type: string): boolean {
        return type === "HeaderBar" || type === "HeaderBar.Root";
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

/**
 * Virtual node for packing children at the start of a PackContainer.
 */
export class PackStartNode extends Node<never> {
    static matches(type: string): boolean {
        return type === "HeaderBar.Start" || type === "AdwHeaderBar.Start" || type === "ActionBar.Start";
    }

    protected override isVirtual(): boolean {
        return true;
    }

    private childWidget: Gtk.Widget | null = null;
    private parentContainer: (Node & PackContainer) | null = null;

    override appendChild(child: Node): void {
        const widget = child.getWidget();

        if (widget) {
            this.childWidget = widget;

            if (this.parentContainer) {
                this.parentContainer.packStart(widget);
            }
        }
    }

    override removeChild(child: Node): void {
        const widget = child.getWidget();

        if (widget && this.childWidget === widget) {
            if (this.parentContainer) {
                this.parentContainer.removeFromPack(widget);
            }

            this.childWidget = null;
        }
    }

    override attachToParent(parent: Node): void {
        if (isPackContainer(parent)) {
            this.parentContainer = parent;

            if (this.childWidget) {
                this.parentContainer.packStart(this.childWidget);
            }
        }
    }

    override detachFromParent(parent: Node): void {
        if (isPackContainer(parent) && this.childWidget) {
            parent.removeFromPack(this.childWidget);
            this.parentContainer = null;
        }
    }
}

/**
 * Virtual node for packing children at the end of a PackContainer.
 */
export class PackEndNode extends Node<never> {
    static matches(type: string): boolean {
        return type === "HeaderBar.End" || type === "AdwHeaderBar.End" || type === "ActionBar.End";
    }

    protected override isVirtual(): boolean {
        return true;
    }

    private childWidget: Gtk.Widget | null = null;
    private parentContainer: (Node & PackContainer) | null = null;

    override appendChild(child: Node): void {
        const widget = child.getWidget();

        if (widget) {
            this.childWidget = widget;

            if (this.parentContainer) {
                this.parentContainer.packEnd(widget);
            }
        }
    }

    override removeChild(child: Node): void {
        const widget = child.getWidget();

        if (widget && this.childWidget === widget) {
            if (this.parentContainer) {
                this.parentContainer.removeFromPack(widget);
            }

            this.childWidget = null;
        }
    }

    override attachToParent(parent: Node): void {
        if (isPackContainer(parent)) {
            this.parentContainer = parent;

            if (this.childWidget) {
                this.parentContainer.packEnd(this.childWidget);
            }
        }
    }

    override detachFromParent(parent: Node): void {
        if (isPackContainer(parent) && this.childWidget) {
            parent.removeFromPack(this.childWidget);
            this.parentContainer = null;
        }
    }
}

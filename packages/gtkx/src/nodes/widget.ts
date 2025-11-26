import type * as gtk from "@gtkx/ffi/gtk";
import { call } from "@gtkx/native";
import type { Props } from "../factory.js";
import type { Node } from "../node.js";

type CombinedPropHandler = {
    props: string[];
    apply: (widget: gtk.Widget, values: Record<string, unknown>) => void;
};

const COMBINED_PROPS: CombinedPropHandler[] = [
    {
        props: ["defaultWidth", "defaultHeight"],
        apply: (widget, values) => {
            if ("setDefaultSize" in widget && typeof widget.setDefaultSize === "function") {
                const width = (values.defaultWidth as number) ?? -1;
                const height = (values.defaultHeight as number) ?? -1;
                (widget.setDefaultSize as (w: number, h: number) => void)(width, height);
            }
        },
    },
];

const appendChild = (parent: gtk.Widget, child: gtk.Widget): void => {
    const childPtr = child.ptr;

    if ("setChild" in parent && typeof parent.setChild === "function") {
        (parent.setChild as (ptr: unknown) => void)(childPtr);
    } else if ("append" in parent && typeof parent.append === "function") {
        (parent.append as (ptr: unknown) => void)(childPtr);
    } else if ("add" in parent && typeof parent.add === "function") {
        (parent.add as (ptr: unknown) => void)(childPtr);
    }
};

const removeChild = (parent: gtk.Widget, child: gtk.Widget): void => {
    const childPtr = child.ptr;

    if ("remove" in parent && typeof parent.remove === "function") {
        (parent.remove as (ptr: unknown) => void)(childPtr);
    } else if ("setChild" in parent && typeof parent.setChild === "function") {
        (parent.setChild as (ptr: null) => void)(null);
    }
};

/**
 * Node implementation for standard GTK widgets.
 * Handles property updates, signal connections, and parent-child relationships.
 */
export class WidgetNode implements Node {
    /** Whether this node class requires a GTK widget to be created. */
    static needsWidget = true;

    /**
     * Checks if this node class handles the given element type.
     * WidgetNode is the fallback handler that matches all types.
     */
    static matches(): boolean {
        return true;
    }

    private widget: gtk.Widget;
    private signalHandlers = new Map<string, number>();

    /**
     * Creates a new widget node.
     * @param _type - The element type (unused)
     * @param widget - The GTK widget instance
     * @param _props - Initial props (unused, applied via updateProps)
     */
    constructor(_type: string, widget: gtk.Widget, _props: Props) {
        this.widget = widget;
    }

    /**
     * Gets the underlying GTK widget.
     * @returns The GTK widget instance
     */
    getWidget(): gtk.Widget {
        return this.widget;
    }

    appendChild(child: Node): void {
        child.attachToParent(this);
    }

    removeChild(child: Node): void {
        child.detachFromParent(this);
    }

    insertBefore(child: Node, _before: Node): void {
        this.appendChild(child);
    }

    attachToParent(parent: Node): void {
        if (parent instanceof WidgetNode) {
            appendChild(parent.widget, this.widget);
        }
    }

    detachFromParent(parent: Node): void {
        if (parent instanceof WidgetNode) {
            removeChild(parent.widget, this.widget);
        }
    }

    updateProps(oldProps: Props, newProps: Props): void {
        const consumedProps = new Set(["children", "application"]);

        for (const handler of COMBINED_PROPS) {
            const hasAnyChanged = handler.props.some((prop) => oldProps[prop] !== newProps[prop]);
            if (hasAnyChanged) {
                const values: Record<string, unknown> = {};
                for (const prop of handler.props) {
                    values[prop] = newProps[prop];
                    consumedProps.add(prop);
                }
                handler.apply(this.widget, values);
            } else {
                for (const prop of handler.props) {
                    consumedProps.add(prop);
                }
            }
        }

        const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

        for (const key of allKeys) {
            if (consumedProps.has(key)) continue;

            const oldValue = oldProps[key];
            const newValue = newProps[key];

            if (oldValue === newValue) continue;

            if (key.startsWith("on")) {
                const eventName = key
                    .slice(2)
                    .replace(/([A-Z])/g, "-$1")
                    .toLowerCase()
                    .replace(/^-/, "");

                const oldHandlerId = this.signalHandlers.get(eventName);
                if (oldHandlerId !== undefined) {
                    call(
                        "libgobject-2.0.so.0",
                        "g_signal_handler_disconnect",
                        [
                            { type: { type: "gobject" }, value: this.widget.ptr },
                            { type: { type: "int", size: 64, unsigned: true }, value: oldHandlerId },
                        ],
                        { type: "undefined" },
                    );
                    this.signalHandlers.delete(eventName);
                }

                if (typeof newValue === "function" && typeof this.widget.connect === "function") {
                    const handlerId = this.widget.connect(eventName, newValue as (...args: unknown[]) => void);
                    this.signalHandlers.set(eventName, handlerId);
                }
                continue;
            }

            const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            const setter = this.widget[setterName as keyof typeof this.widget];
            if (typeof setter === "function") {
                (setter as (value: unknown) => void).call(this.widget, newValue);
            }
        }
    }

    mount(): void {
        if ("present" in this.widget && typeof this.widget.present === "function") {
            this.widget.present();
        }
    }
}

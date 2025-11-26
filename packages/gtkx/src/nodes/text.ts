import * as gtk from "@gtkx/ffi/gtk";
import type { Props } from "../factory.js";
import type { Node } from "../node.js";
import { WidgetNode } from "./widget.js";

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

export class TextNode implements Node {
    private label: gtk.Label;

    constructor(text: string) {
        this.label = new gtk.Label(text);
    }

    getWidget(): gtk.Label {
        return this.label;
    }

    updateText(text: string): void {
        this.label.setLabel(text);
    }

    appendChild(_child: Node): void {}

    removeChild(_child: Node): void {}

    insertBefore(_child: Node, _before: Node): void {}

    updateProps(_oldProps: Props, _newProps: Props): void {}

    mount(): void {}

    attachToParent(parent: Node): void {
        if (parent instanceof WidgetNode) {
            appendChild(parent.getWidget(), this.label);
        }
    }

    detachFromParent(parent: Node): void {
        if (parent instanceof WidgetNode) {
            removeChild(parent.getWidget(), this.label);
        }
    }
}

import type * as Gtk from "@gtkx/ffi/gtk";
import type { Props } from "../factory.js";
import { Node } from "../node.js";

export class TextViewNode extends Node<Gtk.TextView> {
    static override matches(type: string): boolean {
        return type === "TextView";
    }

    protected override consumedProps(): Set<string> {
        const consumed = super.consumedProps();
        consumed.add("buffer");
        return consumed;
    }

    override updateProps(oldProps: Props, newProps: Props): void {
        if (oldProps.buffer !== newProps.buffer) {
            const buffer = newProps.buffer as Gtk.TextBuffer | undefined;
            if (buffer) {
                this.widget.setBuffer(buffer);
            }
        }

        super.updateProps(oldProps, newProps);
    }
}

import type * as Gtk from "@gtkx/ffi/gtk";
import { StringListContainerNode } from "./string-list-container.js";
import { StringListItemNode } from "./string-list-item.js";

export class DropDownNode extends StringListContainerNode<Gtk.DropDown> {
    static matches(type: string): boolean {
        return type === "DropDown.Root";
    }
}

export class DropDownItemNode extends StringListItemNode {
    static matches(type: string): boolean {
        return type === "DropDown.Item" || type === "AdwComboRow.Item";
    }
}

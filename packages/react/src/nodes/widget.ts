import type * as Gtk from "@gtkx/ffi/gtk";
import { Node } from "../node.js";

/**
 * Catch-all node for standard GTK widgets that don't need special handling.
 * Specialized widgets (Window, AboutDialog, ActionBar, FlowBox, ListBox, etc.)
 * are handled by their own dedicated Node classes.
 */
export class WidgetNode extends Node<Gtk.Widget> {
    static matches(_type: string): boolean {
        return true;
    }
}

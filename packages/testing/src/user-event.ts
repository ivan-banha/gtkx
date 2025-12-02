import type * as Gtk from "@gtkx/ffi/gtk";
import { call } from "@gtkx/native";

type WidgetWithSetText = { setText: (text: string) => void };
type WidgetWithGetText = { getText: () => string };
type WidgetWithPtr = { ptr: unknown };

const hasSetText = (widget: unknown): widget is WidgetWithSetText =>
    typeof (widget as WidgetWithSetText).setText === "function";

const hasGetText = (widget: unknown): widget is WidgetWithGetText =>
    typeof (widget as WidgetWithGetText).getText === "function";

const hasPtr = (widget: unknown): widget is WidgetWithPtr => (widget as WidgetWithPtr).ptr !== undefined;

const emitSignal = (widget: Gtk.Widget, signalName: string): void => {
    if (!hasPtr(widget)) {
        throw new Error("Widget does not have a ptr property");
    }

    call(
        "libgobject-2.0.so.0",
        "g_signal_emit_by_name",
        [
            { type: { type: "gobject" }, value: widget.ptr },
            { type: { type: "string" }, value: signalName },
        ],
        { type: "undefined" },
    );
};

export const userEvent = {
    click: async (element: Gtk.Widget): Promise<void> => {
        emitSignal(element, "clicked");
    },

    type: async (element: Gtk.Widget, text: string): Promise<void> => {
        if (!hasSetText(element)) {
            throw new Error("Cannot type into element: no setText method available");
        }

        const currentText = hasGetText(element) ? element.getText() : "";
        element.setText(currentText + text);
    },
};

import type * as Gtk from "@gtkx/ffi/gtk";
import type { Arg } from "@gtkx/native";
import { call } from "@gtkx/native";
import type React from "react";
import type Reconciler from "react-reconciler";
import { ROOT_NODE_CONTAINER } from "../src/index.js";
import { reconciler } from "../src/reconciler.js";

let container: Reconciler.FiberRoot | null = null;

export const render = async (element: React.ReactNode): Promise<void> => {
    const instance = reconciler.getInstance();

    if (!container) {
        container = instance.createContainer(
            ROOT_NODE_CONTAINER,
            0,
            null,
            false,
            null,
            "",
            () => {},
            () => {},
            () => {},
            () => {},
            null,
        );
    }

    instance.updateContainer(element, container, null, () => {});
    await tick();
};

export const cleanup = async (): Promise<void> => {
    if (container) {
        const instance = reconciler.getInstance();
        instance.updateContainer(null, container, null, () => {});
        container = null;
    }

    await tick();
};

export const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

export const fireEvent = async (element: Gtk.Widget, signalName: string, ...args: Arg[]): Promise<void> => {
    call(
        "libgobject-2.0.so.0",
        "g_signal_emit_by_name",
        [{ type: { type: "gobject" }, value: element.id }, { type: { type: "string" }, value: signalName }, ...args],
        { type: "undefined" },
    );

    await tick();
};

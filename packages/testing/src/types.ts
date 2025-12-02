import type * as Gtk from "@gtkx/ffi/gtk";
import type { AccessibleRole } from "@gtkx/ffi/gtk";
import type { ReactNode } from "react";

export interface ByRoleOptions {
    name?: string | RegExp;
}

export interface WaitForOptions {
    timeout?: number;
    interval?: number;
}

export interface RenderResult {
    container: Gtk.Application;
    getByRole: (role: AccessibleRole, options?: ByRoleOptions) => Gtk.Widget;
    getByLabelText: (text: string | RegExp) => Gtk.Widget;
    getByText: (text: string | RegExp) => Gtk.Widget;
    findByRole: (role: AccessibleRole, options?: ByRoleOptions) => Promise<Gtk.Widget>;
    findByLabelText: (text: string | RegExp) => Promise<Gtk.Widget>;
    findByText: (text: string | RegExp) => Promise<Gtk.Widget>;
    unmount: () => void;
    rerender: (element: ReactNode) => void;
    debug: () => void;
}

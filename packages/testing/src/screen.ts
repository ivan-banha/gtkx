import type * as Gtk from "@gtkx/ffi/gtk";
import type { AccessibleRole } from "@gtkx/ffi/gtk";
import * as queries from "./queries.js";
import type { ByRoleOptions } from "./types.js";

let currentRoot: Gtk.Application | null = null;

export const setScreenRoot = (root: Gtk.Application | null): void => {
    currentRoot = root;
};

const getRoot = (): Gtk.Application => {
    if (!currentRoot) {
        throw new Error("No render has been performed. Call render() before using screen queries.");
    }
    return currentRoot;
};

export const screen = {
    getByRole: (role: AccessibleRole, options?: ByRoleOptions) => queries.getByRole(getRoot(), role, options),
    getByLabelText: (text: string | RegExp) => queries.getByLabelText(getRoot(), text),
    getByText: (text: string | RegExp) => queries.getByText(getRoot(), text),
    findByRole: (role: AccessibleRole, options?: ByRoleOptions) => queries.findByRole(getRoot(), role, options),
    findByLabelText: (text: string | RegExp) => queries.findByLabelText(getRoot(), text),
    findByText: (text: string | RegExp) => queries.findByText(getRoot(), text),
    debug: () => {
        console.log("Screen debug - root:", getRoot());
    },
};

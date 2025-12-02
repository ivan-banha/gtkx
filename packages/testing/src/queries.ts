import type * as Gtk from "@gtkx/ffi/gtk";
import { type Accessible, AccessibleRole } from "@gtkx/ffi/gtk";
import { call } from "@gtkx/native";
import { findAll } from "./traversal.js";
import type { ByRoleOptions } from "./types.js";
import { waitFor } from "./wait-for.js";

type Container = Gtk.Application | Gtk.Widget;

const matchText = (actual: string | null, expected: string | RegExp): boolean => {
    if (actual === null) return false;
    return typeof expected === "string" ? actual === expected : expected.test(actual);
};

type WidgetWithPtr = { ptr: unknown };

const getWidgetPtr = (widget: unknown): unknown | null => {
    const w = widget as WidgetWithPtr;
    return w.ptr ?? null;
};

const callGetter = (ptr: unknown, funcName: string): string | null => {
    const result = call("libgtk-4.so.1", funcName, [{ type: { type: "gobject" }, value: ptr }], {
        type: "string",
        borrowed: true,
    });
    return result as string | null;
};

const isInternalLabel = (widget: Gtk.Widget): boolean => {
    const accessible = widget as unknown as Accessible;
    if (accessible.getAccessibleRole() !== AccessibleRole.LABEL) return false;

    const parent = widget.getParent();
    if (!parent) return false;

    const parentAccessible = parent as unknown as Accessible;
    const parentRole = parentAccessible.getAccessibleRole();

    return (
        parentRole === AccessibleRole.BUTTON ||
        parentRole === AccessibleRole.TOGGLE_BUTTON ||
        parentRole === AccessibleRole.CHECKBOX ||
        parentRole === AccessibleRole.RADIO ||
        parentRole === AccessibleRole.MENU_ITEM ||
        parentRole === AccessibleRole.MENU_ITEM_CHECKBOX ||
        parentRole === AccessibleRole.MENU_ITEM_RADIO
    );
};

const getWidgetText = (widget: Gtk.Widget): string | null => {
    const ptr = getWidgetPtr(widget);
    if (!ptr) return null;

    if (isInternalLabel(widget)) return null;

    const accessible = widget as unknown as Accessible;
    const role = accessible.getAccessibleRole();

    switch (role) {
        case AccessibleRole.BUTTON:
        case AccessibleRole.TOGGLE_BUTTON:
        case AccessibleRole.CHECKBOX:
        case AccessibleRole.RADIO:
        case AccessibleRole.MENU_ITEM:
        case AccessibleRole.MENU_ITEM_CHECKBOX:
        case AccessibleRole.MENU_ITEM_RADIO:
            return callGetter(ptr, "gtk_button_get_label");
        case AccessibleRole.LABEL:
            return callGetter(ptr, "gtk_label_get_label");
        case AccessibleRole.TEXT_BOX:
        case AccessibleRole.SEARCH_BOX:
        case AccessibleRole.SPIN_BUTTON:
            return callGetter(ptr, "gtk_editable_get_text");
        default:
            return null;
    }
};

const formatRole = (role: AccessibleRole): string => AccessibleRole[role] ?? String(role);

export const getByRole = (container: Container, role: AccessibleRole, options?: ByRoleOptions): Gtk.Widget => {
    const matches = findAll(container, (node) => {
        const accessible = node as unknown as Accessible;
        if (accessible.getAccessibleRole() !== role) return false;
        if (options?.name) {
            const text = getWidgetText(node);
            return matchText(text, options.name);
        }
        return true;
    });

    const nameInfo = options?.name ? ` and name "${options.name}"` : "";
    const [match, ...rest] = matches;

    if (!match) {
        throw new Error(`Unable to find element with role "${formatRole(role)}"${nameInfo}`);
    }
    if (rest.length > 0) {
        throw new Error(`Found ${matches.length} elements with role "${formatRole(role)}"${nameInfo}`);
    }
    return match;
};

export const getByLabelText = (container: Container, text: string | RegExp): Gtk.Widget => {
    const matches = findAll(container, (node) => {
        const widgetText = getWidgetText(node);
        return matchText(widgetText, text);
    });

    const [match, ...rest] = matches;

    if (!match) {
        throw new Error(`Unable to find element with label text "${text}"`);
    }
    if (rest.length > 0) {
        throw new Error(`Found ${matches.length} elements with label text "${text}"`);
    }
    return match;
};

export const getByText = (container: Container, text: string | RegExp): Gtk.Widget => {
    const matches = findAll(container, (node) => {
        const widgetText = getWidgetText(node);
        return matchText(widgetText, text);
    });

    const [match, ...rest] = matches;

    if (!match) {
        throw new Error(`Unable to find element with text "${text}"`);
    }
    if (rest.length > 0) {
        throw new Error(`Found ${matches.length} elements with text "${text}"`);
    }
    return match;
};

export const findByRole = async (
    container: Container,
    role: AccessibleRole,
    options?: ByRoleOptions,
): Promise<Gtk.Widget> => waitFor(() => getByRole(container, role, options));

export const findByLabelText = async (container: Container, text: string | RegExp): Promise<Gtk.Widget> =>
    waitFor(() => getByLabelText(container, text));

export const findByText = async (container: Container, text: string | RegExp): Promise<Gtk.Widget> =>
    waitFor(() => getByText(container, text));

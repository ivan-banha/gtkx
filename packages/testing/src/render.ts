import { start, stop } from "@gtkx/ffi";
import type { Accessible, AccessibleRole } from "@gtkx/ffi/gtk";
import * as Gtk from "@gtkx/ffi/gtk";
import { reconciler } from "@gtkx/react";
import type { ReactNode } from "react";
import type Reconciler from "react-reconciler";
import { beforeAll } from "vitest";
import * as queries from "./queries.js";
import { setScreenRoot } from "./screen.js";
import type { ByRoleOptions, RenderResult } from "./types.js";

const APP_ID = "com.gtkx.testing";

let app: Gtk.Application | null = null;
let container: Reconciler.FiberRoot | null = null;

export const setup = (): void => {
    beforeAll(() => {
        if (!app) {
            app = start(APP_ID);
            reconciler.setApp(app);
        }
    });
};

type WidgetWithLabel = { getLabel: () => string | null };

const hasGetLabel = (widget: unknown): widget is WidgetWithLabel =>
    typeof (widget as WidgetWithLabel).getLabel === "function";

const printWidgetTree = (root: Gtk.Widget, indent = 0): string => {
    const accessible = root as unknown as Accessible;
    const prefix = "  ".repeat(indent);
    const role = Gtk.AccessibleRole[accessible.getAccessibleRole()] ?? "UNKNOWN";
    const label = hasGetLabel(root) ? ` label="${root.getLabel()}"` : "";
    let result = `${prefix}<${root.constructor.name} role=${role}${label}>\n`;

    let child = root.getFirstChild();
    while (child) {
        result += printWidgetTree(child, indent + 1);
        child = child.getNextSibling();
    }

    return result;
};

type ReconcilerInstance = ReturnType<typeof reconciler.getInstance>;

const updateSync = (instance: ReconcilerInstance, element: ReactNode, fiberRoot: Reconciler.FiberRoot): void => {
    const instanceAny = instance as unknown as Record<string, unknown>;

    if (typeof instanceAny.flushSync === "function") {
        (instanceAny.flushSync as (fn: () => void) => void)(() => {
            instance.updateContainer(element, fiberRoot, null, () => {});
        });
    } else {
        if (typeof instanceAny.updateContainerSync === "function") {
            (instanceAny.updateContainerSync as typeof instance.updateContainer)(element, fiberRoot, null, () => {});
        } else {
            instance.updateContainer(element, fiberRoot, null, () => {});
        }
        if (typeof instanceAny.flushSyncWork === "function") {
            (instanceAny.flushSyncWork as () => void)();
        }
    }

    instance.flushPassiveEffects();
};

const ensureInitialized = (): { app: Gtk.Application; container: Reconciler.FiberRoot } => {
    if (!app) {
        try {
            app = reconciler.getApp();
        } catch {
            app = start(APP_ID);
            reconciler.setApp(app);
        }
    }

    if (!container) {
        const instance = reconciler.getInstance();
        container = instance.createContainer(
            app,
            0,
            null,
            false,
            null,
            "",
            (error: Error) => console.error("Test reconciler error:", error),
            () => {},
            () => {},
            () => {},
            null,
        );
    }

    return { app, container };
};

export const render = (element: ReactNode): RenderResult => {
    const { app: application, container: fiberRoot } = ensureInitialized();
    const instance = reconciler.getInstance();

    updateSync(instance, element, fiberRoot);

    setScreenRoot(application);

    return {
        container: application,
        getByRole: (role: AccessibleRole, options?: ByRoleOptions) => queries.getByRole(application, role, options),
        getByLabelText: (text: string | RegExp) => queries.getByLabelText(application, text),
        getByText: (text: string | RegExp) => queries.getByText(application, text),
        findByRole: (role: AccessibleRole, options?: ByRoleOptions) => queries.findByRole(application, role, options),
        findByLabelText: (text: string | RegExp) => queries.findByLabelText(application, text),
        findByText: (text: string | RegExp) => queries.findByText(application, text),
        unmount: () => updateSync(instance, null, fiberRoot),
        rerender: (newElement: ReactNode) => updateSync(instance, newElement, fiberRoot),
        debug: () => {
            const activeWindow = application.getActiveWindow();
            if (activeWindow) {
                console.log(printWidgetTree(activeWindow));
            }
        },
    };
};

export const cleanup = (): void => {
    if (container && app) {
        const instance = reconciler.getInstance();
        updateSync(instance, null, container);
        for (const window of app.getWindows()) {
            window.destroy();
        }
    }
    container = null;
    setScreenRoot(null);
};

export const teardown = (): void => {
    if (app) {
        cleanup();
        stop();
        app = null;
        container = null;
    }
};

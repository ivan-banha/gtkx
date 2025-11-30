import { start, stop } from "@gtkx/ffi";
import type * as Gtk from "@gtkx/ffi/gtk";
import type React from "react";
import type Reconciler from "react-reconciler";
import { afterAll, beforeAll } from "vitest";
import { reconciler } from "../src/reconciler.js";

const APP_ID = "com.gtkx.test.react";

let app: Gtk.Application | null = null;
let container: unknown = null;
let isInitialized = false;

export const getApp = (): Gtk.Application => {
    if (!app) {
        throw new Error("GTK app not initialized");
    }
    return app;
};

export const renderElement = (element: React.ReactNode): void => {
    reconciler.getInstance().updateContainer(element, container, null, () => {});
};

export const unmountAll = (): void => {
    reconciler.getInstance().updateContainer(null, container, null, () => {});
};

export const setupReactTests = () => {
    beforeAll(() => {
        if (!isInitialized) {
            app = start(APP_ID);
            reconciler.setApp(app);
            container = reconciler.getInstance().createContainer(
                APP_ID as unknown as Gtk.Application,
                0,
                null,
                false,
                false,
                "",
                (error: Error) => console.error("Test reconciler error:", error),
                (_error: Error, _info: Reconciler.BaseErrorInfo) => {},
                (_error: Error, _info: Reconciler.BaseErrorInfo) => {},
                () => {},
                null,
            );
            isInitialized = true;
        }
    });

    afterAll(() => {
        unmountAll();
    });
};

export const globalTeardown = () => {
    if (isInitialized) {
        unmountAll();
        stop();
        isInitialized = false;
        app = null;
        container = null;
    }
};

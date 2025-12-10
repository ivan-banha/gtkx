import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as Gtk from "../src/generated/gtk/index.js";
import { getCurrentApp, getObject, registerType, start, stop } from "../src/native.js";

const APP_ID = "com.gtkx.test.ffi";

describe("native module", () => {
    beforeAll(() => {
        registerType(Gtk.Application);
        registerType(Gtk.Widget);
        registerType(Gtk.Button);
        registerType(Gtk.Label);
        registerType(Gtk.Entry);
        registerType(Gtk.Box);
        registerType(Gtk.Window);
        registerType(Gtk.ApplicationWindow);
        start(APP_ID);
    });

    afterAll(() => {
        stop();
    });

    describe("instanceof with dynamic getObject", () => {
        it("returns true for exact type match", () => {
            const button = new Gtk.Button();
            expect(button instanceof Gtk.Button).toBe(true);
        });

        it("returns true for parent type match", () => {
            const button = new Gtk.Button();
            expect(button instanceof Gtk.Widget).toBe(true);
        });

        it("returns false for non-matching type", () => {
            const button = new Gtk.Button();
            expect(button instanceof Gtk.Label).toBe(false);
        });

        it("returns false when checking child type against parent instance", () => {
            const widget = new Gtk.Box(Gtk.Orientation.HORIZONTAL, 0);
            expect(widget instanceof Gtk.Button).toBe(false);
        });

        it("works with ApplicationWindow", () => {
            const app = getCurrentApp();
            const window = new Gtk.ApplicationWindow(app);
            expect(window instanceof Gtk.ApplicationWindow).toBe(true);
            expect(window instanceof Gtk.Window).toBe(true);
            expect(window instanceof Gtk.Button).toBe(false);
        });

        it("works with Box", () => {
            const box = new Gtk.Box(Gtk.Orientation.VERTICAL, 10);
            expect(box instanceof Gtk.Box).toBe(true);
            expect(box instanceof Gtk.Label).toBe(false);
        });

        it("works with Label", () => {
            const label = new Gtk.Label("Test");
            expect(label instanceof Gtk.Label).toBe(true);
            expect(label instanceof Gtk.Button).toBe(false);
        });

        it("works with Entry", () => {
            const entry = new Gtk.Entry();
            expect(entry instanceof Gtk.Entry).toBe(true);
            expect(entry instanceof Gtk.Label).toBe(false);
        });

        it("getObject wraps with correct runtime type", () => {
            const button = new Gtk.Button();
            const wrapped = getObject<Gtk.Widget>(button.id);
            expect(wrapped instanceof Gtk.Button).toBe(true);
            expect(wrapped instanceof Gtk.Widget).toBe(true);
            expect(wrapped instanceof Gtk.Label).toBe(false);
        });

        it("can narrow types correctly", () => {
            const widgets: Gtk.Widget[] = [new Gtk.Button(), new Gtk.Label("Test"), new Gtk.Entry()];

            const buttons = widgets.filter((w): w is Gtk.Button => w instanceof Gtk.Button);
            expect(buttons.length).toBe(1);
            expect(buttons[0] instanceof Gtk.Button).toBe(true);

            const labels = widgets.filter((w): w is Gtk.Label => w instanceof Gtk.Label);
            expect(labels.length).toBe(1);
            expect(labels[0] instanceof Gtk.Label).toBe(true);
        });
    });

    describe("glibTypeName static property", () => {
        it("is defined on Widget", () => {
            expect(Gtk.Widget.glibTypeName).toBe("GtkWidget");
        });

        it("is defined on Button", () => {
            expect(Gtk.Button.glibTypeName).toBe("GtkButton");
        });

        it("is defined on Label", () => {
            expect(Gtk.Label.glibTypeName).toBe("GtkLabel");
        });

        it("is defined on ApplicationWindow", () => {
            expect(Gtk.ApplicationWindow.glibTypeName).toBe("GtkApplicationWindow");
        });

        it("is defined on Box", () => {
            expect(Gtk.Box.glibTypeName).toBe("GtkBox");
        });

        it("is defined on Entry", () => {
            expect(Gtk.Entry.glibTypeName).toBe("GtkEntry");
        });
    });
});

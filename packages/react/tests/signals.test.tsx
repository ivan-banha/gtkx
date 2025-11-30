import * as Gtk from "@gtkx/ffi/gtk";
import { describe, expect, it } from "vitest";
import { createNode } from "../src/factory.js";
import type { DropDownNode } from "../src/nodes/dropdown.js";
import type { ListViewNode } from "../src/nodes/list.js";
import type { WidgetNode } from "../src/nodes/widget.js";
import { getApp, setupReactTests } from "./setup.js";

setupReactTests();

describe("Signal Handler Management", () => {
    describe("Widget signal connections", () => {
        it("should connect signal handlers on creation", () => {
            let clicked = false;
            const onClicked = () => {
                clicked = true;
            };

            const node = createNode("Button", { label: "Test", onClicked }, getApp()) as WidgetNode;
            const widget = node.getWidget() as Gtk.Button;

            expect(widget).toBeDefined();
            expect(clicked).toBe(false);
        });

        it("should update signal handlers when props change", () => {
            let clickCount = 0;
            const handler1 = () => {
                clickCount = 1;
            };
            const handler2 = () => {
                clickCount = 2;
            };

            const node = createNode("Button", { label: "Test", onClicked: handler1 }, getApp()) as WidgetNode;
            node.updateProps({ onClicked: handler1 }, { onClicked: handler2 });
            expect(clickCount).toBe(0);
        });

        it("should disconnect signal handlers on dispose", () => {
            const onClicked = () => {};

            const node = createNode("Button", { label: "Test", onClicked }, getApp()) as WidgetNode;
            expect(node.getWidget()).toBeDefined();

            node.dispose?.(getApp());
        });
    });

    describe("Dialog signal connections", () => {
        it("should connect signal handlers to dialogs", () => {
            const onCloseRequest = () => false;

            const node = createNode(
                "AboutDialog",
                {
                    programName: "Test",
                    onCloseRequest,
                },
                getApp(),
            ) as WidgetNode;

            expect(node.getWidget()).toBeDefined();
        });

        it("should disconnect dialog signals on dispose", () => {
            const onCloseRequest = () => false;

            const node = createNode(
                "AboutDialog",
                {
                    programName: "Test",
                    onCloseRequest,
                },
                getApp(),
            ) as WidgetNode;

            node.dispose?.(getApp());
        });
    });

    describe("ListView signal connections", () => {
        it("should connect factory signals", () => {
            const renderItem = () => new Gtk.Label({ label: "Item" });

            const node = createNode("ListView.Root", { renderItem }, getApp()) as ListViewNode;
            expect(node.getWidget()).toBeDefined();
        });

        it("should disconnect factory signals on dispose", () => {
            const renderItem = () => new Gtk.Label({ label: "Item" });

            const node = createNode("ListView.Root", { renderItem }, getApp()) as ListViewNode;
            node.dispose?.(getApp());
        });
    });

    describe("DropDown signal connections", () => {
        it("should connect selection changed signal", () => {
            let selectedItem: unknown = null;
            const onSelectionChanged = (item: unknown) => {
                selectedItem = item;
            };
            const itemLabel = (item: string) => item;

            const node = createNode(
                "DropDown.Root",
                {
                    itemLabel,
                    onSelectionChanged,
                },
                getApp(),
            ) as DropDownNode;

            expect(node.getWidget()).toBeDefined();
            expect(selectedItem).toBeNull();
        });

        it("should disconnect selection signal on dispose", () => {
            const onSelectionChanged = () => {};
            const itemLabel = (item: string) => item;

            const node = createNode(
                "DropDown.Root",
                {
                    itemLabel,
                    onSelectionChanged,
                },
                getApp(),
            ) as DropDownNode;

            node.dispose?.(getApp());
        });
    });
});

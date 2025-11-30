import * as Gtk from "@gtkx/ffi/gtk";
import { describe, it } from "vitest";
import { createNode } from "../src/factory.js";
import type { DropDownItemNode, DropDownNode } from "../src/nodes/dropdown.js";
import type { GridChildNode, GridNode } from "../src/nodes/grid.js";
import type { ListItemNode, ListViewNode } from "../src/nodes/list.js";
import type { WidgetNode } from "../src/nodes/widget.js";
import { getApp, setupReactTests } from "./setup.js";

setupReactTests();

describe("Widget Disposal and Memory Management", () => {
    it("should dispose widgets without errors", () => {
        const nodes = [];
        for (let i = 0; i < 100; i++) {
            nodes.push(createNode("Label", { label: `Label ${i}` }, getApp()));
        }

        for (const node of nodes) {
            node.dispose?.(getApp());
        }
    });

    it("should handle disposal of complex widget trees", () => {
        const createTree = (depth: number): ReturnType<typeof createNode> => {
            const box = createNode("Box", { orientation: Gtk.Orientation.VERTICAL, spacing: 5 }, getApp());

            if (depth > 0) {
                const child1 = createTree(depth - 1);
                const child2 = createTree(depth - 1);
                box.appendChild(child1);
                box.appendChild(child2);
            } else {
                const label = createNode("Label", { label: "Leaf" }, getApp());
                box.appendChild(label);
            }

            return box;
        };

        const tree = createTree(4);
        tree.dispose?.(getApp());
    });

    it("should handle disposal with signal handlers attached", () => {
        const handlers: Array<() => void> = [];
        const nodes = [];

        for (let i = 0; i < 50; i++) {
            const handler = () => console.log(`Button ${i} clicked`);
            handlers.push(handler);
            nodes.push(createNode("Button", { label: `Button ${i}`, onClicked: handler }, getApp()));
        }

        for (const node of nodes) {
            node.dispose?.(getApp());
        }
    });

    it("should handle ListView with items disposal", () => {
        const renderItem = () => new Gtk.Label({ label: "Item" });
        const listView = createNode("ListView.Root", { renderItem }, getApp()) as ListViewNode;

        for (let i = 0; i < 20; i++) {
            const item = createNode("ListView.Item", { item: { id: i } }, getApp()) as ListItemNode;
            listView.appendChild(item);
        }

        listView.dispose?.(getApp());
    });

    it("should handle DropDown with items disposal", () => {
        const itemLabel = (item: { name: string }) => item.name;
        const dropdown = createNode("DropDown.Root", { itemLabel }, getApp()) as DropDownNode;

        for (let i = 0; i < 20; i++) {
            const item = createNode("DropDown.Item", { item: { name: `Item ${i}` } }, getApp()) as DropDownItemNode;
            dropdown.appendChild(item);
        }

        dropdown.dispose?.(getApp());
    });

    it("should handle Grid with children disposal", () => {
        const grid = createNode("Grid", { rowSpacing: 10, columnSpacing: 10 }, getApp()) as GridNode;

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const child = createNode(
                    "Grid.Child",
                    {
                        row,
                        column: col,
                    },
                    getApp(),
                ) as GridChildNode;
                const button = createNode("Button", { label: `${row},${col}` }, getApp());
                child.appendChild(button);
                grid.appendChild(child);
            }
        }

        grid.dispose?.(getApp());
    });

    it("should handle Notebook with pages disposal", () => {
        const notebook = createNode("Notebook", {}, getApp()) as WidgetNode;

        for (let i = 0; i < 10; i++) {
            const page = createNode("Box", { orientation: Gtk.Orientation.VERTICAL, spacing: 5 }, getApp());
            const label = createNode("Label", { label: `Page ${i}` }, getApp());
            page.appendChild(label);
            notebook.appendChild(page);
        }

        notebook.dispose?.(getApp());
    });
});

describe("App Shutdown and Signal Cleanup", () => {
    it("should dispose all instances when unmounting", () => {
        const onClicked = () => {};

        const node1 = createNode("Button", { label: "Button 1", onClicked }, getApp());
        const node2 = createNode("Button", { label: "Button 2", onClicked }, getApp());
        const node3 = createNode("Button", { label: "Button 3", onClicked }, getApp());

        node1.dispose?.(getApp());
        node2.dispose?.(getApp());
        node3.dispose?.(getApp());
    });

    it("should handle rapid mount/unmount cycles", () => {
        for (let i = 0; i < 10; i++) {
            const node = createNode("Button", { label: `Button ${i}` }, getApp());
            node.dispose?.(getApp());
        }
    });

    it("should clean up nested widget hierarchies", () => {
        const boxNode = createNode("Box", { orientation: Gtk.Orientation.VERTICAL, spacing: 10 }, getApp());
        const button1 = createNode("Button", { label: "Button 1" }, getApp());
        const button2 = createNode("Button", { label: "Button 2" }, getApp());

        boxNode.appendChild(button1);
        boxNode.appendChild(button2);

        boxNode.removeChild(button1);
        boxNode.removeChild(button2);

        button1.dispose?.(getApp());
        button2.dispose?.(getApp());
        boxNode.dispose?.(getApp());
    });
});

describe("Multiple Windows and Dialogs", () => {
    it("should handle multiple ApplicationWindows", () => {
        const window1 = createNode("ApplicationWindow", { title: "Window 1" }, getApp());
        const window2 = createNode("ApplicationWindow", { title: "Window 2" }, getApp());

        window1.dispose?.(getApp());
        window2.dispose?.(getApp());
    });

    it("should handle multiple dialogs", () => {
        const dialog1 = createNode("AboutDialog", { programName: "App 1" }, getApp());
        const dialog2 = createNode("AboutDialog", { programName: "App 2" }, getApp());

        dialog1.dispose?.(getApp());
        dialog2.dispose?.(getApp());
    });

    it("should clean up dialogs with connected signals", () => {
        const onCloseRequest1 = () => false;
        const onCloseRequest2 = () => false;

        const dialog1 = createNode(
            "AboutDialog",
            {
                programName: "App 1",
                onCloseRequest: onCloseRequest1,
            },
            getApp(),
        );
        const dialog2 = createNode(
            "AboutDialog",
            {
                programName: "App 2",
                onCloseRequest: onCloseRequest2,
            },
            getApp(),
        );

        dialog1.dispose?.(getApp());
        dialog2.dispose?.(getApp());
    });

    it("should handle window with child widgets", () => {
        const window = createNode("ApplicationWindow", { title: "Test" }, getApp());
        const box = createNode("Box", { orientation: Gtk.Orientation.VERTICAL, spacing: 10 }, getApp());
        const button = createNode("Button", { label: "Click", onClicked: () => {} }, getApp());

        window.appendChild(box);
        box.appendChild(button);

        window.removeChild(box);

        button.dispose?.(getApp());
        box.dispose?.(getApp());
        window.dispose?.(getApp());
    });
});

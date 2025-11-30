import * as Gtk from "@gtkx/ffi/gtk";
import { describe, expect, it } from "vitest";
import { createNode } from "../src/factory.js";
import { DropDownItemNode, DropDownNode } from "../src/nodes/dropdown.js";
import { GridChildNode, GridNode } from "../src/nodes/grid.js";
import { ListItemNode, ListViewNode } from "../src/nodes/list.js";
import { WidgetNode } from "../src/nodes/widget.js";
import { getApp, setupReactTests } from "./setup.js";

setupReactTests();

describe("Node Creation and Matching", () => {
    describe("WidgetNode", () => {
        it("should create WidgetNode for Button", () => {
            const node = createNode("Button", { label: "Test" }, getApp());
            expect(node).toBeInstanceOf(WidgetNode);
            expect(node.getWidget()).toBeDefined();
        });

        it("should create ApplicationWindow with app reference", () => {
            const node = createNode("ApplicationWindow", { title: "Test Window" }, getApp());
            expect(node).toBeInstanceOf(WidgetNode);
            expect(node.getWidget()).toBeDefined();
        });

        it("should create Box with orientation", () => {
            const node = createNode("Box", { spacing: 10, orientation: Gtk.Orientation.VERTICAL }, getApp());
            expect(node).toBeInstanceOf(WidgetNode);
        });

        it("should create Label with text", () => {
            const node = createNode("Label", { label: "Hello World" }, getApp());
            expect(node).toBeInstanceOf(WidgetNode);
        });
    });

    describe("AboutDialog", () => {
        it("should create as WidgetNode", () => {
            const node = createNode("AboutDialog", { programName: "Test App" }, getApp());
            expect(node).toBeInstanceOf(WidgetNode);
            expect(node.getWidget()).toBeInstanceOf(Gtk.AboutDialog);
        });
    });

    describe("ListViewNode", () => {
        it("should match ListView.Root type", () => {
            expect(ListViewNode.matches("ListView.Root")).toBe(true);
        });

        it("should not match plain ListView type", () => {
            expect(ListViewNode.matches("ListView")).toBe(false);
        });

        it("should create with factory", () => {
            const renderItem = () => new Gtk.Label({ label: "Item" });
            const node = createNode("ListView.Root", { renderItem }, getApp()) as ListViewNode;
            expect(node).toBeInstanceOf(ListViewNode);
            expect(node.getWidget()).toBeDefined();
        });
    });

    describe("ListItemNode", () => {
        it("should match ListView.Item type", () => {
            expect(ListItemNode.matches("ListView.Item")).toBe(true);
        });

        it("should match ColumnView.Item type", () => {
            expect(ListItemNode.matches("ColumnView.Item")).toBe(true);
        });

        it("should match GridView.Item type", () => {
            expect(ListItemNode.matches("GridView.Item")).toBe(true);
        });

        it("should not match non-Item types", () => {
            expect(ListItemNode.matches("ListView")).toBe(false);
            expect(ListItemNode.matches("Button")).toBe(false);
        });
    });

    describe("DropDownNode", () => {
        it("should match DropDown.Root type", () => {
            expect(DropDownNode.matches("DropDown.Root")).toBe(true);
        });

        it("should not match plain DropDown type", () => {
            expect(DropDownNode.matches("DropDown")).toBe(false);
        });

        it("should create with label function", () => {
            const itemLabel = (item: { name: string }) => item.name;
            const node = createNode("DropDown.Root", { itemLabel }, getApp());
            expect(node).toBeInstanceOf(DropDownNode);
        });
    });

    describe("DropDownItemNode", () => {
        it("should match DropDown.Item type", () => {
            expect(DropDownItemNode.matches("DropDown.Item")).toBe(true);
        });

        it("should not match other types", () => {
            expect(DropDownItemNode.matches("DropDown")).toBe(false);
            expect(DropDownItemNode.matches("ListView.Item")).toBe(false);
        });
    });

    describe("GridNode", () => {
        it("should match Grid.Root type", () => {
            expect(GridNode.matches("Grid.Root")).toBe(true);
        });

        it("should not match plain Grid type", () => {
            expect(GridNode.matches("Grid")).toBe(false);
        });
    });

    describe("GridChildNode", () => {
        it("should match Grid.Child type", () => {
            expect(GridChildNode.matches("Grid.Child")).toBe(true);
        });

        it("should not match other types", () => {
            expect(GridChildNode.matches("Grid")).toBe(false);
        });
    });

    describe("Notebook", () => {
        it("should create as WidgetNode", () => {
            const node = createNode("Notebook", {}, getApp());
            expect(node).toBeInstanceOf(WidgetNode);
            expect(node.getWidget()).toBeInstanceOf(Gtk.Notebook);
        });
    });
});

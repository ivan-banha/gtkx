import * as Gtk from "@gtkx/ffi/gtk";
import { describe, expect, it } from "vitest";
import { createNode } from "../src/factory.js";
import { getApp, setupReactTests } from "./setup.js";

setupReactTests();

describe("Edge Cases", () => {
    it("should handle empty children", () => {
        const node = createNode("Box", { orientation: Gtk.Orientation.VERTICAL, spacing: 10 }, getApp());
        expect(node.getWidget()).toBeDefined();
    });

    it("should handle null/undefined props", () => {
        const node = createNode("Button", { label: undefined }, getApp());
        expect(node.getWidget()).toBeDefined();
    });

    it("should handle rapid prop updates", () => {
        const node = createNode("Button", { label: "Initial" }, getApp());

        for (let i = 0; i < 100; i++) {
            node.updateProps({ label: `Label ${i - 1}` }, { label: `Label ${i}` });
        }
    });

    it("should handle adding and removing same child", () => {
        const parent = createNode("Box", { orientation: Gtk.Orientation.VERTICAL, spacing: 10 }, getApp());
        const child = createNode("Label", { label: "Test" }, getApp());

        for (let i = 0; i < 10; i++) {
            parent.appendChild(child);
            parent.removeChild(child);
        }
    });

    it("should handle disposing already disposed node", () => {
        const node = createNode("Button", { label: "Test" }, getApp());
        node.dispose?.(getApp());
        node.dispose?.(getApp());
    });
});

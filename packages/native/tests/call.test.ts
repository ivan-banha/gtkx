import { describe, expect, it } from "vitest";
import { call, createRef } from "../index.js";
import { GIO_LIB, GOBJECT_LIB, GTK_LIB } from "./test-setup.js";

describe("call", () => {
    describe("primitive types", () => {
        it("passes and returns boolean values", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Test" }], {
                type: "gobject",
            });

            call(
                GTK_LIB,
                "gtk_label_set_selectable",
                [
                    { type: { type: "gobject" }, value: label },
                    { type: { type: "boolean" }, value: true },
                ],
                { type: "undefined" },
            );

            const result = call(
                GTK_LIB,
                "gtk_label_get_selectable",
                [{ type: { type: "gobject", borrowed: true }, value: label }],
                { type: "boolean" },
            );

            expect(result).toBe(true);
        });

        it("passes and returns integer values", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Test" }], {
                type: "gobject",
            });

            call(
                GTK_LIB,
                "gtk_label_set_max_width_chars",
                [
                    { type: { type: "gobject" }, value: label },
                    { type: { type: "int", size: 32 }, value: 42 },
                ],
                { type: "undefined" },
            );

            const result = call(
                GTK_LIB,
                "gtk_label_get_max_width_chars",
                [{ type: { type: "gobject", borrowed: true }, value: label }],
                { type: "int", size: 32 },
            );

            expect(result).toBe(42);
        });

        it("passes and returns float values", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Test" }], {
                type: "gobject",
            });

            call(
                GTK_LIB,
                "gtk_widget_set_opacity",
                [
                    { type: { type: "gobject" }, value: label },
                    { type: { type: "float", size: 64 }, value: 0.75 },
                ],
                { type: "undefined" },
            );

            const result = call(
                GTK_LIB,
                "gtk_widget_get_opacity",
                [{ type: { type: "gobject", borrowed: true }, value: label }],
                { type: "float", size: 64 },
            );

            expect(result).toBeCloseTo(0.75);
        });
    });

    describe("string types", () => {
        it("passes and returns string values", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Initial" }], {
                type: "gobject",
            });

            call(
                GTK_LIB,
                "gtk_label_set_text",
                [
                    { type: { type: "gobject" }, value: label },
                    { type: { type: "string" }, value: "Updated" },
                ],
                { type: "undefined" },
            );

            const result = call(
                GTK_LIB,
                "gtk_label_get_text",
                [{ type: { type: "gobject", borrowed: true }, value: label }],
                { type: "string" },
            );

            expect(result).toBe("Updated");
        });

        it("handles empty strings", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "" }], {
                type: "gobject",
            });

            const result = call(
                GTK_LIB,
                "gtk_label_get_text",
                [{ type: { type: "gobject", borrowed: true }, value: label }],
                { type: "string" },
            );

            expect(result).toBe("");
        });

        it("handles unicode strings", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Hello 世界 🎉" }], {
                type: "gobject",
            });

            const result = call(
                GTK_LIB,
                "gtk_label_get_text",
                [{ type: { type: "gobject", borrowed: true }, value: label }],
                { type: "string" },
            );

            expect(result).toBe("Hello 世界 🎉");
        });
    });

    describe("gobject types", () => {
        it("creates and returns GObjects", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Test" }], {
                type: "gobject",
            });

            expect(label).toBeDefined();
            expect(typeof label).toBe("object");
        });

        it("passes GObjects to functions", () => {
            const box = call(
                GTK_LIB,
                "gtk_box_new",
                [
                    { type: { type: "int", size: 32 }, value: 0 },
                    { type: { type: "int", size: 32 }, value: 0 },
                ],
                { type: "gobject" },
            );

            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Test" }], {
                type: "gobject",
            });

            call(
                GTK_LIB,
                "gtk_box_append",
                [
                    { type: { type: "gobject" }, value: box },
                    { type: { type: "gobject" }, value: label },
                ],
                { type: "undefined" },
            );

            const firstChild = call(
                GTK_LIB,
                "gtk_widget_get_first_child",
                [{ type: { type: "gobject", borrowed: true }, value: box }],
                { type: "gobject", borrowed: true },
            );

            expect(firstChild).toBeDefined();
        });
    });

    describe("array types", () => {
        it("passes string arrays", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Test" }], {
                type: "gobject",
            });

            call(
                GTK_LIB,
                "gtk_widget_set_css_classes",
                [
                    { type: { type: "gobject" }, value: label },
                    { type: { type: "array", itemType: { type: "string" } }, value: ["class-a", "class-b"] },
                ],
                { type: "undefined" },
            );

            const result = call(
                GTK_LIB,
                "gtk_widget_get_css_classes",
                [{ type: { type: "gobject", borrowed: true }, value: label }],
                { type: "array", itemType: { type: "string" } },
            );

            expect(result).toEqual(["class-a", "class-b"]);
        });

        it("handles empty arrays", () => {
            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Test" }], {
                type: "gobject",
            });

            call(
                GTK_LIB,
                "gtk_widget_set_css_classes",
                [
                    { type: { type: "gobject" }, value: label },
                    { type: { type: "array", itemType: { type: "string" } }, value: [] },
                ],
                { type: "undefined" },
            );

            const result = call(
                GTK_LIB,
                "gtk_widget_get_css_classes",
                [{ type: { type: "gobject", borrowed: true }, value: label }],
                { type: "array", itemType: { type: "string" } },
            );

            expect(result).toEqual([]);
        });
    });

    describe("ref types", () => {
        it("populates ref parameters with output values", () => {
            const minRef = createRef(0);
            const naturalRef = createRef(0);

            const label = call(GTK_LIB, "gtk_label_new", [{ type: { type: "string" }, value: "Test Label" }], {
                type: "gobject",
            });

            call(
                GTK_LIB,
                "gtk_widget_measure",
                [
                    { type: { type: "gobject" }, value: label },
                    { type: { type: "int", size: 32 }, value: 0 },
                    { type: { type: "int", size: 32 }, value: 100 },
                    { type: { type: "ref", innerType: { type: "int", size: 32 } }, value: minRef },
                    { type: { type: "ref", innerType: { type: "int", size: 32 } }, value: naturalRef },
                    { type: { type: "null" }, value: null },
                    { type: { type: "null" }, value: null },
                ],
                { type: "undefined" },
            );

            expect(typeof minRef.value).toBe("number");
            expect(typeof naturalRef.value).toBe("number");
        });
    });

    describe("callback types", () => {
        it("accepts callback functions as arguments", () => {
            const button = call(GTK_LIB, "gtk_button_new", [], { type: "gobject" });

            const handlerId = call(
                GOBJECT_LIB,
                "g_signal_connect_data",
                [
                    { type: { type: "gobject" }, value: button },
                    { type: { type: "string" }, value: "clicked" },
                    {
                        type: { type: "callback", trampoline: "closure" },
                        value: () => {},
                    },
                    { type: { type: "null" }, value: null },
                    { type: { type: "null" }, value: null },
                    { type: { type: "int", size: 32 }, value: 0 },
                ],
                { type: "int", size: 64, unsigned: true },
            );

            expect(typeof handlerId).toBe("number");
            expect(handlerId).toBeGreaterThan(0);
        });

        it("invokes callback when signal is emitted", () => {
            const cancellable = call(GIO_LIB, "g_cancellable_new", [], { type: "gobject" });
            let callbackInvoked = false;

            call(
                GOBJECT_LIB,
                "g_signal_connect_closure",
                [
                    { type: { type: "gobject" }, value: cancellable },
                    { type: { type: "string" }, value: "cancelled" },
                    {
                        type: { type: "callback", trampoline: "closure" },
                        value: () => {
                            callbackInvoked = true;
                        },
                    },
                    { type: { type: "boolean" }, value: false },
                ],
                { type: "int", size: 64, unsigned: true },
            );

            call(GIO_LIB, "g_cancellable_cancel", [{ type: { type: "gobject" }, value: cancellable }], {
                type: "undefined",
            });

            expect(callbackInvoked).toBe(true);
        });
    });

    describe("error handling", () => {
        it("throws on invalid symbol", () => {
            expect(() => call(GTK_LIB, "nonexistent_function_xyz", [], { type: "undefined" })).toThrow();
        });
    });
});

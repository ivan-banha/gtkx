import { AccessibleRole, Orientation } from "@gtkx/ffi/gtk";
import { ApplicationWindow, Box, Button, Label } from "@gtkx/react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, setup } from "../src/index.js";

setup();

describe("Queries", () => {
    afterEach(() => {
        cleanup();
    });

    describe("findByRole", () => {
        it("finds a button by role", async () => {
            render(
                <ApplicationWindow>
                    <Button label="Click me" />
                </ApplicationWindow>,
            );

            const button = await screen.findByRole(AccessibleRole.BUTTON, { name: "Click me" });
            expect(button).toBeDefined();
        });

        it("finds a button by role and name", async () => {
            render(
                <ApplicationWindow>
                    <Box spacing={0} orientation={Orientation.VERTICAL}>
                        <Button label="First" />
                        <Button label="Second" />
                    </Box>
                </ApplicationWindow>,
            );

            const button = await screen.findByRole(AccessibleRole.BUTTON, { name: "Second" });
            expect(button).toBeDefined();
        });

        it("throws when element not found", async () => {
            render(
                <ApplicationWindow>
                    <Label.Root label="No buttons here" />
                </ApplicationWindow>,
            );

            await expect(screen.findByRole(AccessibleRole.BUTTON, { name: "NonExistent" })).rejects.toThrow(
                /Unable to find element with role/,
            );
        });
    });

    describe("findByText", () => {
        it("finds element by text content", async () => {
            render(
                <ApplicationWindow>
                    <Label.Root label="Hello World" />
                </ApplicationWindow>,
            );

            const label = await screen.findByText("Hello World");
            expect(label).toBeDefined();
        });

        it("finds element by regex", async () => {
            render(
                <ApplicationWindow>
                    <Label.Root label="Hello World" />
                </ApplicationWindow>,
            );

            const label = await screen.findByText(/Hello/);
            expect(label).toBeDefined();
        });
    });

    describe("findByLabelText", () => {
        it("finds element by label", async () => {
            render(
                <ApplicationWindow>
                    <Button label="Submit" />
                </ApplicationWindow>,
            );

            const button = await screen.findByLabelText("Submit");
            expect(button).toBeDefined();
        });
    });

    describe("render result queries", () => {
        it("returns bound queries from render", async () => {
            const { findByRole, findByText } = render(
                <ApplicationWindow>
                    <Box spacing={0} orientation={Orientation.VERTICAL}>
                        <Button label="Click" />
                        <Label.Root label="Text" />
                    </Box>
                </ApplicationWindow>,
            );

            expect(await findByRole(AccessibleRole.BUTTON, { name: "Click" })).toBeDefined();
            expect(await findByText("Text")).toBeDefined();
        });
    });
});

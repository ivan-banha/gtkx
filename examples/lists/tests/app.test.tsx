import { cleanup, render, screen } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/app.js";

describe("App Integration", () => {
    afterEach(async () => {
        await cleanup();
    });

    describe("main layout", () => {
        it("renders the application window with title", async () => {
            await render(<App />);

            const listBoxTitle = await screen.findByText("ListBox");
            expect(listBoxTitle).toBeDefined();
        });

        it("renders the first demo (ListBox) by default", async () => {
            await render(<App />);

            const listBoxDescription = await screen.findByText(/GtkListBox is a vertical container for rows/);
            expect(listBoxDescription).toBeDefined();
        });
    });

    describe("demo content availability", () => {
        it("has ListBox demo content", async () => {
            await render(<App />);

            const taskList = await screen.findByText("Task List");
            expect(taskList).toBeDefined();
        });

        it("has all task items from ListBox demo", async () => {
            await render(<App />);

            const tasks = [
                "Review pull requests",
                "Write documentation",
                "Fix reported bugs",
                "Update dependencies",
                "Add unit tests",
                "Refactor old code",
            ];

            for (const task of tasks) {
                const taskLabel = await screen.findByText(task);
                expect(taskLabel).toBeDefined();
            }
        });
    });

    describe("view stack structure", () => {
        it("renders the ListBox page", async () => {
            await render(<App />);

            const listBoxTitle = await screen.findByText("ListBox");
            expect(listBoxTitle).toBeDefined();
        });
    });

    describe("initial state", () => {
        it("shows remaining task count", async () => {
            await render(<App />);

            const remaining = await screen.findByText("4 remaining");
            expect(remaining).toBeDefined();
        });

        it("shows key features section", async () => {
            await render(<App />);

            const keyFeatures = await screen.findByText("Key Features");
            expect(keyFeatures).toBeDefined();
        });
    });

    describe("window properties", () => {
        it("renders without errors", async () => {
            const renderResult = await render(<App />);
            expect(renderResult).toBeDefined();
        });
    });
});

import { cleanup, render, screen } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/app.js";

describe("App Integration", () => {
    afterEach(async () => {
        await cleanup();
    });

    describe("main layout", () => {
        it("renders the application window with ListBox content", async () => {
            await render(<App />);

            const listBoxTitles = await screen.findAllByText("ListBox");
            expect(listBoxTitles.length).toBeGreaterThan(0);
        });

        it("renders the first demo (ListBox) by default", async () => {
            await render(<App />);

            const descriptions = await screen.findAllByText(/GtkListBox is a vertical container for rows/);
            expect(descriptions.length).toBeGreaterThan(0);
        });
    });

    describe("demo content availability", () => {
        it("has ListBox demo content", async () => {
            await render(<App />);

            const taskLists = await screen.findAllByText("Task List");
            expect(taskLists.length).toBeGreaterThan(0);
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
                const taskLabels = await screen.findAllByText(task);
                expect(taskLabels.length).toBeGreaterThan(0);
            }
        });
    });

    describe("view stack structure", () => {
        it("renders the ListBox page", async () => {
            await render(<App />);

            const listBoxTitles = await screen.findAllByText("ListBox");
            expect(listBoxTitles.length).toBeGreaterThan(0);
        });
    });

    describe("initial state", () => {
        it("shows remaining task count", async () => {
            await render(<App />);

            const remainings = await screen.findAllByText("4 remaining");
            expect(remainings.length).toBeGreaterThan(0);
        });

        it("shows key features section", async () => {
            await render(<App />);

            const keyFeatures = await screen.findAllByText("Key Features");
            expect(keyFeatures.length).toBeGreaterThan(0);
        });
    });

    describe("window properties", () => {
        it("renders without errors", async () => {
            const renderResult = await render(<App />);
            expect(renderResult).toBeDefined();
        });
    });
});
